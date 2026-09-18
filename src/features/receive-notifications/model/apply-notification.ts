import { useChatsStore } from '@/entities/chat';
import { useMessagesStore } from '@/entities/message';
import { useSessionStore } from '@/entities/session';
import type { Notification } from '@/shared/api';
import { parseNotification } from '../lib/parse-notification';
import type { NotificationEvent } from '../lib/parse-notification';

/**
 * Применяет одно уведомление GREEN-API к доменным хранилищам.
 * Возвращает разобранное событие — удобно для тестов и отладки.
 */
export function applyNotification(body: Notification | null | undefined): NotificationEvent {
  const event = parseNotification(body);

  switch (event.kind) {
    case 'message': {
      const chats = useChatsStore.getState();
      const messages = useMessagesStore.getState();

      const { key, mergedFrom } = chats.resolveChat({
        chatId: event.chatId,
        phone: event.phone,
        name: event.chatName,
      });

      // Чат, созданный по номеру телефона, мог получить постоянный chatId —
      // переносим ранее отправленные сообщения в объединённый чат.
      if (mergedFrom) messages.moveMessages(mergedFrom, key);

      messages.addMessage({
        id: event.idMessage,
        chatKey: key,
        direction: event.direction,
        text: event.text,
        timestamp: event.timestamp,
        status: event.direction === 'outgoing' ? 'sent' : 'delivered',
      });

      chats.updateLastMessage(key, event.text, event.timestamp);

      if (event.direction === 'incoming' && chats.activeChatKey !== key) {
        chats.incrementUnread(key);
      }

      break;
    }

    case 'status':
      useMessagesStore.getState().setStatus(event.idMessage, event.status);
      break;

    case 'state':
      useSessionStore.getState().setInstanceState(event.stateInstance);
      break;

    default:
      break;
  }

  return event;
}
