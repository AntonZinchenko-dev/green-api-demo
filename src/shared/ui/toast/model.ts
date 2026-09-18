import { create } from 'zustand';
import { createLocalId } from '@/shared/lib/id';

export type ToastTone = 'error' | 'success' | 'info';

export interface Toast {
  id: string;
  tone: ToastTone;
  text: string;
}

interface ToastState {
  toasts: Toast[];
  show: (tone: ToastTone, text: string) => void;
  dismiss: (id: string) => void;
}

const AUTO_DISMISS_MS = 5000;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  show: (tone, text) => {
    const id = createLocalId('toast');
    set((state) => ({ toasts: [...state.toasts, { id, tone, text }] }));
    setTimeout(() => get().dismiss(id), AUTO_DISMISS_MS);
  },

  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

/** Быстрый доступ вне React-компонентов. */
export const toast = {
  error: (text: string) => useToastStore.getState().show('error', text),
  success: (text: string) => useToastStore.getState().show('success', text),
  info: (text: string) => useToastStore.getState().show('info', text),
};
