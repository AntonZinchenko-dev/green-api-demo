import { useState } from 'react';
import type { FormEvent } from 'react';
import { useSessionStore } from '@/entities/session';
import { resolveApiUrl } from '@/shared/api/green-api';
import { Button, InfoIcon, TextField } from '@/shared/ui';
import { connect } from '../model/connect';
import styles from './ConnectForm.module.css';

interface FormErrors {
  idInstance?: string;
  apiTokenInstance?: string;
}

export function ConnectForm() {
  const storedCredentials = useSessionStore((state) => state.credentials);
  const status = useSessionStore((state) => state.status);
  const serverError = useSessionStore((state) => state.error);

  const [idInstance, setIdInstance] = useState(storedCredentials?.idInstance ?? '');
  const [apiTokenInstance, setApiTokenInstance] = useState(
    storedCredentials?.apiTokenInstance ?? '',
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const loading = status === 'connecting';

  const validate = (): boolean => {
    const next: FormErrors = {};

    if (!idInstance.trim()) next.idInstance = 'Укажите idInstance';
    else if (!/^\d{6,}$/.test(idInstance.trim())) next.idInstance = 'idInstance состоит из цифр';

    if (!apiTokenInstance.trim()) next.apiTokenInstance = 'Укажите apiTokenInstance';
    else if (apiTokenInstance.trim().length < 20)
      next.apiTokenInstance = 'Токен выглядит слишком коротким';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    await connect({ idInstance: idInstance.trim(), apiTokenInstance: apiTokenInstance.trim() });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.heading}>
        <h1 className={styles.title}>Подключение к GREEN-API</h1>
        <p className={styles.subtitle}>
          Введите данные вашего аккаунта из системы GREEN-API. Они необходимы для подключения
          к мессенджеру MAX.
        </p>
      </div>

      <div className={styles.fields}>
        <TextField
          label="ID Instance"
          placeholder="Например: 1101123456"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          value={idInstance}
          error={errors.idInstance}
          onChange={(event) => {
            setIdInstance(event.target.value.replace(/\s/g, ''));
            setErrors((prev) => ({ ...prev, idInstance: undefined }));
          }}
        />

        <TextField
          label="API Token"
          placeholder="Введите ваш API Token"
          autoComplete="off"
          spellCheck={false}
          secret
          value={apiTokenInstance}
          error={errors.apiTokenInstance}
          onChange={(event) => {
            setApiTokenInstance(event.target.value.trim());
            setErrors((prev) => ({ ...prev, apiTokenInstance: undefined }));
          }}
        />
      </div>

      {serverError && (
        <p className={styles.serverError} role="alert">
          {serverError}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth loading={loading}>
        Подключиться
      </Button>

      <p className={styles.note}>
        <InfoIcon size={18} className={styles.noteIcon} />
        <span>
          Данные используются только для запросов к GREEN-API напрямую из браузера и хранятся
          в localStorage вашего устройства.
          {idInstance.trim().length >= 4 && (
            <>
              {' '}
              Запросы уйдут на <code>{resolveApiUrl(idInstance.trim())}</code>.
            </>
          )}
        </span>
      </p>
    </form>
  );
}
