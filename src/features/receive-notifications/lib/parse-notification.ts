import type { MessageDirection, MessageStatus } from '@/entities/message';
import type { InstanceState, Notification } from '@/shared/api/green-api';

export type NotificationEvent =
  | {
      kind: 'message';
      direction: MessageDirection;
      idMessage: string;
      chatId: string;
      chatName: string | null;
      phone: string | null;
      text: string;
      timestamp: number;
    }
  | { kind: 'status'; idMessage: string; status: MessageStatus }
  | { kind: 'state'; stateInstance: InstanceState }
  | { kind: 'ignored'; reason: string };

const STATUS_MAP: Record<string, MessageStatus> = {
  sent: 'sent',
  delivered: 'delivered',
  read: 'read',
  failed: 'failed',
  noAccount: 'failed',
  notInGroup: 'failed',
};

/** Текст сообщения: поддерживаются только текстовые типы (`textMessage`, `extendedTextMessage`). */
export function extractText(messageData: {
  typeMessage: string;
  textMessageData?: { textMessage: string };
  extendedTextMessageData?: { text: string };
}): string | null {
  if (messageData.typeMessage === 'textMessage') {
    return messageData.textMessageData?.textMessage ?? null;
  }
  if (messageData.typeMessage === 'extendedTextMessage') {
    return messageData.extendedTextMessageData?.text ?? null;
  }
  return null;
}

/** Секунды GREEN-API → миллисекунды JS. */
function toMillis(timestamp: number | undefined): number {
  if (!timestamp) return Date.now();
  return timestamp < 1e12 ? timestamp * 1000 : timestamp;
}

/**
 * Переводит уведомление GREEN-API в событие доменной модели.
 * Всё, что не относится к текстовой переписке, помечается как `ignored`.
 */
export function parseNotification(body: Notification | null | undefined): NotificationEvent {
  if (!body || typeof body !== 'object' || !('typeWebhook' in body)) {
    return { kind: 'ignored', reason: 'empty' };
  }

  switch (body.typeWebhook) {
    case 'incomingMessageReceived':
    case 'outgoingMessageReceived':
    case 'outgoingAPIMessageReceived': {
      const text = extractText(body.messageData ?? { typeMessage: 'unknown' });
      if (text === null) {
        return { kind: 'ignored', reason: `unsupported:${body.messageData?.typeMessage}` };
      }

      const sender = body.senderData ?? { chatId: '' };
      const rawPhone = sender.senderPhoneNumber;

      return {
        kind: 'message',
        direction: body.typeWebhook === 'incomingMessageReceived' ? 'incoming' : 'outgoing',
        idMessage: body.idMessage,
        chatId: sender.chatId,
        chatName: sender.senderContactName ?? sender.chatName ?? sender.senderName ?? null,
        phone: rawPhone ? String(rawPhone) : null,
        text,
        timestamp: toMillis(body.timestamp),
      };
    }

    case 'outgoingMessageStatus':
      return {
        kind: 'status',
        idMessage: body.idMessage,
        status: STATUS_MAP[body.status] ?? 'sent',
      };

    case 'stateInstanceChanged':
      return { kind: 'state', stateInstance: body.stateInstance };

    default:
      return { kind: 'ignored', reason: `webhook:${String(body.typeWebhook)}` };
  }
}
