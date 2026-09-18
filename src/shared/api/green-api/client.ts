import { GreenApiError } from './errors';
import type {
  CheckAccountRequest,
  CheckAccountResponse,
  DeleteNotificationResponse,
  GetStateInstanceResponse,
  GreenApiCredentials,
  ReceiveNotificationResponse,
  SendMessageRequest,
  SendMessageResponse,
} from './types';

/**
 * Хост API вычисляется из первых четырёх цифр idInstance:
 * 3100000001 → https://3100.api.green-api.com
 * @see https://green-api.com/v3/docs/request-format/
 */
export function resolveApiUrl(idInstance: string, override?: string): string {
  if (override?.trim()) return override.trim().replace(/\/+$/, '');

  const prefix = idInstance.trim().slice(0, 4);
  return /^\d{4}$/.test(prefix)
    ? `https://${prefix}.api.green-api.com`
    : 'https://api.green-api.com';
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  /** Дополнительный сегмент пути после apiTokenInstance (нужен deleteNotification). */
  pathSuffix?: string | number;
  signal?: AbortSignal;
}

/**
 * Тонкий типизированный клиент GREEN-API.
 *
 * Все методы вызываются по схеме
 * `{apiUrl}/waInstance{idInstance}/{method}/{apiTokenInstance}`.
 */
export class GreenApiClient {
  private readonly idInstance: string;
  private readonly apiTokenInstance: string;
  private readonly apiUrl: string;

  constructor({ idInstance, apiTokenInstance, apiUrl }: GreenApiCredentials) {
    this.idInstance = idInstance.trim();
    this.apiTokenInstance = apiTokenInstance.trim();
    this.apiUrl = resolveApiUrl(this.idInstance, apiUrl);
  }

  buildUrl(method: string, query?: RequestOptions['query'], pathSuffix?: string | number): string {
    const suffix = pathSuffix === undefined ? '' : `/${pathSuffix}`;
    const url = new URL(
      `${this.apiUrl}/waInstance${this.idInstance}/${method}/${this.apiTokenInstance}${suffix}`,
    );

    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    return url.toString();
  }

  private async request<T>(method: string, options: RequestOptions = {}): Promise<T> {
    const { method: httpMethod = 'GET', body, query, pathSuffix, signal } = options;

    let response: Response;

    try {
      response = await fetch(this.buildUrl(method, query, pathSuffix), {
        method: httpMethod,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal,
      });
    } catch (error) {
      // Пробрасываем отмену запроса как есть — её обрабатывает вызывающий код.
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      throw new GreenApiError(
        error instanceof Error ? error.message : 'Сетевая ошибка',
        0,
        error,
      );
    }

    const text = await response.text();
    const payload = parseJson(text);

    if (!response.ok) {
      throw new GreenApiError(
        extractErrorMessage(payload) ?? `HTTP ${response.status}`,
        response.status,
        payload,
      );
    }

    return payload as T;
  }

  /** Состояние инстанса — используем как проверку учётных данных. */
  getStateInstance(signal?: AbortSignal): Promise<GetStateInstanceResponse> {
    return this.request<GetStateInstanceResponse>('getStateInstance', { signal });
  }

  /**
   * Отправка текстового сообщения.
   * @see https://green-api.com/v3/docs/api/sending/SendMessage/
   */
  sendMessage(payload: SendMessageRequest, signal?: AbortSignal): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>('sendMessage', {
      method: 'POST',
      body: payload,
      signal,
    });
  }

  /**
   * Проверка наличия аккаунта MAX на номере и получение постоянного chatId.
   * @see https://green-api.com/v3/docs/api/service/CheckAccount/
   */
  checkAccount(payload: CheckAccountRequest, signal?: AbortSignal): Promise<CheckAccountResponse> {
    return this.request<CheckAccountResponse>('checkAccount', {
      method: 'POST',
      body: payload,
      signal,
    });
  }

  /**
   * Получение одного уведомления из очереди (длинный опрос).
   * Возвращает `null`, если за время ожидания ничего не пришло.
   * @see https://green-api.com/v3/docs/api/receiving/technology-http-api/ReceiveNotification/
   */
  receiveNotification(
    receiveTimeout: number,
    signal?: AbortSignal,
  ): Promise<ReceiveNotificationResponse | null> {
    return this.request<ReceiveNotificationResponse | null>('receiveNotification', {
      query: { receiveTimeout },
      signal,
    });
  }

  /**
   * Подтверждение обработки уведомления — удаляет его из очереди.
   * @see https://green-api.com/v3/docs/api/receiving/technology-http-api/DeleteNotification/
   */
  deleteNotification(receiptId: number, signal?: AbortSignal): Promise<DeleteNotificationResponse> {
    return this.request<DeleteNotificationResponse>('deleteNotification', {
      method: 'DELETE',
      pathSuffix: receiptId,
      signal,
    });
  }
}

function parseJson(text: string): unknown {
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractErrorMessage(payload: unknown): string | null {
  if (typeof payload === 'string') return payload;

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    for (const key of ['message', 'reason', 'error', 'description']) {
      if (typeof record[key] === 'string') return record[key] as string;
    }
  }

  return null;
}
