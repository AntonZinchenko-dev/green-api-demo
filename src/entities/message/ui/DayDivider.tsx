import styles from './DayDivider.module.css';

export function DayDivider({ label }: { label: string }) {
  return (
    <div className={styles.root}>
      <span className={styles.pill}>{label}</span>
    </div>
  );
}
