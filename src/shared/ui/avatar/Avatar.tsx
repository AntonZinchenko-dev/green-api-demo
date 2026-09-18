import { getAvatarGradient, getInitials } from '@/shared/lib/avatar';
import { cn } from '@/shared/lib/cn';
import styles from './Avatar.module.css';

interface AvatarProps {
  name: string;
  /** Стабильный ключ для выбора градиента (обычно id чата). */
  seed?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, seed, size = 'md', className }: AvatarProps) {
  return (
    <span
      className={cn(styles.root, styles[size], className)}
      style={{ backgroundImage: getAvatarGradient(seed ?? name) }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}
