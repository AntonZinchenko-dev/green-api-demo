import { useMemo, useState } from 'react';
import { ChatListItem, sortChats, useChatsStore } from '@/entities/chat';
import { normalizePhone } from '@/shared/lib/phone';
import { Button, EmptyChatsIllustration, EmptyState, PlusIcon, SearchIcon } from '@/shared/ui';
import styles from './ChatList.module.css';

interface ChatListProps {
  onNewChat: () => void;
}

export function ChatList({ onNewChat }: ChatListProps) {
  const chats = useChatsStore((state) => state.chats);
  const activeChatKey = useChatsStore((state) => state.activeChatKey);
  const setActiveChat = useChatsStore((state) => state.setActiveChat);
  const clearUnread = useChatsStore((state) => state.clearUnread);

  const [query, setQuery] = useState('');

  const visibleChats = useMemo(() => {
    const sorted = sortChats(chats);
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return sorted;

    const digits = normalizePhone(trimmed);

    return sorted.filter(
      (chat) =>
        chat.name.toLowerCase().includes(trimmed) ||
        chat.lastMessageText.toLowerCase().includes(trimmed) ||
        (digits.length > 1 && chat.phone?.includes(digits)),
    );
  }, [chats, query]);

  const handleSelect = (key: string) => {
    setActiveChat(key);
    clearUnread(key);
  };

  return (
    <section className={styles.root} aria-label="Список чатов">
      <header className={styles.header}>
        <h2 className={styles.title}>Чаты</h2>

        <div className={styles.search}>
          <SearchIcon size={18} className={styles.searchIcon} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Поиск по чатам…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Поиск по чатам"
          />
        </div>
      </header>

      {chats.length === 0 ? (
        <EmptyState
          illustration={<EmptyChatsIllustration />}
          title="У вас пока нет чатов"
          description="Начните общение, добавив новый чат по номеру телефона."
          action={
            <Button startIcon={<PlusIcon size={18} />} onClick={onNewChat}>
              Новый чат
            </Button>
          }
        />
      ) : visibleChats.length === 0 ? (
        <EmptyState title="Ничего не найдено" description="Попробуйте изменить запрос." />
      ) : (
        <ul className={`${styles.list} scrollable`}>
          {visibleChats.map((chat) => (
            <ChatListItem
              key={chat.key}
              chat={chat}
              active={chat.key === activeChatKey}
              onSelect={handleSelect}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
