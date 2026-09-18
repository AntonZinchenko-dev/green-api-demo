import { useChatsStore } from '@/entities/chat';
import { useMessagesStore } from '@/entities/message';
import { useSessionStore } from '@/entities/session';
import { GreenApiClient, toUserMessage } from '@/shared/api/green-api';
import type { GreenApiCredentials, InstanceState } from '@/shared/api/green-api';

const STATE_MESSAGES: Partial<Record<InstanceState, string>> = {
  notAuthorized: 'Инстанс не авторизован в MAX. Отсканируйте QR-код в личном кабинете GREEN-API.',
  starting: 'Инстанс ещё запускается. Подождите минуту и попробуйте снова.',
  blocked: 'Инстанс заблокирован. Проверьте статус в личном кабинете GREEN-API.',
  sleepMode: 'Инстанс в спящем режиме. Активируйте его в личном кабинете GREEN-API.',
  yellowCard: 'Инстанс временно ограничен мессенджером MAX.',
};

export interface ConnectResult {
  ok: boolean;
  error?: string;
}

/**
 * Проверяет учётные данные через `getStateInstance` и открывает сессию.
 * Кэш чатов очищается, если пользователь вошёл под другим инстансом.
 */
export async function connect(credentials: GreenApiCredentials): Promise<ConnectResult> {
  const session = useSessionStore.getState();

  session.setStatus('connecting');
  session.setError(null);

  try {
    const client = new GreenApiClient(credentials);
    const { stateInstance } = await client.getStateInstance();

    if (stateInstance !== 'authorized') {
      const error = STATE_MESSAGES[stateInstance] ?? `Инстанс недоступен: ${stateInstance}`;
      session.setStatus('error');
      session.setError(error);
      session.setInstanceState(stateInstance);
      return { ok: false, error };
    }

    if (useChatsStore.getState().claimOwner(credentials.idInstance.trim())) {
      useMessagesStore.getState().reset();
    }

    session.setCredentials({
      idInstance: credentials.idInstance.trim(),
      apiTokenInstance: credentials.apiTokenInstance.trim(),
      ...(credentials.apiUrl?.trim() ? { apiUrl: credentials.apiUrl.trim() } : {}),
    });
    session.setInstanceState(stateInstance);
    session.setStatus('connected');

    return { ok: true };
  } catch (error) {
    const message = toUserMessage(error);
    session.setStatus('error');
    session.setError(message);
    return { ok: false, error: message };
  }
}

/** Закрывает сессию. Сохранённые чаты остаются на устройстве. */
export function disconnect(): void {
  useSessionStore.getState().reset();
  useChatsStore.getState().setActiveChat(null);
}

/**
 * Восстанавливает сессию по сохранённым учётным данным при загрузке страницы.
 */
export async function restoreSession(): Promise<void> {
  const { credentials, status } = useSessionStore.getState();
  if (!credentials || status === 'connecting' || status === 'connected') return;

  await connect(credentials);
}
