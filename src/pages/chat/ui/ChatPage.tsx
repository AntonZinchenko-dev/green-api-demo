import { useState } from 'react';
import { useChatsStore } from '@/entities/chat';
import { useSessionStore } from '@/entities/session';
import { NewChatDialog } from '@/features/create-chat';
import { SettingsDialog } from '@/features/instance-settings';
import { useNotificationPolling } from '@/features/receive-notifications';
import { AppSidebar } from '@/widgets/app-sidebar';
import { ChatList } from '@/widgets/chat-list';
import { ChatWindow } from '@/widgets/chat-window';
import { cn } from '@/shared/lib/cn';
import styles from './ChatPage.module.css';

export function ChatPage() {
  const status = useSessionStore((state) => state.status);
  const activeChatKey = useChatsStore((state) => state.activeChatKey);

  const [newChatOpen, setNewChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { online } = useNotificationPolling(status === 'connected');

  return (
    <div className={cn(styles.root, activeChatKey && styles.chatOpen)}>
      <AppSidebar
        onNewChat={() => setNewChatOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className={styles.panes}>
        <div className={styles.listPane}>
          <ChatList onNewChat={() => setNewChatOpen(true)} />
        </div>

        <div className={styles.windowPane}>
          <ChatWindow online={online} onOpenSettings={() => setSettingsOpen(true)} />
        </div>
      </div>

      <NewChatDialog open={newChatOpen} onClose={() => setNewChatOpen(false)} />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
