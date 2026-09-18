import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { maskPhoneInput } from '@/shared/lib/phone';
import { Button, Modal, TextField, toast } from '@/shared/ui';
import { createChat } from '../model/create-chat';
import styles from './NewChatDialog.module.css';

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
}

export function NewChatDialog({ open, onClose }: NewChatDialogProps) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setPhone('');
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createChat(phone);

    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? 'Не удалось создать чат');
      return;
    }

    if (result.warning) toast.info(result.warning);
    onClose();
  };

  return (
    <Modal open={open} title="Новый чат" onClose={onClose}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          label="Номер телефона получателя"
          placeholder="+7 999 123-45-67"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          error={error}
          hint="Введите номер в международном формате"
          startSlot={<span className={styles.flag}>🇷🇺</span>}
          onChange={(event) => {
            setPhone(maskPhoneInput(event.target.value));
            setError(null);
          }}
        />

        <div className={styles.actions}>
          <Button type="submit" fullWidth loading={loading}>
            Создать чат
          </Button>
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Отмена
          </Button>
        </div>
      </form>
    </Modal>
  );
}
