import { useEffect, useLayoutEffect, useRef } from 'react';
import { DayDivider, MessageBubble } from '@/entities/message';
import type { Message } from '@/entities/message';
import { daysAgo, formatDayLabel } from '@/shared/lib/datetime';
import styles from './MessageList.module.css';

interface MessageListProps {
  chatKey: string;
  messages: Message[];
}

const NEAR_BOTTOM_THRESHOLD = 120;

export function MessageList({ chatKey, messages }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedToBottom = useRef(true);

  // При смене чата всегда показываем последние сообщения.
  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    pinnedToBottom.current = true;
    node.scrollTop = node.scrollHeight;
  }, [chatKey]);

  // Новые сообщения прокручивают ленту, только если пользователь у нижнего края.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || !pinnedToBottom.current) return;

    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleScroll = () => {
    const node = containerRef.current;
    if (!node) return;

    const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
    pinnedToBottom.current = distance < NEAR_BOTTOM_THRESHOLD;
  };

  if (messages.length === 0) {
    return (
      <div className={styles.root}>
        <p className={styles.placeholder}>
          Сообщений пока нет. Напишите первым — сообщение уйдёт в MAX через GREEN-API.
        </p>
      </div>
    );
  }

  let previousDay: number | null = null;

  return (
    <div
      ref={containerRef}
      className={`${styles.root} scrollable`}
      onScroll={handleScroll}
      role="log"
      aria-label="Сообщения"
      aria-live="polite"
    >
      <div className={styles.inner}>
        {messages.map((message) => {
          const day = daysAgo(message.timestamp);
          const showDivider = day !== previousDay;
          previousDay = day;

          return (
            <div key={message.id}>
              {showDivider && <DayDivider label={formatDayLabel(message.timestamp)} />}
              <MessageBubble message={message} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
