import { forwardRef, useId, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { EyeIcon, EyeOffIcon } from '../icons/Icons';
import styles from './TextField.module.css';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string | null;
  /** Кнопка-глаз для скрытия/показа значения. */
  secret?: boolean;
  startSlot?: ReactNode;
  /** data-атрибуты для подсказок менеджерам паролей (data-lpignore и подобные). */
  [dataAttribute: `data-${string}`]: unknown;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, secret = false, startSlot, className, id, type = 'text', ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedById = `${inputId}-description`;
  const [revealed, setRevealed] = useState(false);

  const inputType = secret && !revealed ? 'password' : type;

  return (
    <div className={cn(styles.root, className)}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}

      <div className={cn(styles.field, error && styles.fieldError)}>
        {startSlot && <div className={styles.startSlot}>{startSlot}</div>}

        <input
          {...props}
          id={inputId}
          ref={ref}
          type={inputType}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? describedById : undefined}
        />

        {secret && (
          <button
            type="button"
            className={styles.revealButton}
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? 'Скрыть значение' : 'Показать значение'}
            tabIndex={-1}
          >
            {revealed ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        )}
      </div>

      {(error || hint) && (
        <p id={describedById} className={cn(styles.hint, error && styles.errorText)}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});
