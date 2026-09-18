import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CHATS_STORAGE_KEY } from '@/shared/config/app';
import type { Message, MessageStatus } from './types';

interface MessagesState {
  /** Сообщения по ключу чата, отсортированы по возрастанию времени. */
  byChat: Record<string, Message[]>;

  addMessage: (message: Message) => void;
  replaceMessageId: (chatKey: string, localId: string, remoteId: string) => void;
  setStatus: (messageId: string, status: MessageStatus) => void;
  moveMessages: (fromChatKey: string, toChatKey: string) => void;
  removeChat: (chatKey: string) => void;
  reset: () => void;
}

/**
 * GREEN-API присылает время с точностью до секунды, а локальные отметки —
 * с точностью до миллисекунды. Сравниваем по секундам: при равенстве
 * стабильная сортировка сохраняет порядок появления сообщений.
 */
function compareByTime(a: Message, b: Message): number {
  return Math.floor(a.timestamp / 1000) - Math.floor(b.timestamp / 1000);
}

function insertSorted(list: Message[], message: Message): Message[] {
  const next = [...list, message];
  next.sort(compareByTime);
  return next;
}

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set) => ({
      byChat: {},

      addMessage: (message) =>
        set((state) => {
          const list = state.byChat[message.chatKey] ?? [];
          // Уведомления могут прийти повторно — дедуплицируем по idMessage.
          if (list.some((item) => item.id === message.id)) return state;

          return { byChat: { ...state.byChat, [message.chatKey]: insertSorted(list, message) } };
        }),

      replaceMessageId: (chatKey, localId, remoteId) =>
        set((state) => {
          const list = state.byChat[chatKey];
          if (!list) return state;

          return {
            byChat: {
              ...state.byChat,
              [chatKey]: list.map((item) => (item.id === localId ? { ...item, id: remoteId } : item)),
            },
          };
        }),

      setStatus: (messageId, status) =>
        set((state) => {
          const entry = Object.entries(state.byChat).find(([, list]) =>
            list.some((item) => item.id === messageId),
          );
          if (!entry) return state;

          const [chatKey, list] = entry;
          return {
            byChat: {
              ...state.byChat,
              [chatKey]: list.map((item) => (item.id === messageId ? { ...item, status } : item)),
            },
          };
        }),

      moveMessages: (fromChatKey, toChatKey) =>
        set((state) => {
          const source = state.byChat[fromChatKey];
          if (!source || fromChatKey === toChatKey) return state;

          const target = state.byChat[toChatKey] ?? [];
          const merged = [...target];

          for (const message of source) {
            if (!merged.some((item) => item.id === message.id)) {
              merged.push({ ...message, chatKey: toChatKey });
            }
          }
          merged.sort(compareByTime);

          const byChat = { ...state.byChat, [toChatKey]: merged };
          delete byChat[fromChatKey];

          return { byChat };
        }),

      removeChat: (chatKey) =>
        set((state) => {
          const byChat = { ...state.byChat };
          delete byChat[chatKey];
          return { byChat };
        }),

      reset: () => set({ byChat: {} }),
    }),
    { name: `${CHATS_STORAGE_KEY}/messages`, version: 1 },
  ),
);

const EMPTY: Message[] = [];

/** Селектор сообщений конкретного чата (стабильная ссылка на пустой массив). */
export function selectChatMessages(chatKey: string | null) {
  return (state: MessagesState): Message[] =>
    chatKey ? (state.byChat[chatKey] ?? EMPTY) : EMPTY;
}
