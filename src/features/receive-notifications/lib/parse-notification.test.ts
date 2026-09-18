import { describe, expect, it } from 'vitest';
import type { Notification } from '@/shared/api';
import { parseNotification } from './parse-notification';

const incoming: Notification = {
  typeWebhook: 'incomingMessageReceived',
  instanceData: { idInstance: 3100000001, wid: '79991234567@c.us', typeInstance: 'v3' },
  timestamp: 1763115112,
  idMessage: '126543123451133331119',
  senderData: {
    chatId: '10000000',
    chatName: 'Александр',
    chatType: 'user',
    sender: '10000000',
    senderName: 'Александр',
    senderContactName: 'Александр Петров',
    senderPhoneNumber: 79876543210,
  },
  messageData: {
    typeMessage: 'textMessage',
    textMessageData: { textMessage: 'Всё отлично, спасибо!' },
  },
};

describe('parseNotification', () => {
  it('разбирает входящее текстовое сообщение', () => {
    const event = parseNotification(incoming);

    expect(event).toMatchObject({
      kind: 'message',
      direction: 'incoming',
      chatId: '10000000',
      chatName: 'Александр Петров',
      phone: '79876543210',
      text: 'Всё отлично, спасибо!',
    });
  });

  it('переводит секунды в миллисекунды', () => {
    const event = parseNotification(incoming);
    expect(event.kind === 'message' && event.timestamp).toBe(1763115112 * 1000);
  });

  it('разбирает сообщение с ссылкой (extendedTextMessage)', () => {
    const event = parseNotification({
      ...incoming,
      messageData: {
        typeMessage: 'extendedTextMessage',
        extendedTextMessageData: { text: 'https://green-api.com' },
      },
    } as Notification);

    expect(event).toMatchObject({ kind: 'message', text: 'https://green-api.com' });
  });

  it('помечает исходящее сообщение, отправленное через API', () => {
    const event = parseNotification({
      ...incoming,
      typeWebhook: 'outgoingAPIMessageReceived',
    } as Notification);

    expect(event).toMatchObject({ kind: 'message', direction: 'outgoing' });
  });

  it('игнорирует нетекстовые типы сообщений', () => {
    const event = parseNotification({
      ...incoming,
      messageData: { typeMessage: 'imageMessage' },
    } as Notification);

    expect(event).toEqual({ kind: 'ignored', reason: 'unsupported:imageMessage' });
  });

  it('разбирает статус исходящего сообщения', () => {
    const event = parseNotification({
      typeWebhook: 'outgoingMessageStatus',
      timestamp: 1763115113,
      chatId: '10000000',
      idMessage: '126543123451133331119',
      status: 'read',
    } as Notification);

    expect(event).toEqual({ kind: 'status', idMessage: '126543123451133331119', status: 'read' });
  });

  it('трактует noAccount как неудачную отправку', () => {
    const event = parseNotification({
      typeWebhook: 'outgoingMessageStatus',
      timestamp: 1763115113,
      chatId: '10000000',
      idMessage: 'abc',
      status: 'noAccount',
    } as Notification);

    expect(event).toEqual({ kind: 'status', idMessage: 'abc', status: 'failed' });
  });

  it('разбирает смену состояния инстанса', () => {
    const event = parseNotification({
      typeWebhook: 'stateInstanceChanged',
      timestamp: 1763115113,
      stateInstance: 'notAuthorized',
    } as Notification);

    expect(event).toEqual({ kind: 'state', stateInstance: 'notAuthorized' });
  });

  it('не падает на пустом теле', () => {
    expect(parseNotification(null)).toEqual({ kind: 'ignored', reason: 'empty' });
  });
});
