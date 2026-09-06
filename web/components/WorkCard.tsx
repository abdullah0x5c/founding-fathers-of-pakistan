import Link from "next/link";
import UrduText from "./UrduText";
import { formatPages } from "@/lib/archive";
import { urduNumeral } from "@/lib/urdu";
import type { Work } from "@/content/types";
import styles from "./WorkCard.module.css";

/**
 * One line of the shelf. Not a card — a shelf in a muraqqa is a numbered list in
 * the margin of the leaf, so this is a numeral in a hanging column and an entry
 * beside it, with the whole row as the target.
 *
 * Editions are counted in the description line rather than listed under it. A
 * translation is not a second work, and listing it beside the original doubles
 * the apparent size of the shelf without adding anything to it.
 */
export default function WorkCard({ work, index }: { work: Work; index: number }) {
  const editions = work.editions?.length ?? 0;

  return (
    <Link href={`/f/${work.figure}/${work.slug}`} className={styles.row}>
      <div className={styles.numeral} aria-hidden="true">
        {urduNumeral(index + 1)}
      </div>

      <div className={styles.entry}>
        <div className={styles.title}>{work.title}</div>

        {work.titleUrdu && (
          <UrduText className={styles.urdu} align="left">
            {work.titleUrdu}
          </UrduText>
        )}

        {work.byline && <div className={styles.byline}>by {work.byline}</div>}

        <div className={styles.meta}>
          {work.secondary ? "About" : work.kind} · {work.lang}
          {work.year ? ` · ${work.year}` : ""} · {formatPages(work.pages)} pp.
          {editions > 0 &&
            ` · ${editions === 1 ? "one further edition" : `${editions} further editions`}`}
        </div>
      </div>
    </Link>
  );
}
