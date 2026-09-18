type ClassValue = string | number | null | undefined | false;

/** Склеивает классы, отбрасывая пустые значения. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
