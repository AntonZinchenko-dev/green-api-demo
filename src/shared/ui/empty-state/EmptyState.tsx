import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  illustration?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(styles.root, className)}>
      {illustration && <div className={styles.illustration}>{illustration}</div>}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
