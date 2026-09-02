import FigurePlate from "@/components/FigurePlate";
import UrduText from "@/components/UrduText";
import { figures, worksFor, totalWorks, totalScans, lifespan } from "@/lib/catalogue";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={`${styles.main} soft-in`}>
      <section className={styles.masthead}>
        <div className={styles.titleRow}>
          <h1 className={`display ${styles.title}`}>
            Founding Fathers <em>of Pakistan</em>
          </h1>
          <UrduText className={styles.titleUrdu}>
            بانیانِ پاکستان
          </UrduText>
        </div>

        <hr className={`rule-fade ${styles.hr}`} />

        <div className={styles.lead}>
          <p className={styles.leadMain}>
            Between 1847 and 1950 a small number of men argued a country into existence — in
            treatises, law reports, pamphlets, newspapers, poetry and speeches. Among them were a
            district judge, a High Court barrister, a philosopher-poet, two nawabs of the Aligarh
            trust, a hereditary Imam, a pair of brothers who ran a newspaper, and a student at
            Cambridge who coined the name. They disagreed with one another, frequently and in print.
          </p>
          <p className={styles.leadAside}>
            This is their writing, gathered and read in place. Each figure opens to a life and a
            shelf; each work opens to its own page, with an introduction and the document itself.
            Nothing here is summarised in place of being shown, and where the record is thin the
            page says so.
          </p>
        </div>

        <div className={styles.stat}>
          Eleven lives · {lifespan.from}–{lifespan.to} · {totalWorks} works in {totalScans} scans ·
          English and Urdu
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span>The eleven</span>
          <span>In the collection&rsquo;s own order</span>
        </div>

        <div className={styles.grid}>
          {figures.map((f, i) => (
            <FigurePlate
              key={f.slug}
              figure={f}
              workCount={worksFor(f.slug).length}
              index={i}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
