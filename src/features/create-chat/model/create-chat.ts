import { useChatsStore } from '@/entities/chat';
import { useMessagesStore } from '@/entities/message';
import { getClient } from '@/entities/session';
import { GreenApiError, toUserMessage } from '@/shared/api/green-api';
import { getPhoneError, normalizePhone } from '@/shared/lib/phone';

export interface CreateChatResult {
  ok: boolean;
  chatKey?: string;
  error?: string;
  /** Предупреждение: чат создан, но chatId получить не удалось. */
  warning?: string;
}

/**
 * Создаёт чат по номеру телефона.
 *
 * Сначала пытаемся получить постоянный `chatId` методом CheckAccount —
 * так входящие сообщения гарантированно попадут в этот же чат.
 * Если метод недоступен (лимиты MAX), отправка пойдёт по `номер@c.us`,
 * а `chatId` подставится из первого входящего уведомления.
 */
export async function createChat(phoneInput: string): Promise<CreateChatResult> {
  const validationError = getPhoneError(phoneInput);
  if (validationError) return { ok: false, error: validationError };

  const phone = normalizePhone(phoneInput);
  const client = getClient();
  if (!client) return { ok: false, error: 'Нет активного подключения к GREEN-API' };

  const chats = useChatsStore.getState();
  const existing = chats.chats.find((chat) => chat.phone === phone);
  if (existing) {
    chats.setActiveChat(existing.key);
    chats.clearUnread(existing.key);
    return { ok: true, chatKey: existing.key };
  }

  let chatId: string | null = null;
  let warning: string | undefined;

  try {
    const account = await client.checkAccount({ phoneNumber: Number(phone) });

    if (account.status === false) {
      return { ok: false, error: account.reason ?? 'GREEN-API не смог проверить номер' };
    }

    if (!account.exist) {
      return { ok: false, error: 'На этом номере нет аккаунта MAX' };
    }

    chatId = account.chatId || null;
  } catch (error) {
    // 469 — MAX временно ограничил проверку номеров; чат всё равно создаём.
    if (error instanceof GreenApiError && (error.status === 469 || error.status === 429)) {
      warning = `${error.userMessage} Чат создан, сообщения будут отправляться по номеру телефона.`;
    } else {
      return { ok: false, error: toUserMessage(error) };
    }
  }

  const { key, mergedFrom } = chats.resolveChat({ chatId, phone });
  if (mergedFrom) useMessagesStore.getState().moveMessages(mergedFrom, key);

  chats.setActiveChat(key);

  return { ok: true, chatKey: key, ...(warning ? { warning } : {}) };
}
