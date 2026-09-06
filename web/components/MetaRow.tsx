import styles from "./MetaRow.module.css";

/**
 * One line of the colophon — the label-and-value pair that does most of the
 * archival work on this site.
 *
 * The label is set in small capitals and ranged right against the value, so the
 * labels form a straight edge down the middle of the block and the values hang
 * off it. That alignment is what makes a list of fields read as a record rather
 * than as a caption, and it is why the label column is a fixed measure.
 */
export function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{children}</span>
    </div>
  );
}

/** The same pair stacked, for narrow columns where 7.5em of label will not fit. */
export function MetaCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.cell}>
      <div className={styles.cellLabel}>{label}</div>
      <div className={styles.cellValue}>{children}</div>
    </div>
  );
}
