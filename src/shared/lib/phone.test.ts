import { describe, expect, it } from 'vitest';
import {
  chatIdToPhone,
  formatPhone,
  getPhoneError,
  isValidPhone,
  maskPhoneInput,
  normalizePhone,
  phoneToChatId,
} from './phone';

describe('normalizePhone', () => {
  it('убирает разделители', () => {
    expect(normalizePhone('+7 (999) 123-45-67')).toBe('79991234567');
  });

  it('заменяет ведущую 8 на 7', () => {
    expect(normalizePhone('8 999 123 45 67')).toBe('79991234567');
  });

  it('добавляет код страны к десятизначному номеру', () => {
    expect(normalizePhone('9991234567')).toBe('79991234567');
  });

  it('оставляет белорусский номер как есть', () => {
    expect(normalizePhone('+375 29 123-45-67')).toBe('375291234567');
  });
});

describe('isValidPhone', () => {
  it.each([
    ['+7 999 123-45-67', true],
    ['79991234567', true],
    ['375291234567', true],
    ['7999123456', false],
    ['1 202 555 0143', false],
    ['', false],
  ])('%s → %s', (input, expected) => {
    expect(isValidPhone(input)).toBe(expected);
  });
});

describe('getPhoneError', () => {
  it('просит ввести номер', () => {
    expect(getPhoneError('')).toBe('Введите номер телефона');
  });

  it('отклоняет неподдерживаемый код страны', () => {
    expect(getPhoneError('+1 202 555 0143')).toMatch(/только номера РФ/);
  });

  it('отклоняет неполный номер', () => {
    expect(getPhoneError('+7 999 12')).toMatch(/11 или 12 цифр/);
  });

  it('не ругается на корректный номер', () => {
    expect(getPhoneError('+79991234567')).toBeNull();
  });
});

describe('formatPhone', () => {
  it('форматирует российский номер', () => {
    expect(formatPhone('79991234567')).toBe('+7 999 123-45-67');
  });

  it('форматирует белорусский номер', () => {
    expect(formatPhone('375291234567')).toBe('+375 29 123-45-67');
  });
});

describe('maskPhoneInput', () => {
  it('наращивает маску по мере ввода', () => {
    expect(maskPhoneInput('7999')).toBe('+7 999');
    expect(maskPhoneInput('79991234567')).toBe('+7 999 123-45-67');
  });

  it('не даёт ввести больше 12 цифр', () => {
    expect(maskPhoneInput('3752912345678888')).toBe('+375 29 123-45-67');
  });
});

describe('chatId', () => {
  it('строит chatId по номеру', () => {
    expect(phoneToChatId('8 999 123-45-67')).toBe('79991234567@c.us');
  });

  it('достаёт номер из chatId', () => {
    expect(chatIdToPhone('79991234567@c.us')).toBe('79991234567');
  });

  it('возвращает null для числового chatId', () => {
    expect(chatIdToPhone('10000000')).toBeNull();
  });
});
