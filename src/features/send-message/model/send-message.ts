import { getSendableChatId, useChatsStore } from '@/entities/chat';
import { useMessagesStore } from '@/entities/message';
import { getClient } from '@/entities/session';
import { toUserMessage } from '@/shared/api/green-api';
import { MAX_MESSAGE_LENGTH } from '@/shared/config/app';
import { createLocalId } from '@/shared/lib/id';

export interface SendMessageResult {
  ok: boolean;
  error?: string;
}

/**
 * Отправляет текстовое сообщение методом SendMessage.
 *
 * Сообщение сразу появляется в ленте со статусом `pending`;
 * после ответа API локальный идентификатор заменяется на `idMessage`,
 * дальнейшие статусы приходят вебхуком `outgoingMessageStatus`.
 *
 * @see https://green-api.com/v3/docs/api/sending/SendMessage/
 */
export async function sendMessage(chatKey: string, rawText: string): Promise<SendMessageResult> {
  const text = rawText.trim();
  if (!text) return { ok: false, error: 'Пустое сообщение' };
  if (text.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: `Сообщение длиннее ${MAX_MESSAGE_LENGTH} символов` };
  }

  const chats = useChatsStore.getState();
  const chat = chats.chats.find((item) => item.key === chatKey);
  if (!chat) return { ok: false, error: 'Чат не найден' };

  const chatId = getSendableChatId(chat);
  if (!chatId) return { ok: false, error: 'У чата нет идентификатора получателя' };

  const client = getClient();
  if (!client) return { ok: false, error: 'Нет активного подключения к GREEN-API' };

  const messages = useMessagesStore.getState();
  const localId = createLocalId('msg');
  const timestamp = Date.now();

  messages.addMessage({
    id: localId,
    chatKey,
    direction: 'outgoing',
    text,
    timestamp,
    status: 'pending',
  });
  chats.updateLastMessage(chatKey, text, timestamp);

  try {
    const { idMessage } = await client.sendMessage({ chatId, message: text });

    if (idMessage) {
      messages.replaceMessageId(chatKey, localId, idMessage);
      messages.setStatus(idMessage, 'sent');
    } else {
      messages.setStatus(localId, 'sent');
    }

    return { ok: true };
  } catch (error) {
    messages.setStatus(localId, 'failed');
    return { ok: false, error: toUserMessage(error) };
  }
}
