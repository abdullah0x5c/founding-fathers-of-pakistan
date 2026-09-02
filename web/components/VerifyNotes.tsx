import styles from "./VerifyNotes.module.css";

/**
 * Claims written from general knowledge rather than read off the scans. They are
 * rendered in development so the list of things still to check stays visible while
 * the site is being worked on, and disappear entirely from the production build.
 *
 * An archive that invents provenance is worse than one that admits a gap, so
 * nothing in here should reach the public site unresolved.
 */
export default function VerifyNotes({ notes }: { notes?: string[] }) {
  if (process.env.NODE_ENV === "production") return null;
  if (!notes || notes.length === 0) return null;

  return (
    <aside className={styles.box}>
      <div className={styles.head}>Unverified · {notes.length} to check before launch</div>
      <ul className={styles.list}>
        {notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </aside>
  );
}
