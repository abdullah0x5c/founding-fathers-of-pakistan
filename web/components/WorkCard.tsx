import Link from "next/link";
import UrduText from "./UrduText";
import { formatPages } from "@/lib/archive";
import type { Work } from "@/content/types";
import styles from "./WorkCard.module.css";

export default function WorkCard({ work }: { work: Work }) {
  return (
    <Link href={`/f/${work.figure}/${work.slug}`} className={styles.card}>
      <div className={styles.spine} aria-hidden="true">
        <span className={`${styles.spineText} ${work.year ? "" : styles.spineUndated}`}>
          {work.year || "Undated"}
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.title}>{work.title}</div>
        {work.titleUrdu && (
          <UrduText className={styles.urdu} align="left">
            {work.titleUrdu}
          </UrduText>
        )}
        {work.byline && <div className={styles.byline}>by {work.byline}</div>}

        <div className={styles.meta}>
          {work.secondary && <span className={styles.tag}>About</span>}
          {work.kind} · {work.lang} · {formatPages(work.pages)} pp.
        </div>

        {work.editions && work.editions.length > 0 && (
          <div className={styles.editions}>
            {work.editions.map((e) => (
              <div key={e.sourceFile} className={styles.edition}>
                {e.label} · {formatPages(e.pages)} pp.
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.open}>Open</div>
    </Link>
  );
}
