import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatsStore } from '@/entities/chat';
import { useMessagesStore } from '@/entities/message';
import { useSessionStore } from '@/entities/session';
import { sendMessage } from './send-message';

function mockFetch(handler: (url: string, init?: RequestInit) => unknown, ok = true) {
  const fetchMock = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => ({
    ok,
    status: ok ? 200 : 400,
    text: async () => JSON.stringify(handler(url, init)),
  }));

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => {
  useChatsStore.getState().reset();
  useMessagesStore.getState().reset();
  useSessionStore.getState().setCredentials({
    idInstance: '3100000001',
    apiTokenInstance: 'token123',
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  useSessionStore.getState().reset();
});

describe('sendMessage', () => {
  it('отправляет по chatId и подставляет idMessage из ответа', async () => {
    const fetchMock = mockFetch(() => ({ idMessage: 'remote-1' }));
    const { key } = useChatsStore.getState().resolveChat({ chatId: '10000000' });

    const result = await sendMessage(key, '  Привет!  ');

    expect(result.ok).toBe(true);

    const body = JSON.parse(String(fetchMock.mock.calls[0][1].body));
    expect(body).toEqual({ chatId: '10000000', message: 'Привет!' });

    const messages = useMessagesStore.getState().byChat[key];
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ id: 'remote-1', direction: 'outgoing', status: 'sent' });
    expect(useChatsStore.getState().chats[0].lastMessageText).toBe('Привет!');
  });

  it('отправляет по номеру телефона, пока chatId неизвестен', async () => {
    const fetchMock = mockFetch(() => ({ idMessage: 'remote-2' }));
    const { key } = useChatsStore.getState().resolveChat({ phone: '79991234567' });

    await sendMessage(key, 'Тест');

    const body = JSON.parse(String(fetchMock.mock.calls[0][1].body));
    expect(body.chatId).toBe('79991234567@c.us');
  });

  it('помечает сообщение как неотправленное при ошибке API', async () => {
    mockFetch(() => ({ message: 'Bad Request' }), false);
    const { key } = useChatsStore.getState().resolveChat({ chatId: '10000000' });

    const result = await sendMessage(key, 'Упс');

    expect(result.ok).toBe(false);
    expect(useMessagesStore.getState().byChat[key][0].status).toBe('failed');
  });

  it('не отправляет пустой текст', async () => {
    const fetchMock = mockFetch(() => ({ idMessage: 'nope' }));
    const { key } = useChatsStore.getState().resolveChat({ chatId: '10000000' });

    const result = await sendMessage(key, '   ');

    expect(result.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
