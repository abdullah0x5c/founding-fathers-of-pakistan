import Image from "next/image";
import FigurePlate from "@/components/FigurePlate";
import ChaiButton from "@/components/ChaiButton";
import UrduText from "@/components/UrduText";
import { figures, worksFor } from "@/lib/catalogue";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={`${styles.main} soft-in`}>
      {/* ── the sarlauh, the illuminated opening leaf ── */}
      <section className={styles.opening}>
        <div className="mount">
          <div className={styles.mountInner}>
            <div className={`${styles.sarlauh} speck`}>
              <span className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
              <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

              {/* The frontispiece: a photographic plate bound into the head of
                  the illuminated leaf, before the title takes over. */}
              <figure className={styles.frontispiece}>
                <Image
                  src="/site/frontispiece.jpg"
                  alt="A group portrait of the founding fathers of Pakistan"
                  width={619}
                  height={420}
                  sizes="(max-width: 900px) 100vw, 900px"
                  className={styles.frontispieceImg}
                  priority
                />
                <figcaption className={`label ${styles.frontispieceCaption}`}>
                  The founders, together
                </figcaption>
              </figure>

              <div className={styles.sarlauhBody}>
                <UrduText as="h2" className={`urdu-display ${styles.titleUrdu}`} align="center">
                  بانیانِ پاکستان
                </UrduText>

                <div className={`illum ${styles.titleRule}`} aria-hidden="true" />

                <h1 className={`display ${styles.title}`}>
                  Founding Fathers
                  <br />
                  of Pakistan
                </h1>
                <div className={styles.subtitle}>a reading collection of primary works</div>
              </div>

              {/* The foot of the panel is a band of the ground itself, so the
                  leaf reads as mounted rather than as printed on. */}
              <div className={styles.foot} aria-hidden="true" />
            </div>

            <p className={styles.lead}>
              The founding fathers of Pakistan, as described by Ahmad Hasan Dani in his book, and
              all of their works, now in the public domain, are presented here for accessible
              viewing. Among them were a district judge, a High Court barrister, a
              philosopher-poet, two nawabs of the Aligarh trust, a hereditary Imam, a pair of
              brothers who ran a newspaper, and a student at Cambridge who coined the name.
            </p>

            <p className={styles.leadClose}>
              All of their writings are gathered here for the one interested to view. If you like
              this collection or have benefitted from it, consider buying us a chai or coffee.
              Funding also helps us keep the website up. Pakistan Zindabad.
            </p>

            <ChaiButton />
          </div>
        </div>
      </section>

      {/* ── the eleven ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className="diamond" aria-hidden="true" />
          <h2 className={`display ${styles.sectionTitle}`}>The Eleven</h2>
        </div>
        <div className={`illum ${styles.sectionRule}`} aria-hidden="true" />

        {/* One centred grid rather than a two-leaf spread: with eleven plates a
            split always leaves a gap, and a centred last row reads as complete. */}
        <div className={styles.grid}>
          {figures.map((f, i) => (
            <FigurePlate key={f.slug} figure={f} workCount={worksFor(f.slug).length} index={i} />
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <a
          href="https://linkedin.com/in/haadi42"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.footerLink}
        >
          Muhammad Hadi on LinkedIn
        </a>
      </footer>
    </main>
  );
}
