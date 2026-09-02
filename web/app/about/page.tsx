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
        <h1 className={`display ${styles.title}`}>
          About <em>and method</em>
        </h1>
        <hr className={`rule-fade ${styles.hr}`} />
      </section>

      <div className={styles.body}>
        <div className={styles.prose}>
          <h2>What this is</h2>
          <p>
            A reading archive of the primary writings of eleven figures associated with the founding
            of Pakistan. It holds {totalWorks} catalogued works in {totalScans} scanned documents —
            treatises, speeches, letters, poetry, law reports and pamphlets, in English and Urdu.
            Each figure has a page with a life and a shelf; each work has a page with a record and
            the document itself.
          </p>
          <p>
            The design principle throughout is that seriousness comes from apparatus rather than
            from ornament. Every item is dated where a date can be established, described, measured,
            and given a rights line. Where something is not known, the page says it is not known
            rather than guessing.
          </p>

          <h2>Who selected the eleven, and on what criteria</h2>
          <p>
            &ldquo;Founding fathers of Pakistan&rdquo; is not a fixed or uncontested list, and
            several of the inclusions here are genuinely debated by historians on different grounds.
            The list is not a judgement about who deserves the title. It is a description of a
            collection that already existed.
          </p>
          <p>
            Ten of the eleven come from the folders of the source archive this site was built from,
            in that archive&rsquo;s own order — roughly chronological by the start of public
            activity rather than by birth. The eleventh, Liaquat Ali Khan, was added because the
            collection held a volume of his speeches that was sitting unfiled, and leaving a sourced
            document out of the catalogue seemed worse than the awkwardness of including a
            successor among founders.
          </p>
          <p>
            Several inclusions are arguable in both directions. Sir Syed Ahmad Khan died forty-nine
            years before partition and his relationship to the two-nation theory is disputed.
            Chaudhry Rahmat Ali named the country and was then excluded from the movement that
            adopted the name; how much causal weight his pamphlets carry is an open historical
            question. Aga Khan III led the deputation that produced separate electorates and then
            spent most of his later life abroad. The archive presents them together because they are
            usually presented together, not because the grouping is settled.
          </p>

          <h2>Where the scans came from</h2>
          <p>
            The documents were gathered from public sources as scanned PDFs. Provenance was not
            recorded at the time of collection, so the holder field on most records currently reads
            &ldquo;not established.&rdquo; That is a real gap and it is shown as one rather than
            filled with a plausible guess. Where the scan itself names a holding institution — the
            Digital Library of India volume, for example — that is recorded.
          </p>
          <p>
            The scans are hosted by the Internet Archive rather than by this site. The collection
            runs to over a gigabyte and a single volume of speeches occupies nearly four hundred
            megabytes; serving files at that size directly would fail on an ordinary connection.
            Every work page states its file size before you commit to a download.
          </p>
          <p>
            Scan quality is uneven and the records say so where it matters. Two documents in
            particular were scanned at very high resolution and are far heavier than their page
            counts suggest.
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
              <strong>Secondary scholarship.</strong> One item — a study of Sir Syed by Christian W.
              Troll — is scholarship about a figure rather than writing by one. It is catalogued
              under a separate heading and marked as in copyright.
            </li>
            <li>
              <strong>The scans themselves.</strong> A scan may carry rights separate from the work
              it reproduces, held by whichever institution produced it.
            </li>
          </ul>
          <p>
            Every work page carries a rights line. Those lines are a working assessment, not legal
            advice, and the current Pakistani copyright legislation and the terms of each source
            archive should be checked before any item is redistributed.
          </p>

          <h2>Portraits</h2>
          <p>
            The eleven portraits are public-domain photographs, each sourced individually with its
            author, date and licence recorded in{" "}
            <a href="/portraits/CREDITS.md">the portrait credits</a>. Three are limited by their
            sources rather than by processing — the best free images that exist of those men are
            small or grainy. No portrait here is generated, reconstructed or illustrated.
          </p>

          <h2>What is incomplete</h2>
          <p>
            The collection is radically uneven, and the site does not hide it. One figure has
            eighteen items and three have one apiece. Muhammad Ali Jinnah, the most famous of the
            eleven, currently has none: he wrote no books, his corpus is speeches and correspondence
            recorded by others, and the single file collected for him was an interrupted download
            that cannot be opened. His page shows an empty shelf and explains why.
          </p>
          <p>
            An archive that shows its gaps reads as honest; one that conceals them reads as
            marketing. The counts on this site are counts of what is held. There are no
            denominators, because a defensible count of each figure&rsquo;s total known works would
            have to come from a real bibliography, and inventing those numbers would undermine
            everything else on the page.
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
                <span className={styles.ledgerCount}>{n === 0 ? "—" : n}</span>
              </Link>
            );
          })}
        </aside>
      </div>
    </main>
  );
}
