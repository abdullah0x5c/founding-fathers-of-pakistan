import Link from "next/link";
import type { Metadata } from "next";
import { figures, worksFor, totalWorks, totalScans } from "@/lib/catalogue";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About and method",
  description:
    "Who the eleven are, on what criteria they were selected, where the scans came from, and how rights were assessed.",
};

export default function AboutPage() {
  return (
    <main className={`${styles.main} soft-in`}>
      <section className={styles.head}>
        <div className={styles.headRow}>
          <span className="diamond" aria-hidden="true" />
          <h1 className={`display ${styles.title}`}>About and method</h1>
        </div>
        <div className="illum" aria-hidden="true" />
      </section>

      <div className={styles.body}>
        <div className={styles.prose}>
          <h2>What this is</h2>
          <p>
            A reading archive of the primary writings of eleven figures associated with the founding
            of Pakistan. It holds {totalWorks} catalogued works in {totalScans} scanned documents:
            treatises, speeches, letters, poetry, law reports and pamphlets, in English and Urdu.
            Every item is dated where a date can be established, described, measured, and given a
            rights line.
          </p>

          <h2>Who selected the eleven, and on what criteria</h2>
          <p>
            The founding fathers&rsquo; list comes from Ahmad Hasan Dani&rsquo;s book, which goes by
            the same name, <em>Founding Fathers of Pakistan</em>. That list contains ten of the
            public figures here on the website, alongside an eleventh, Liaquat Ali Khan. The reason
            for this is his standing as the first Prime Minister of our country, a title which
            cannot be stripped of him regardless of his criticisms.
          </p>
          <p>
            Several inclusions are arguable in both directions. Sir Syed Ahmad Khan died forty-nine
            years before partition and his relationship to the two-nation theory is disputed.
            Chaudhry Rahmat Ali named the country and was then excluded from the movement that
            adopted the name; how much causal weight his pamphlets carry is an open historical
            question. Aga Khan III led the deputation that produced separate electorates and then
            spent most of his later life abroad. Despite all these contestations, the debates are
            open for intellectuals, and a general-purpose website is created for the public to
            follow through and come to their own conclusions.
          </p>

          <h2>Where the scans came from</h2>
          <p>
            All scans here are hosted by the Internet Archive. The collection runs to over a
            gigabyte. You can easily download any of the works present here.
          </p>
          <p>
            Scan quality is uneven and the records say so where it matters. Nonetheless, all of the
            works are readable and, mostly through OCR, their text is extractable and citable.
          </p>

          <h2>Rights</h2>
          <p>
            Copyright in Pakistan runs for the author&rsquo;s life plus fifty years, which places
            original works by figures who died before roughly 1976 in the public domain there. All
            eleven died before 1958, so their own writing is out of copyright.
          </p>
          <p>That does not settle every item, and three categories need separate treatment:</p>
          <ul>
            <li>
              <strong>Modern compilations.</strong> Several works here are twentieth-century
              collected editions whose selection, introduction and notes are likely still in
              copyright even though the underlying text is not.
            </li>
            <li>
              <strong>Secondary scholarship.</strong> One item, a study of Sir Syed by Christian W.
              Troll, is scholarship about a figure rather than writing by one. It is catalogued
              under a separate heading and marked as in copyright.
            </li>
            <li>
              <strong>The scans themselves.</strong> A scan may carry rights separate from the work
              it reproduces, held by whichever institution produced it.
            </li>
          </ul>

          <h2>Portraits</h2>
          <p>
            The eleven portraits are public-domain photographs, each sourced individually with its
            author, date and licence recorded in{" "}
            <a href="/portraits/CREDITS.md">the portrait credits</a>. Three are limited by their
            sources rather than by processing; the best free images that exist of those men are
            small or grainy. No portrait here is generated, reconstructed or illustrated.
          </p>

          <h2>What is incomplete</h2>
          <p>
            The collection is radically uneven, and the site does not hide it. Sir Syed Ahmad
            Khan&rsquo;s shelf runs to {worksFor("sir-syed-ahmad-khan").length} items; Maulana
            Shaukat Ali&rsquo;s and Liaquat Ali Khan&rsquo;s hold one apiece. Muhammad Ali Jinnah,
            the most famous of the eleven, has exactly one: a single compilation of his speeches,
            statements and quotations. He wrote no books, and his corpus is properly speeches and
            correspondence recorded by others.
          </p>
        </div>

        <aside className={styles.ledger}>
          <div className={styles.ledgerHead}>What is held</div>
          {figures.map((f) => {
            const n = worksFor(f.slug).length;
            return (
              <Link key={f.slug} href={`/f/${f.slug}`} className={styles.ledgerRow}>
                <span>
                  {f.n} {f.name}
                </span>
                <span className={styles.ledgerCount}>{n}</span>
              </Link>
            );
          })}
        </aside>
      </div>
    </main>
  );
}
