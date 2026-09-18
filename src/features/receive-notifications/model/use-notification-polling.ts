import { useEffect, useState } from 'react';
import { toast } from '@/shared/ui';
import { NotificationPoller } from './poller';

/**
 * Запускает длинный опрос очереди уведомлений, пока `enabled === true`.
 * Возвращает признак доступности очереди — его показывает индикатор в шапке.
 */
export function useNotificationPolling(enabled: boolean): { online: boolean } {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setOnline(true);
      return;
    }

    const poller = new NotificationPoller({
      onConnectionChange: setOnline,
      onError: (message) => toast.error(message),
    });

    poller.start();

    return () => poller.stop();
  }, [enabled]);

  return { online };
}
