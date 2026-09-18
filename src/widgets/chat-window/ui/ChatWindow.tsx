import { useShallow } from 'zustand/react/shallow';
import { hasCustomName, useChatsStore } from '@/entities/chat';
import { selectChatMessages, useMessagesStore } from '@/entities/message';
import { useSessionStore } from '@/entities/session';
import { MessageComposer } from '@/features/send-message';
import { formatPhone } from '@/shared/lib/phone';
import { Avatar, BackIcon, EmptyChatsIllustration, EmptyState, StatusBadge } from '@/shared/ui';
import type { ConnectionTone } from '@/shared/ui';
import { MessageList } from './MessageList';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  /** Очередь уведомлений отвечает. */
  online: boolean;
}

export function ChatWindow({ online }: ChatWindowProps) {
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

            <Avatar name={chat.name} seed={chat.key} anonymous={!hasCustomName(chat)} />

            <div className={styles.peer}>
              <span className={styles.peerName}>{chat.name}</span>
              {/* Номер во второй строке — только если заголовок чата не сам номер. */}
              {chat.phone && hasCustomName(chat) && (
                <span className={styles.peerPhone}>{formatPhone(chat.phone)}</span>
              )}
            </div>
          </>
        ) : (
          <div className={styles.peer} />
        )}

        <div className={styles.headerActions}>
          <StatusBadge tone={tone} />
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
