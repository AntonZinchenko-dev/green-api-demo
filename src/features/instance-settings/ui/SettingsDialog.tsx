import { useChatsStore } from '@/entities/chat';
import { useMessagesStore } from '@/entities/message';
import { useSessionStore } from '@/entities/session';
import { resolveApiUrl } from '@/shared/api';
import { Button, LogoutIcon, Modal, TrashIcon, toast } from '@/shared/ui';
import styles from './SettingsDialog.module.css';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const STATE_LABELS: Record<string, string> = {
  authorized: 'Авторизован',
  notAuthorized: 'Не авторизован',
  starting: 'Запускается',
  blocked: 'Заблокирован',
  sleepMode: 'Спящий режим',
  yellowCard: 'Ограничен',
};

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const credentials = useSessionStore((state) => state.credentials);
  const instanceState = useSessionStore((state) => state.instanceState);
  const chatsCount = useChatsStore((state) => state.chats.length);

  if (!credentials) return null;

  const handleClearHistory = () => {
    useChatsStore.getState().reset();
    useMessagesStore.getState().reset();
    useChatsStore.getState().claimOwner(credentials.idInstance);
    toast.success('Локальная история очищена');
    onClose();
  };

  // Закрываем сессию: учётные данные стираются, локальные чаты остаются.
  const handleDisconnect = () => {
    useSessionStore.getState().reset();
    useChatsStore.getState().setActiveChat(null);
    onClose();
  };

  return (
    <Modal open={open} title="Настройки" onClose={onClose}>
      <div className={styles.root}>
        <dl className={styles.list}>
          <div className={styles.row}>
            <dt>ID Instance</dt>
            <dd>{credentials.idInstance}</dd>
          </div>
          <div className={styles.row}>
            <dt>Хост API</dt>
            <dd className={styles.mono}>
              {resolveApiUrl(credentials.idInstance, credentials.apiUrl)}
            </dd>
          </div>
          <div className={styles.row}>
            <dt>Состояние инстанса</dt>
            <dd>{instanceState ? (STATE_LABELS[instanceState] ?? instanceState) : '—'}</dd>
          </div>
          <div className={styles.row}>
            <dt>Чатов сохранено</dt>
            <dd>{chatsCount}</dd>
          </div>
        </dl>

        <p className={styles.note}>
          Переписка хранится только в этом браузере. GREEN-API отдаёт входящие сообщения
          из очереди уведомлений, история за прошлые сессии в неё не попадает.
        </p>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            fullWidth
            startIcon={<TrashIcon size={18} />}
            onClick={handleClearHistory}
          >
            Очистить историю
          </Button>
          <Button
            variant="danger"
            fullWidth
            startIcon={<LogoutIcon size={18} />}
            onClick={handleDisconnect}
          >
            Отключиться
          </Button>
        </div>
      </div>
    </Modal>
  );
}
