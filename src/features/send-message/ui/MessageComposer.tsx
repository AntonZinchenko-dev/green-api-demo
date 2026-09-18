import { useLayoutEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { MAX_MESSAGE_LENGTH } from '@/shared/config';
import { PlusIcon, SendIcon, toast } from '@/shared/ui';
import { sendMessage } from '../model/send-message';
import styles from './MessageComposer.module.css';

const MAX_TEXTAREA_HEIGHT = 140;

export function MessageComposer({ chatKey }: { chatKey: string }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Textarea растёт вместе с текстом, но не выше MAX_TEXTAREA_HEIGHT.
  useLayoutEffect(() => {
    const node = textareaRef.current;
    if (!node) return;

    node.style.height = 'auto';
    node.style.height = `${Math.min(node.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [text]);

  // Переключились на другой чат — очищаем черновик и возвращаем фокус.
  useLayoutEffect(() => {
    setText('');
    textareaRef.current?.focus();
  }, [chatKey]);

  const submit = async () => {
    const value = text.trim();
    if (!value || sending) return;

    setSending(true);
    setText('');

    const result = await sendMessage(chatKey, value);

    setSending(false);
    textareaRef.current?.focus();

    if (!result.ok) {
      toast.error(result.error ?? 'Не удалось отправить сообщение');
      // Возвращаем текст, чтобы пользователь не потерял его.
      setText((current) => current || value);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  };

  const canSend = text.trim().length > 0 && !sending;

  return (
    <form className={styles.root} onSubmit={handleSubmit}>
      <button
        type="button"
        className={styles.attach}
        aria-label="Вложения недоступны: поддерживаются только текстовые сообщения"
        title="Поддерживаются только текстовые сообщения"
        disabled
      >
        <PlusIcon size={20} />
      </button>

      <textarea
        ref={textareaRef}
        className={`${styles.input} scrollable`}
        placeholder="Написать сообщение…"
        rows={1}
        maxLength={MAX_MESSAGE_LENGTH}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Текст сообщения"
      />

      <button
        type="submit"
        className={styles.send}
        disabled={!canSend}
        aria-label="Отправить сообщение"
      >
        <SendIcon size={20} />
      </button>
    </form>
  );
}
