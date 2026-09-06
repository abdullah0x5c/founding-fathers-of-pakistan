import Link from "next/link";
import UrduText from "./UrduText";
import styles from "./ChaiButton.module.css";

/**
 * The one call to action in the album, and it is set in Urdu only.
 *
 * It is built as a leaf in its own right rather than as a button: a slip of the
 * same cream stock, ruled in bronze and given a margin of the ground by two
 * box-shadow rings, with a rubric diamond either side of the line. That is why
 * it does not look like the rest of the web — a button here would be the only
 * object on the site that came from outside the album.
 *
 * `align` places it the way each leaf wants it: centred where it closes a
 * section, ranged left where it sits inside a column of text.
 */
export default function ChaiButton({ align = "center" }: { align?: "center" | "left" }) {
  return (
    <div className={align === "left" ? styles.wrapLeft : styles.wrap}>
      <Link href="/chai" className={`${styles.button} speck`}>
        <span className="diamond" aria-hidden="true" />
        <UrduText as="span" className={styles.label} align="center">
          ہادی کو ایک چائے پلائیں
        </UrduText>
        <span className="diamond" aria-hidden="true" />
      </Link>
    </div>
  );
}
