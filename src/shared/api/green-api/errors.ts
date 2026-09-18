/** Ошибка HTTP-запроса к GREEN-API с расшифровкой для пользователя. */
export class GreenApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'GreenApiError';
    this.status = status;
    this.payload = payload;
  }

  /** Понятный пользователю текст ошибки. */
  get userMessage(): string {
    switch (this.status) {
      case 0:
        return 'Не удалось связаться с GREEN-API. Проверьте подключение к интернету.';
      case 400:
        return 'GREEN-API отклонил запрос: проверьте номер получателя и текст сообщения.';
      case 401:
      case 403:
        return 'Неверные idInstance или apiTokenInstance.';
      case 429:
        return 'Слишком много запросов к GREEN-API. Подождите немного и повторите.';
      case 466:
        return 'Достигнут лимит тарифа «Разработчик»: доступно не более 3 чатов.';
      case 469:
        return 'MAX временно ограничил проверку номеров. Попробуйте позже.';
      default:
        return this.status >= 500
          ? 'GREEN-API временно недоступен. Попробуйте позже.'
          : this.message;
    }
  }
}

/** Ошибка, означающая, что инстанс не авторизован в мессенджере MAX. */
export class InstanceNotAuthorizedError extends Error {
  readonly state: string;

  constructor(state: string) {
    super(`Инстанс не авторизован (состояние: ${state})`);
    this.name = 'InstanceNotAuthorizedError';
    this.state = state;
  }
}

/** Приводит любое исключение к тексту, пригодному для показа пользователю. */
export function toUserMessage(error: unknown): string {
  if (error instanceof GreenApiError) return error.userMessage;
  if (error instanceof InstanceNotAuthorizedError) return error.message;
  if (error instanceof Error) return error.message;

  return 'Неизвестная ошибка';
}
