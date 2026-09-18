import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useChatsStore } from '@/entities/chat';
import { ChatList } from './ChatList';

beforeEach(() => {
  useChatsStore.getState().reset();
});

describe('ChatList', () => {
  it('показывает пустое состояние и предлагает создать чат', async () => {
    const onNewChat = vi.fn();
    render(<ChatList onNewChat={onNewChat} />);

    expect(screen.getByText('У вас пока нет чатов')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Новый чат' }));
    expect(onNewChat).toHaveBeenCalledOnce();
  });

  it('фильтрует чаты по имени и по номеру телефона', async () => {
    const chats = useChatsStore.getState();
    chats.resolveChat({ phone: '79991234567', name: 'Александр' });
    chats.resolveChat({ phone: '79997654321', name: 'Мария' });

    render(<ChatList onNewChat={vi.fn()} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(2);

    const search = screen.getByRole('searchbox', { name: 'Поиск по чатам' });

    await userEvent.type(search, 'Мари');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('Мария')).toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, '7654321');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('Мария')).toBeInTheDocument();
  });

  it('выбирает чат и сбрасывает счётчик непрочитанных', async () => {
    const chats = useChatsStore.getState();
    const { key } = chats.resolveChat({ phone: '79991234567', name: 'Александр' });
    chats.incrementUnread(key);

    render(<ChatList onNewChat={vi.fn()} />);

    expect(screen.getByLabelText('Непрочитанных: 1')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Александр/ }));

    expect(useChatsStore.getState().activeChatKey).toBe(key);
    expect(useChatsStore.getState().chats[0].unreadCount).toBe(0);
  });
});
