const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
});

const dayFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
});

const dayWithYearFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** `12:41` */
export function formatTime(timestamp: number): string {
  return timeFormatter.format(new Date(timestamp));
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Разница в календарных днях между датой и «сегодня». */
export function daysAgo(timestamp: number, now: number = Date.now()): number {
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(new Date(now)) - startOfDay(new Date(timestamp))) / dayMs);
}

/** Разделитель дат в ленте сообщений: «Сегодня», «Вчера», «14 марта». */
export function formatDayLabel(timestamp: number, now: number = Date.now()): string {
  const diff = daysAgo(timestamp, now);

  if (diff === 0) return 'Сегодня';
  if (diff === 1) return 'Вчера';

  const date = new Date(timestamp);
  const isSameYear = date.getFullYear() === new Date(now).getFullYear();

  return (isSameYear ? dayFormatter : dayWithYearFormatter).format(date);
}

/** Время последнего сообщения в списке чатов: `12:41`, `Вчера`, `14.03`. */
export function formatChatListTime(timestamp: number, now: number = Date.now()): string {
  const diff = daysAgo(timestamp, now);

  if (diff === 0) return formatTime(timestamp);
  if (diff === 1) return 'Вчера';

  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${day}.${month}`;
}
