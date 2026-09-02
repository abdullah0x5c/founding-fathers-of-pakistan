import Link from "next/link";
import { totalWorks } from "@/lib/catalogue";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.wordmark}>
        <span className={styles.diamond} aria-hidden="true" />
        <span className={styles.wordmarkText}>Founding Fathers of Pakistan</span>
      </Link>
      <nav className={styles.nav}>
        <Link href="/" className={styles.link}>
          The Eleven
        </Link>
        <Link href="/about" className={styles.link}>
          About
        </Link>
        <span className={styles.count}>{totalWorks} Works</span>
      </nav>
    </header>
  );
}
