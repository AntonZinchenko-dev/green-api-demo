import { cn } from '@/shared/lib/cn';
import { formatChatListTime } from '@/shared/lib/datetime';
import { formatPhone } from '@/shared/lib/phone';
import { Avatar } from '@/shared/ui';
import { hasCustomName } from '../model/store';
import type { Chat } from '../model/types';
import styles from './ChatListItem.module.css';

interface ChatListItemProps {
  chat: Chat;
  active: boolean;
  onSelect: (key: string) => void;
}

export function ChatListItem({ chat, active, onSelect }: ChatListItemProps) {
  const named = hasCustomName(chat);
  // Если заголовок чата — сам номер, не повторяем его во второй строке.
  const fallbackSubtitle = named && chat.phone ? formatPhone(chat.phone) : 'Нет сообщений';
  const subtitle = chat.lastMessageText || fallbackSubtitle;

  return (
    <li>
      <button
        type="button"
        className={cn(styles.root, active && styles.active)}
        onClick={() => onSelect(chat.key)}
        aria-current={active || undefined}
      >
        <Avatar name={chat.name} seed={chat.key} anonymous={!named} />

        <span className={styles.body}>
          <span className={styles.top}>
            <span className={styles.name}>{chat.name}</span>
            {chat.lastMessageAt && (
              <span className={styles.time}>{formatChatListTime(chat.lastMessageAt)}</span>
            )}
          </span>

          <span className={styles.bottom}>
            <span className={styles.preview}>{subtitle}</span>
            {chat.unreadCount > 0 && (
              <span className={styles.badge} aria-label={`Непрочитанных: ${chat.unreadCount}`}>
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </span>
            )}
          </span>
        </span>
      </button>
    </li>
  );
}
