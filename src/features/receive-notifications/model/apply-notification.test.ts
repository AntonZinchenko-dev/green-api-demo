import { beforeEach, describe, expect, it } from 'vitest';
import { useChatsStore } from '@/entities/chat';
import { useMessagesStore } from '@/entities/message';
import type { Notification } from '@/shared/api';
import { applyNotification } from './apply-notification';

function incomingFrom(phone: number, chatId: string, text: string): Notification {
  return {
    typeWebhook: 'incomingMessageReceived',
    instanceData: { idInstance: 3100000001, wid: '79990000000@c.us', typeInstance: 'v3' },
    timestamp: Math.floor(Date.now() / 1000),
    idMessage: `msg-${text}`,
    senderData: {
      chatId,
      chatName: 'Александр',
      sender: chatId,
      senderName: 'Александр',
      senderPhoneNumber: phone,
    },
    messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: text } },
  };
}

beforeEach(() => {
  useChatsStore.getState().reset();
  useMessagesStore.getState().reset();
});

describe('applyNotification', () => {
  it('создаёт чат из входящего сообщения и считает непрочитанные', () => {
    applyNotification(incomingFrom(79991234567, '10000000', 'Привет'));

    const { chats } = useChatsStore.getState();
    expect(chats).toHaveLength(1);
    expect(chats[0]).toMatchObject({
      chatId: '10000000',
      phone: '79991234567',
      name: 'Александр',
      lastMessageText: 'Привет',
      unreadCount: 1,
    });

    const messages = useMessagesStore.getState().byChat[chats[0].key];
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ direction: 'incoming', text: 'Привет' });
  });

  it('привязывает chatId к чату, созданному по номеру телефона', () => {
    const { key } = useChatsStore.getState().resolveChat({ phone: '79991234567' });
    expect(useChatsStore.getState().chats[0].chatId).toBeNull();

    applyNotification(incomingFrom(79991234567, '10000000', 'Ответ'));

    const chats = useChatsStore.getState().chats;
    expect(chats).toHaveLength(1);
    expect(chats[0].key).toBe(key);
    expect(chats[0].chatId).toBe('10000000');
  });

  it('объединяет дубликаты и переносит ранее отправленные сообщения', () => {
    // Чат, созданный вручную по номеру, — в нём уже есть исходящее сообщение.
    const byPhone = useChatsStore.getState().resolveChat({ phone: '79991234567' });
    useMessagesStore.getState().addMessage({
      id: 'out-1',
      chatKey: byPhone.key,
      direction: 'outgoing',
      text: 'Привет! Как дела?',
      timestamp: Date.now() - 1000,
      status: 'sent',
    });

    // Отдельный чат с тем же собеседником, пришедший из уведомления без номера.
    const byChatId = useChatsStore.getState().resolveChat({ chatId: '10000000' });
    expect(useChatsStore.getState().chats).toHaveLength(2);

    applyNotification(incomingFrom(79991234567, '10000000', 'Всё отлично, спасибо!'));

    const chats = useChatsStore.getState().chats;
    expect(chats).toHaveLength(1);
    expect(chats[0].key).toBe(byPhone.key);
    expect(chats[0].chatId).toBe('10000000');

    const messages = useMessagesStore.getState().byChat[byPhone.key];
    expect(messages.map((item) => item.text)).toEqual(['Привет! Как дела?', 'Всё отлично, спасибо!']);
    expect(useMessagesStore.getState().byChat[byChatId.key]).toBeUndefined();
  });

  it('не дублирует сообщение при повторной доставке уведомления', () => {
    const notification = incomingFrom(79991234567, '10000000', 'Дубль');

    applyNotification(notification);
    applyNotification(notification);

    const key = useChatsStore.getState().chats[0].key;
    expect(useMessagesStore.getState().byChat[key]).toHaveLength(1);
  });

  it('обновляет статус исходящего сообщения', () => {
    const { key } = useChatsStore.getState().resolveChat({ phone: '79991234567' });
    useMessagesStore.getState().addMessage({
      id: 'out-1',
      chatKey: key,
      direction: 'outgoing',
      text: 'Привет',
      timestamp: Date.now(),
      status: 'pending',
    });

    applyNotification({
      typeWebhook: 'outgoingMessageStatus',
      timestamp: Math.floor(Date.now() / 1000),
      chatId: '10000000',
      idMessage: 'out-1',
      status: 'read',
    } as Notification);

    expect(useMessagesStore.getState().byChat[key][0].status).toBe('read');
  });

  it('не увеличивает счётчик непрочитанных в открытом чате', () => {
    const { key } = useChatsStore.getState().resolveChat({ phone: '79991234567' });
    useChatsStore.getState().setActiveChat(key);

    applyNotification(incomingFrom(79991234567, '10000000', 'Открытый чат'));

    expect(useChatsStore.getState().chats[0].unreadCount).toBe(0);
  });
});
