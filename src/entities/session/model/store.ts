import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GreenApiClient } from '@/shared/api';
import type { GreenApiCredentials, InstanceState } from '@/shared/api';
import { SESSION_STORAGE_KEY } from '@/shared/config';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface SessionState {
  credentials: GreenApiCredentials | null;
  status: ConnectionStatus;
  instanceState: InstanceState | null;
  error: string | null;

  setCredentials: (credentials: GreenApiCredentials | null) => void;
  setStatus: (status: ConnectionStatus) => void;
  setInstanceState: (instanceState: InstanceState | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      credentials: null,
      status: 'disconnected',
      instanceState: null,
      error: null,

      setCredentials: (credentials) => set({ credentials }),
      setStatus: (status) => set({ status }),
      setInstanceState: (instanceState) => set({ instanceState }),
      setError: (error) => set({ error }),
      reset: () =>
        set({ credentials: null, status: 'disconnected', instanceState: null, error: null }),
    }),
    {
      name: SESSION_STORAGE_KEY,
      version: 1,
      // В localStorage попадают только учётные данные: статус подключения
      // всегда проверяется заново при загрузке страницы.
      partialize: (state) => ({ credentials: state.credentials }),
    },
  ),
);

/* Клиент пересоздаётся только при смене учётных данных. */
let cachedKey = '';
let cachedClient: GreenApiClient | null = null;

/** Клиент GREEN-API для текущей сессии или `null`, если учётных данных нет. */
export function getClient(): GreenApiClient | null {
  const { credentials } = useSessionStore.getState();
  if (!credentials) {
    cachedKey = '';
    cachedClient = null;
    return null;
  }

  const key = `${credentials.idInstance}:${credentials.apiTokenInstance}:${credentials.apiUrl ?? ''}`;
  if (key !== cachedKey || !cachedClient) {
    cachedKey = key;
    cachedClient = new GreenApiClient(credentials);
  }

  return cachedClient;
}
