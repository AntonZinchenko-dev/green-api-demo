import { useShallow } from 'zustand/react/shallow';
import { useChatsStore } from '@/entities/chat';
import { selectChatMessages, useMessagesStore } from '@/entities/message';
import { useSessionStore } from '@/entities/session';
import { MessageComposer } from '@/features/send-message';
import { formatPhone } from '@/shared/lib/phone';
import {
  Avatar,
  BackIcon,
  EmptyChatsIllustration,
  EmptyState,
  SettingsIcon,
  StatusBadge,
} from '@/shared/ui';
import type { ConnectionTone } from '@/shared/ui';
import { MessageList } from './MessageList';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  /** Очередь уведомлений отвечает. */
  online: boolean;
  onOpenSettings: () => void;
}

export function ChatWindow({ online, onOpenSettings }: ChatWindowProps) {
  const activeChatKey = useChatsStore((state) => state.activeChatKey);
  const setActiveChat = useChatsStore((state) => state.setActiveChat);
  const chat = useChatsStore(
    useShallow((state) => state.chats.find((item) => item.key === state.activeChatKey) ?? null),
  );

  const messages = useMessagesStore(useShallow(selectChatMessages(activeChatKey)));
  const status = useSessionStore((state) => state.status);

  const tone: ConnectionTone =
    status === 'connecting' ? 'pending' : status === 'connected' && online ? 'online' : 'offline';

  return (
    <section className={styles.root} aria-label="Переписка">
      <header className={styles.header}>
        {chat ? (
          <>
            <button
              type="button"
              className={styles.back}
              onClick={() => setActiveChat(null)}
              aria-label="Назад к списку чатов"
            >
              <BackIcon size={20} />
            </button>

            <Avatar name={chat.name} seed={chat.key} />

            <div className={styles.peer}>
              <span className={styles.peerName}>{chat.name}</span>
              {chat.phone && <span className={styles.peerPhone}>{formatPhone(chat.phone)}</span>}
            </div>
          </>
        ) : (
          <div className={styles.peer} />
        )}

        <div className={styles.headerActions}>
          <StatusBadge tone={tone} />
          <button
            type="button"
            className={styles.iconButton}
            onClick={onOpenSettings}
            aria-label="Настройки подключения"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </header>

      {chat ? (
        <>
          <div className={styles.body}>
            <MessageList chatKey={chat.key} messages={messages} />
          </div>
          <MessageComposer chatKey={chat.key} />
        </>
      ) : (
        <div className={styles.body}>
          <EmptyState
            illustration={<EmptyChatsIllustration />}
            title="Выберите чат"
            description="Выберите чат из списка слева или создайте новый."
          />
        </div>
      )}
    </section>
  );
}
