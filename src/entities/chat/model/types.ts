export interface Chat {
  /** Внутренний стабильный ключ чата (не меняется при получении chatId). */
  key: string;
  /**
   * Постоянный идентификатор чата в MAX.
   * Появляется после CheckAccount или после первого входящего уведомления.
   */
  chatId: string | null;
  /** Номер телефона собеседника в международном формате без разделителей. */
  phone: string | null;
  name: string;
  lastMessageText: string;
  lastMessageAt: number | null;
  unreadCount: number;
  createdAt: number;
}
