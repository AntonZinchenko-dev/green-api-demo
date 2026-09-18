import { getClient } from '@/entities/session';
import { GreenApiError } from '@/shared/api';
import { POLLING_RETRY_DELAY_MS, RECEIVE_TIMEOUT_SECONDS } from '@/shared/config';
import { applyNotification } from './apply-notification';

const MAX_RETRY_DELAY_MS = 30_000;

export interface PollerCallbacks {
  /** Вызывается при смене доступности очереди уведомлений. */
  onConnectionChange?: (online: boolean) => void;
  /** Ошибка, о которой стоит сказать пользователю (не повторяется на каждой итерации). */
  onError?: (message: string) => void;
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

/**
 * Длинный опрос очереди уведомлений GREEN-API.
 *
 * Цикл: `receiveNotification` → обработка → `deleteNotification`.
 * При ошибках включается экспоненциальная пауза, чтобы не долбить API.
 *
 * @see https://green-api.com/v3/docs/api/receiving/technology-http-api/
 */
export class NotificationPoller {
  private controller: AbortController | null = null;
  private running = false;
  private failures = 0;
  private online = true;
  private lastReportedError: string | null = null;

  constructor(private readonly callbacks: PollerCallbacks = {}) {}

  get isRunning(): boolean {
    return this.running;
  }

  start(): void {
    if (this.running) return;

    this.running = true;
    this.failures = 0;
    this.controller = new AbortController();
    void this.loop(this.controller.signal);
  }

  stop(): void {
    this.running = false;
    this.controller?.abort();
    this.controller = null;
  }

  private setOnline(online: boolean): void {
    if (this.online === online) return;
    this.online = online;
    this.callbacks.onConnectionChange?.(online);
  }

  private reportError(message: string): void {
    if (this.lastReportedError === message) return;
    this.lastReportedError = message;
    this.callbacks.onError?.(message);
  }

  private async loop(signal: AbortSignal): Promise<void> {
    while (this.running && !signal.aborted) {
      const client = getClient();
      if (!client) {
        this.stop();
        return;
      }

      try {
        const notification = await client.receiveNotification(RECEIVE_TIMEOUT_SECONDS, signal);
        if (!this.running || signal.aborted) return;

        if (notification) {
          applyNotification(notification.body);
          // Подтверждаем обработку: иначе то же уведомление вернётся снова.
          await client.deleteNotification(notification.receiptId, signal);
        }

        this.failures = 0;
        this.lastReportedError = null;
        this.setOnline(true);
      } catch (error) {
        if (isAbort(error) || !this.running) return;

        this.failures += 1;
        this.setOnline(false);

        if (error instanceof GreenApiError) {
          // Настроенный в кабинете webhookUrl отключает HTTP-очередь — это не лечится ретраями.
          const details = typeof error.message === 'string' ? error.message : '';
          if (details.includes('custom webhook url')) {
            this.reportError(
              'В личном кабинете GREEN-API задан webhookUrl — очистите его, чтобы получать сообщения по HTTP API.',
            );
          } else if (this.failures >= 3) {
            this.reportError(error.userMessage);
          }
        } else if (this.failures >= 3) {
          this.reportError('Не удалось получить сообщения из очереди GREEN-API.');
        }

        const backoff = Math.min(
          POLLING_RETRY_DELAY_MS * 2 ** (this.failures - 1),
          MAX_RETRY_DELAY_MS,
        );
        await delay(backoff, signal);
      }
    }
  }
}
