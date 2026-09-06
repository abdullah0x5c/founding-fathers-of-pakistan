import FigurePlate from "@/components/FigurePlate";
import ChaiButton from "@/components/ChaiButton";
import UrduText from "@/components/UrduText";
import { figures, worksFor, totalWorks, totalScans, lifespan } from "@/lib/catalogue";
import styles from "./page.module.css";

/* The eleven are laid out as a facing spread — six on the verso, five on the
   recto — divided by a ruled gutter, the way an album opens. */
const VERSO = figures.slice(0, 6);
const RECTO = figures.slice(6);

export default function Home() {
  return (
    <main className={`${styles.main} soft-in`}>
      {/* ── f. 1r · the sarlauh, the illuminated opening leaf ── */}
      <section className={styles.opening}>
        <div className={`folio ${styles.folioRight}`}>f. 1r</div>

        <div className="mount">
          <div className={styles.mountInner}>
            <div className={`${styles.sarlauh} speck`}>
              <span className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
              <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

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

              {/* The foot of the panel is a band of the ground itself, so the
                  leaf reads as mounted rather than as printed on. */}
              <div className={styles.foot} aria-hidden="true" />
            </div>

            <div className={styles.lead}>
              <p className={styles.leadEn}>
                Between {lifespan.from} and 1950 a small number of men argued a country into
                existence — in treatises, law reports, pamphlets, newspapers, poetry and speeches.
                Among them were a district judge, a High Court barrister, a philosopher-poet, two
                nawabs of the Aligarh trust, a hereditary Imam, a pair of brothers who ran a
                newspaper, and a student at Cambridge who coined the name. They disagreed with one
                another, frequently and in print.
              </p>

              <div className={`gutter ${styles.leadGutter}`} aria-hidden="true" />

              <UrduText as="p" className={styles.leadUr}>
                ۱۸۴۷ء اور ۱۹۵۰ء کے درمیان چند افراد نے ایک ملک کو دلیل کے زور پر وجود میں لایا —
                رسالوں، عدالتی فیصلوں، پمفلٹوں، اخبارات، شاعری اور تقریروں کے ذریعے۔ اِن میں ایک
                ضلعی جج، ہائی کورٹ کا ایک بیرسٹر، ایک فلسفی شاعر، علی گڑھ ٹرسٹ کے دو نواب، ایک
                موروثی امام، ایک اخبار چلانے والے دو بھائی، اور کیمبرج کا ایک طالبِ علم شامل تھے جس
                نے اِس ملک کا نام تجویز کیا۔ وہ ایک دوسرے سے اختلاف کرتے رہے، بار بار اور طبع شدہ
                صورت میں۔
              </UrduText>
            </div>

            <p className={styles.leadClose}>
              This is their writing, gathered and read in place. Each figure opens to a life and a
              shelf; each work opens to its own page, with an introduction and the document itself.
              Nothing here is summarised in place of being shown, and where the record is thin the
              page says so.
            </p>
          </div>
        </div>
      </section>

      <ChaiButton />

      {/* ── f. 2r · the eleven, as a facing spread ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className="diamond" aria-hidden="true" />
          <h2 className={`display ${styles.sectionTitle}`}>The Eleven</h2>
          <span className={styles.sectionFill} aria-hidden="true" />
          <span className={styles.sectionNote}>
            in the collection&rsquo;s own order &nbsp;·&nbsp;{" "}
            <span className="folio">f. 2r</span>
          </span>
        </div>
        <div className={`illum ${styles.sectionRule}`} aria-hidden="true" />

        <div className={styles.spread}>
          <div className={styles.leaf}>
            {VERSO.map((f, i) => (
              <FigurePlate key={f.slug} figure={f} workCount={worksFor(f.slug).length} index={i} />
            ))}
          </div>

          <div className={`gutter ${styles.gutter}`} aria-hidden="true" />

          <div className={styles.leaf}>
            {RECTO.map((f, i) => (
              <FigurePlate
                key={f.slug}
                figure={f}
                workCount={worksFor(f.slug).length}
                index={i + VERSO.length}
              />
            ))}
          </div>
        </div>

        <div className={styles.tally}>
          Eleven lives · {lifespan.from}–{lifespan.to} · {totalWorks} works in {totalScans} scans ·
          English, Urdu and Persian
        </div>
      </section>

      <ChaiButton />
    </main>
  );
}
