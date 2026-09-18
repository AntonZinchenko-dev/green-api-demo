import { cn } from '@/shared/lib/cn';
import styles from './Spinner.module.css';

export function Spinner({ className }: { className?: string }) {
  return <span className={cn(styles.root, className)} role="status" aria-label="Загрузка" />;
}
