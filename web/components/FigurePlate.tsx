import Image from "next/image";
import Link from "next/link";
import UrduText from "./UrduText";
import type { Figure } from "@/content/types";
import styles from "./FigurePlate.module.css";

/**
 * One figure on the index. The plates alternate between two heights and every
 * second and fourth in a row of five is pushed down, so the grid reads as a set
 * of hung frames rather than as a product listing.
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
  const aspect = index % 2 === 0 ? "3 / 4.15" : "3 / 3.55";
  const offset = index % 2 === 1 ? 34 : 0;

  return (
    <Link
      href={`/f/${figure.slug}`}
      className={`${styles.plate} rise-in`}
      style={{ marginTop: offset, animationDelay: `${index * 55}ms` }}
    >
      <div className={styles.frame} style={{ aspectRatio: aspect }}>
        <Image
          src={figure.portrait}
          alt={`Portrait of ${figure.name}`}
          fill
          sizes="(max-width: 600px) 45vw, (max-width: 1000px) 30vw, 320px"
          className={styles.portrait}
        />
        <span className={styles.duotone} aria-hidden="true" />
      </div>
      <div className={styles.rule} aria-hidden="true" />
      <div className={styles.line}>
        <span className={styles.n}>{figure.n}</span>
        <span className={styles.dates}>
          {figure.born}–{figure.died}
        </span>
      </div>
      <div className={styles.name}>{figure.name}</div>
      <UrduText className={styles.urdu} align="left">
        {figure.nameUrdu}
      </UrduText>
      <div className={styles.role}>
        {figure.role} ·{" "}
        {workCount === 0 ? "nothing held" : `${workCount} work${workCount === 1 ? "" : "s"}`}
      </div>
    </Link>
  );
}
