import { cn } from '@/shared/lib/cn';
import styles from './Logo.module.css';

interface LogoProps {
  /** Светлый вариант для тёмного фона. */
  inverted?: boolean;
  size?: 'md' | 'lg';
  className?: string;
}

export function Logo({ inverted = false, size = 'md', className }: LogoProps) {
  return (
    <div
      className={cn(styles.root, size === 'lg' && styles.lg, inverted && styles.inverted, className)}
    >
      <span className={styles.mark} aria-hidden="true">
        <svg viewBox="0 0 32 32" className={styles.markSvg}>
          <path
            d="M9 22.5V11.2c0-.85 1.04-1.26 1.62-.64L16 16.3l5.38-5.74c.58-.62 1.62-.21 1.62.64v11.3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={styles.word}>MAX</span>
    </div>
  );
}
