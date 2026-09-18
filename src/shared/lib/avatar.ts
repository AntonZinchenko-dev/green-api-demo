const PALETTE = [
  ['#5B8BFF', '#8B5CF6'],
  ['#38BDF8', '#2563EB'],
  ['#F472B6', '#8B5CF6'],
  ['#34D399', '#0EA5E9'],
  ['#FBBF24', '#F97316'],
  ['#A78BFA', '#6366F1'],
] as const;

function hash(value: string): number {
  let result = 0;
  for (let i = 0; i < value.length; i += 1) {
    result = (result * 31 + value.charCodeAt(i)) >>> 0;
  }
  return result;
}

/** Инициалы для аватара: «Александр Петров» → «АП», «+7 999…» → «99». */
export function getInitials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

/** Стабильный градиент, вычисленный из идентификатора чата. */
export function getAvatarGradient(seed: string): string {
  const [from, to] = PALETTE[hash(seed) % PALETTE.length];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}
