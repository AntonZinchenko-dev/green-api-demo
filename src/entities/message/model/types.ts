export type MessageDirection = 'incoming' | 'outgoing';

/**
 * Статус исходящего сообщения.
 * `pending` выставляется локально до ответа sendMessage,
 * остальные приходят вебхуком `outgoingMessageStatus`.
 */
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  /** idMessage из GREEN-API либо локальный id до подтверждения отправки. */
  id: string;
  chatKey: string;
  direction: MessageDirection;
  text: string;
  /** Время в миллисекундах. */
  timestamp: number;
  status: MessageStatus;
}
