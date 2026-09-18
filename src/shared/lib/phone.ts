/**
 * Работа с номерами телефонов.
 *
 * GREEN-API для MAX принимает номера только РФ (7) и РБ (375)
 * в международном формате из 11 или 12 цифр.
 */

const RU_LENGTH = 11;
const BY_LENGTH = 12;

/** Оставляет в строке только цифры. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Приводит пользовательский ввод к международному формату без разделителей.
 *
 * `8 999 123-45-67` → `79991234567`
 * `+7 (999) 123-45-67` → `79991234567`
 */
export function normalizePhone(value: string): string {
  let digits = digitsOnly(value);

  // Российский локальный формат, начинающийся с «8».
  if (digits.length === RU_LENGTH && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`;
  }

  // Номер без кода страны: 9991234567 → 79991234567.
  if (digits.length === 10 && digits.startsWith('9')) {
    digits = `7${digits}`;
  }

  return digits;
}

/** Проверяет, что номер пригоден для отправки через GREEN-API. */
export function isValidPhone(value: string): boolean {
  const digits = normalizePhone(value);

  if (digits.startsWith('375')) return digits.length === BY_LENGTH;
  if (digits.startsWith('7')) return digits.length === RU_LENGTH;

  return false;
}

/** Человекочитаемая ошибка для невалидного номера или `null`, если номер корректен. */
export function getPhoneError(value: string): string | null {
  const digits = normalizePhone(value);

  if (digits.length === 0) return 'Введите номер телефона';
  if (!digits.startsWith('7') && !digits.startsWith('375')) {
    return 'Поддерживаются только номера РФ (+7) и РБ (+375)';
  }
  if (!isValidPhone(value)) return 'Номер должен содержать 11 или 12 цифр';

  return null;
}

/**
 * Форматирует номер для отображения.
 *
 * `79991234567` → `+7 999 123-45-67`
 * `375291234567` → `+375 29 123-45-67`
 */
export function formatPhone(value: string): string {
  const digits = normalizePhone(value);

  if (digits.startsWith('375') && digits.length === BY_LENGTH) {
    const [, code, a, b, c] = /^375(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(digits) ?? [];
    return code ? `+375 ${code} ${a}-${b}-${c}` : `+${digits}`;
  }

  if (digits.startsWith('7') && digits.length === RU_LENGTH) {
    const [, code, a, b, c] = /^7(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(digits) ?? [];
    return code ? `+7 ${code} ${a}-${b}-${c}` : `+${digits}`;
  }

  return digits ? `+${digits}` : '';
}

/**
 * Маска ввода: возвращает отформатированную строку для поля ввода,
 * позволяя пользователю набирать номер в привычном виде.
 */
export function maskPhoneInput(value: string): string {
  const isBelarus = normalizePhone(value).startsWith('375');
  const country = isBelarus ? '375' : '7';
  const digits = normalizePhone(value).slice(0, isBelarus ? BY_LENGTH : RU_LENGTH);

  if (digits.length === 0) return '';

  // Длины групп после кода страны и разделители перед каждой из них.
  const groupSizes = isBelarus ? [2, 3, 2, 2] : [3, 3, 2, 2];
  const separators = [' ', ' ', '-', '-'];

  let rest = digits.slice(country.length);
  let result = `+${country}`;

  for (let index = 0; index < groupSizes.length && rest.length > 0; index += 1) {
    const group = rest.slice(0, groupSizes[index]);
    rest = rest.slice(groupSizes[index]);
    result += separators[index] + group;
  }

  return result;
}

/**
 * Идентификатор чата по номеру телефона — запасной вариант,
 * если `CheckAccount` недоступен. Поддерживается GREEN-API
 * для обратной совместимости.
 */
export function phoneToChatId(value: string): string {
  return `${normalizePhone(value)}@c.us`;
}

/** Достаёт номер телефона из chatId вида `79991234567@c.us`. */
export function chatIdToPhone(chatId: string): string | null {
  const match = /^(\d{11,12})@c\.us$/.exec(chatId);
  return match ? match[1] : null;
}
