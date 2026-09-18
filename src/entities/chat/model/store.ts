import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CHATS_STORAGE_KEY } from '@/shared/config/app';
import { createLocalId } from '@/shared/lib/id';
import { chatIdToPhone, formatPhone } from '@/shared/lib/phone';
import type { Chat } from './types';

export interface ResolveChatInput {
  chatId?: string | null;
  phone?: string | null;
  name?: string | null;
}

export interface ResolveChatResult {
  key: string;
  /** Ключ чата, который был объединён с найденным (нужно перенести сообщения). */
  mergedFrom: string | null;
  created: boolean;
}

interface ChatsState {
  chats: Chat[];
  activeChatKey: string | null;
  /** Инстанс, которому принадлежат сохранённые чаты. */
  ownerInstanceId: string | null;

  /**
   * Находит чат по chatId или номеру телефона, при необходимости создаёт его
   * и объединяет дубликаты (чат, созданный по номеру, и чат из уведомления).
   */
  resolveChat: (input: ResolveChatInput) => ResolveChatResult;
  /**
   * Привязывает кэш чатов к инстансу.
   * @returns `true`, если кэш пришлось очистить (вошли под другим инстансом).
   */
  claimOwner: (idInstance: string) => boolean;
  setActiveChat: (key: string | null) => void;
  updateLastMessage: (key: string, text: string, timestamp: number) => void;
  incrementUnread: (key: string) => void;
  clearUnread: (key: string) => void;
  renameChat: (key: string, name: string) => void;
  removeChat: (key: string) => void;
  reset: () => void;
}

function defaultName(phone: string | null, chatId: string | null): string {
  if (phone) return formatPhone(phone);
  return chatId ?? 'Новый чат';
}

/** Кандидат на слияние: тот же chatId или тот же номер телефона. */
function findMatch(chats: Chat[], chatId: string | null, phone: string | null): Chat | undefined {
  if (chatId) {
    const byChatId = chats.find((chat) => chat.chatId === chatId);
    if (byChatId) return byChatId;
  }
  if (phone) return chats.find((chat) => chat.phone === phone);
  return undefined;
}

export const useChatsStore = create<ChatsState>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChatKey: null,
      ownerInstanceId: null,

      claimOwner: (idInstance) => {
        const { ownerInstanceId } = get();
        if (ownerInstanceId === idInstance) return false;

        set({ chats: [], activeChatKey: null, ownerInstanceId: idInstance });
        return ownerInstanceId !== null;
      },

      resolveChat: ({ chatId = null, phone = null, name = null }) => {
        // chatId вида 79991234567@c.us несёт в себе номер телефона.
        const normalizedChatId = chatId?.trim() || null;
        const derivedPhone = phone ?? (normalizedChatId ? chatIdToPhone(normalizedChatId) : null);
        // Числовой chatId сохраняем, «телефонный» — нет: он временный.
        const persistentChatId =
          normalizedChatId && !chatIdToPhone(normalizedChatId) ? normalizedChatId : null;

        const { chats } = get();
        const byChatId = persistentChatId
          ? chats.find((chat) => chat.chatId === persistentChatId)
          : undefined;
        const byPhone = derivedPhone
          ? chats.find((chat) => chat.phone === derivedPhone)
          : undefined;

        // Оба чата существуют и это разные записи — объединяем их.
        if (byChatId && byPhone && byChatId.key !== byPhone.key) {
          const survivor: Chat = {
            ...byPhone,
            chatId: persistentChatId,
            name: name?.trim() || byPhone.name,
            lastMessageAt: Math.max(byPhone.lastMessageAt ?? 0, byChatId.lastMessageAt ?? 0) || null,
            lastMessageText:
              (byChatId.lastMessageAt ?? 0) > (byPhone.lastMessageAt ?? 0)
                ? byChatId.lastMessageText
                : byPhone.lastMessageText,
            unreadCount: byPhone.unreadCount + byChatId.unreadCount,
          };

          set((state) => ({
            chats: state.chats
              .filter((chat) => chat.key !== byChatId.key)
              .map((chat) => (chat.key === survivor.key ? survivor : chat)),
            activeChatKey:
              state.activeChatKey === byChatId.key ? survivor.key : state.activeChatKey,
          }));

          return { key: survivor.key, mergedFrom: byChatId.key, created: false };
        }

        const existing = byChatId ?? byPhone ?? findMatch(chats, normalizedChatId, derivedPhone);

        if (existing) {
          const patch: Partial<Chat> = {};
          if (persistentChatId && existing.chatId !== persistentChatId) {
            patch.chatId = persistentChatId;
          }
          if (derivedPhone && !existing.phone) patch.phone = derivedPhone;
          // Имя из уведомления заменяет технический заголовок вида «+7 999 …».
          if (name?.trim() && existing.name !== name.trim()) patch.name = name.trim();

          if (Object.keys(patch).length > 0) {
            set((state) => ({
              chats: state.chats.map((chat) =>
                chat.key === existing.key ? { ...chat, ...patch } : chat,
              ),
            }));
          }

          return { key: existing.key, mergedFrom: null, created: false };
        }

        const chat: Chat = {
          key: createLocalId('chat'),
          chatId: persistentChatId,
          phone: derivedPhone,
          name: name?.trim() || defaultName(derivedPhone, normalizedChatId),
          lastMessageText: '',
          lastMessageAt: null,
          unreadCount: 0,
          createdAt: Date.now(),
        };

        set((state) => ({ chats: [chat, ...state.chats] }));

        return { key: chat.key, mergedFrom: null, created: true };
      },

      setActiveChat: (key) => set({ activeChatKey: key }),

      updateLastMessage: (key, text, timestamp) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.key === key
              ? {
                  ...chat,
                  lastMessageText: text,
                  lastMessageAt: Math.max(chat.lastMessageAt ?? 0, timestamp),
                }
              : chat,
          ),
        })),

      incrementUnread: (key) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.key === key ? { ...chat, unreadCount: chat.unreadCount + 1 } : chat,
          ),
        })),

      clearUnread: (key) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.key === key && chat.unreadCount > 0 ? { ...chat, unreadCount: 0 } : chat,
          ),
        })),

      renameChat: (key, name) =>
        set((state) => ({
          chats: state.chats.map((chat) => (chat.key === key ? { ...chat, name } : chat)),
        })),

      removeChat: (key) =>
        set((state) => ({
          chats: state.chats.filter((chat) => chat.key !== key),
          activeChatKey: state.activeChatKey === key ? null : state.activeChatKey,
        })),

      reset: () => set({ chats: [], activeChatKey: null, ownerInstanceId: null }),
    }),
    { name: `${CHATS_STORAGE_KEY}/chats`, version: 1 },
  ),
);

/** Чаты, отсортированные по времени последнего сообщения. */
export function sortChats(chats: Chat[]): Chat[] {
  return [...chats].sort(
    (a, b) => (b.lastMessageAt ?? b.createdAt) - (a.lastMessageAt ?? a.createdAt),
  );
}

/** Идентификатор для отправки: постоянный chatId либо номер в формате `…@c.us`. */
export function getSendableChatId(chat: Chat): string | null {
  if (chat.chatId) return chat.chatId;
  if (chat.phone) return `${chat.phone}@c.us`;
  return null;
}
