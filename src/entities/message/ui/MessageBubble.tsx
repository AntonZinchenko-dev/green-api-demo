import { cn } from '@/shared/lib/cn';
import { formatTime } from '@/shared/lib/datetime';
import { AlertIcon, CheckIcon, ClockIcon, DoubleCheckIcon } from '@/shared/ui';
import type { Message } from '../model/types';
import styles from './MessageBubble.module.css';

const STATUS_LABEL = {
  pending: 'Отправляется',
  sent: 'Отправлено',
  delivered: 'Доставлено',
  read: 'Прочитано',
  failed: 'Не отправлено',
} as const;

function StatusIcon({ status }: { status: Message['status'] }) {
  switch (status) {
    case 'pending':
      return <ClockIcon size={14} />;
    case 'sent':
      return <CheckIcon size={14} />;
    case 'delivered':
      return <DoubleCheckIcon size={14} />;
    case 'read':
      return <DoubleCheckIcon size={14} className={styles.read} />;
    case 'failed':
      return <AlertIcon size={14} className={styles.failed} />;
    default:
      return null;
  }
}

export function MessageBubble({ message }: { message: Message }) {
  const isOutgoing = message.direction === 'outgoing';

  return (
    <div className={cn(styles.row, isOutgoing ? styles.rowOut : styles.rowIn)}>
      <div className={cn(styles.bubble, isOutgoing ? styles.out : styles.in)}>
        <p className={styles.text}>{message.text}</p>

        <span className={styles.meta}>
          <time dateTime={new Date(message.timestamp).toISOString()}>
            {formatTime(message.timestamp)}
          </time>
          {isOutgoing && (
            <span className={styles.status} title={STATUS_LABEL[message.status]}>
              <span className="visually-hidden">{STATUS_LABEL[message.status]}</span>
              <StatusIcon status={message.status} />
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
