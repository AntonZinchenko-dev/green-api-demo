import { getAvatarGradient, getInitials } from '@/shared/lib/avatar';
import { cn } from '@/shared/lib/cn';
import { UserIcon } from '../icons/Icons';
import styles from './Avatar.module.css';

const ICON_SIZE = { sm: 16, md: 22, lg: 26 } as const;

interface AvatarProps {
  name: string;
  /** Стабильный ключ для выбора градиента (обычно id чата). */
  seed?: string;
  size?: 'sm' | 'md' | 'lg';
  /**
   * Имя собеседника неизвестно — вместо инициалов из номера телефона
   * («+7 912…» → «79») показываем силуэт.
   */
  anonymous?: boolean;
  className?: string;
}

export function Avatar({ name, seed, size = 'md', anonymous = false, className }: AvatarProps) {
  return (
    <span
      className={cn(styles.root, styles[size], className)}
      style={{ backgroundImage: getAvatarGradient(seed ?? name) }}
      aria-hidden="true"
    >
      {anonymous ? <UserIcon size={ICON_SIZE[size]} strokeWidth={1.7} /> : getInitials(name)}
    </span>
  );
}
