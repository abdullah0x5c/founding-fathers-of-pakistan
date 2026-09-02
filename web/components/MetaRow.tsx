import styles from "./MetaRow.module.css";

/**
 * The label-and-value pair that does most of the archival work on this site.
 * Setting catalogue metadata in mono while prose stays in serif separates the
 * record from the writing, which carries more of the archival feel than any other
 * single choice in the system.
 */
export function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{children}</div>
    </div>
  );
}

/** The same pair on one of the light paper plates. */
export function MetaCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.rowPaper}>
      <div className={styles.labelPaper}>{label}</div>
      <div className={styles.valuePaper}>{children}</div>
    </div>
  );
}
