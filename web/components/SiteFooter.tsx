import Link from "next/link";
import { figures } from "@/lib/catalogue";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.mark}>
            Founding Fathers <em>of Pakistan</em>
          </div>
          <p className={styles.blurb}>
            A reading collection of primary works. The scans are hosted by the Internet Archive;
            the portraits are public-domain photographs, sourced individually in{" "}
            <a href="/portraits/CREDITS.md">the portrait credits</a>. The collection is incomplete
            and says where.
          </p>
        </div>
        <nav className={styles.index}>
          {figures.map((f) => (
            <Link key={f.slug} href={`/f/${f.slug}`} className={styles.indexLink}>
              {f.n} — {f.name}
            </Link>
          ))}
          <Link href="/about" className={styles.indexLink}>
            — About and method
          </Link>
        </nav>
      </div>
    </footer>
  );
}
