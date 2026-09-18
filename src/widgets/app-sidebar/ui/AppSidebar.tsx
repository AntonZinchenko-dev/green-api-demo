import { ChatIcon, Logo, PlusIcon, SettingsIcon } from '@/shared/ui';
import styles from './AppSidebar.module.css';

interface AppSidebarProps {
  onNewChat: () => void;
  onOpenSettings: () => void;
}

export function AppSidebar({ onNewChat, onOpenSettings }: AppSidebarProps) {
  return (
    <nav className={styles.root} aria-label="Основная навигация">
      <div className={styles.header}>
        <Logo />
      </div>

      <ul className={styles.menu}>
        <li>
          <button
            type="button"
            className={`${styles.item} ${styles.active}`}
            aria-current="page"
            title="Чаты"
          >
            <ChatIcon size={20} />
            <span className={styles.label}>Чаты</span>
          </button>
        </li>
        <li>
          <button type="button" className={styles.item} onClick={onNewChat} title="Новый чат">
            <PlusIcon size={20} />
            <span className={styles.label}>Новый чат</span>
          </button>
        </li>
      </ul>

      <button
        type="button"
        className={`${styles.item} ${styles.footer}`}
        onClick={onOpenSettings}
        title="Настройки"
      >
        <SettingsIcon size={20} />
        <span className={styles.label}>Настройки</span>
      </button>
    </nav>
  );
}
