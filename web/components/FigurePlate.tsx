import Image from "next/image";
import Link from "next/link";
import UrduText from "./UrduText";
import { urduNumeral } from "@/lib/urdu";
import type { Figure } from "@/content/types";
import styles from "./FigurePlate.module.css";

/**
 * One figure on the index, mounted the way a portrait is mounted in an album:
 * cut to a pishtaq arch, laid on a cross-hatched bronze field, bordered, then
 * captioned on a dark plaque cut from the ground itself. The leaf numeral sits
 * in a roundel over the top-left corner, half off the mount, as a scribe's
 * foliation mark does.
 *
 * The plates are a plain grid here — the alternating drop the old design used
 * belongs to a gallery hang, not to an album, where facing leaves are ruled to
 * the same height on purpose.
 */
export default function FigurePlate({
  figure,
  workCount,
  index,
}: {
  figure: Figure;
  workCount: number;
  index: number;
}) {
  return (
    <Link
      href={`/f/${figure.slug}`}
      className={`${styles.plate} mounted rise-in`}
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <div className={`${styles.frame} hatch`}>
        <div className={styles.window}>
          <Image
            src={figure.portrait}
            alt={`Portrait of ${figure.name}`}
            fill
            sizes="(max-width: 700px) 45vw, (max-width: 1080px) 30vw, 260px"
            className={styles.portrait}
          />
        </div>
      </div>

      <div className={styles.plaque}>
        <UrduText className={styles.urdu} align="center">
          {figure.nameUrdu}
        </UrduText>
        <div className={styles.name}>{figure.name}</div>
        <div className={styles.role}>
          {figure.role} · {figure.born}–{figure.died}
        </div>
        <div className={styles.held}>
          {workCount === 0 ? "nothing held" : `${workCount} work${workCount === 1 ? "" : "s"} held`}
        </div>
      </div>

      <div className={styles.numeral} aria-hidden="true">
        {urduNumeral(Number(figure.n))}
      </div>
    </Link>
  );
}
