import { AlertIcon, CheckIcon, CloseIcon, InfoIcon } from '../icons/Icons';
import { useToastStore } from './model';
import type { ToastTone } from './model';
import styles from './ToastHost.module.css';

const ICONS: Record<ToastTone, typeof InfoIcon> = {
  error: AlertIcon,
  success: CheckIcon,
  info: InfoIcon,
};

export function ToastHost() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.root} role="status" aria-live="polite">
      {toasts.map((item) => {
        const Icon = ICONS[item.tone];

        return (
          <div key={item.id} className={`${styles.toast} ${styles[item.tone]}`}>
            <Icon size={18} className={styles.icon} />
            <span className={styles.text}>{item.text}</span>
            <button
              type="button"
              className={styles.close}
              onClick={() => dismiss(item.id)}
              aria-label="Закрыть уведомление"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
