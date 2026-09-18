import { ConnectForm } from '@/features/auth';
import { Logo } from '@/shared/ui';
import styles from './AuthPage.module.css';

export function AuthPage() {
  return (
    <main className={styles.root}>
      <div className={styles.card}>
        <aside className={styles.promo}>
          <div className={styles.promoTop}>
            <Logo inverted size="lg" />
          </div>

          <div className={styles.promoText}>
            <h2 className={styles.promoTitle}>
              Добро пожаловать
              <br />в MAX
            </h2>
            <p className={styles.promoSubtitle}>
              Подключите свой аккаунт GREEN-API, чтобы начать общение.
            </p>
          </div>

          <div className={styles.blobs} aria-hidden="true">
            <span className={styles.blobOne} />
            <span className={styles.blobTwo} />
            <span className={styles.blobThree} />
          </div>
        </aside>

        <div className={styles.formSide}>
          <ConnectForm />
        </div>
      </div>
    </main>
  );
}
