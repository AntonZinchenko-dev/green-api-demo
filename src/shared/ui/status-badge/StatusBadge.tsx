import { cn } from '@/shared/lib/cn';
import styles from './StatusBadge.module.css';

export type ConnectionTone = 'online' | 'pending' | 'offline';

const LABELS: Record<ConnectionTone, string> = {
  online: 'Подключено',
  pending: 'Подключение…',
  offline: 'Нет связи',
};

interface StatusBadgeProps {
  tone: ConnectionTone;
  label?: string;
  className?: string;
}

export function StatusBadge({ tone, label, className }: StatusBadgeProps) {
  return (
    <span className={cn(styles.root, styles[tone], className)}>
      <span className={styles.dot} aria-hidden="true" />
      {label ?? LABELS[tone]}
    </span>
  );
}
