/** Ключ, под которым учётные данные инстанса лежат в localStorage. */
export const SESSION_STORAGE_KEY = 'max-green-api/session';

/** Ключ, под которым кэшируются чаты и сообщения текущего инстанса. */
export const CHATS_STORAGE_KEY = 'max-green-api/chats';

/**
 * Таймаут длинного опроса очереди уведомлений, секунды.
 * GREEN-API допускает значения от 5 до 60.
 */
export const RECEIVE_TIMEOUT_SECONDS = 10;

/** Пауза перед повторным опросом после сетевой ошибки, мс. */
export const POLLING_RETRY_DELAY_MS = 3000;

/** Максимальная длина текстового сообщения. */
export const MAX_MESSAGE_LENGTH = 4096;
