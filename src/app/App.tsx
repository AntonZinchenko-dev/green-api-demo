import { useEffect } from 'react';
import { useSessionStore } from '@/entities/session';
import { restoreSession } from '@/features/auth';
import { AuthPage } from '@/pages/auth';
import { ChatPage } from '@/pages/chat';
import { Spinner, ToastHost } from '@/shared/ui';
import styles from './App.module.css';

export function App() {
  const status = useSessionStore((state) => state.status);
  const hasCredentials = useSessionStore((state) => state.credentials !== null);

  // При загрузке страницы восстанавливаем сессию по сохранённым учётным данным.
  useEffect(() => {
    void restoreSession();
  }, []);

  const restoring = hasCredentials && status === 'connecting';

  return (
    <>
      {restoring ? (
        <div className={styles.splash}>
          <Spinner className={styles.spinner} />
          <p className={styles.splashText}>Подключаемся к GREEN-API…</p>
        </div>
      ) : status === 'connected' ? (
        <ChatPage />
      ) : (
        <AuthPage />
      )}

      <ToastHost />
    </>
  );
}
