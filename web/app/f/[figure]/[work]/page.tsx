import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import UrduText from "@/components/UrduText";
import WorkViewer from "@/components/WorkViewer";
import ChaiButton from "@/components/ChaiButton";
import VerifyNotes from "@/components/VerifyNotes";
import { MetaRow } from "@/components/MetaRow";
import { allWorkParams, getFigure, getWork, nextWork } from "@/lib/catalogue";
import { formatBytes, formatPages, iaDetails } from "@/lib/archive";
import styles from "./page.module.css";

export function generateStaticParams() {
  return allWorkParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ figure: string; work: string }>;
}): Promise<Metadata> {
  const { figure, work: workSlug } = await params;
  const work = getWork(figure, workSlug);
  if (!work) return {};
  return { title: work.title, description: work.intro.slice(0, 180) };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ figure: string; work: string }>;
}) {
  const { figure: figureSlug, work: workSlug } = await params;
  const figure = getFigure(figureSlug);
  const work = getWork(figureSlug, workSlug);
  if (!figure || !work) notFound();

  const next = nextWork(figureSlug, workSlug);

  return (
    <main className={`${styles.main} soft-in`}>
      {/* the running head, as it sits across the top of a leaf */}
      <div className={styles.runningHead}>
        <span className="diamond" aria-hidden="true" />
        <span className={styles.crumb}>
          <Link href="/">The Eleven</Link>
          <span className={styles.dot}>·</span>
          <Link href={`/f/${figure.slug}`}>{figure.name}</Link>
          <span className={styles.dot}>·</span>
          {work.year || "undated"}
        </span>
        <span className={styles.fill} aria-hidden="true" />
        <span className="folio">f. {Number(figure.n)}r</span>
      </div>
      <div className={`illum ${styles.headRule}`} aria-hidden="true" />

      <div className={styles.record}>
        <div className={styles.statement}>
          {work.titleUrdu && (
            <UrduText as="h2" className={`urdu-display ${styles.titleUrdu}`} align="left">
              {work.titleUrdu}
            </UrduText>
          )}
          <h1 className={`display ${styles.title}`}>{work.title}</h1>
          <div className={styles.byline}>
            {work.secondary ? `${work.kind} by ${work.byline ?? "an unnamed hand"}` : work.kind}
            {" · "}
            {work.lang}
            {work.printed ? ` · ${work.printed}` : ""}
          </div>

          <p className={styles.intro}>{work.intro}</p>

          {work.scanNote && <p className={styles.scanNote}>{work.scanNote}</p>}

          {/* Ranged left here rather than centred: inside a column of text it is
              another line of the column, not a device closing a section. */}
          <ChaiButton align="left" />

          {work.editions && work.editions.length > 0 && (
            <div className={styles.editions}>
              <div className={styles.editionsHead}>Other editions held</div>
              {work.editions.map((e) => (
                <div key={e.sourceFile} className={styles.edition}>
                  <span className={styles.editionLabel}>{e.label}</span>
                  <span className={styles.editionMeta}>
                    {e.lang} · {formatPages(e.pages)} pp. · {formatBytes(e.bytes)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* The colophon, set in the outer margin. In a muraqqa the description
            of a leaf is written on the mount beside it, never on the leaf. */}
        <aside className={`${styles.colophon} mounted speck`}>
          <span className={`${styles.corner} ${styles.cTL}`} aria-hidden="true" />
          <span className={`${styles.corner} ${styles.cTR}`} aria-hidden="true" />
          <span className={`${styles.corner} ${styles.cBL}`} aria-hidden="true" />
          <span className={`${styles.corner} ${styles.cBR}`} aria-hidden="true" />

          <div className={`display ${styles.colophonHead}`}>Colophon</div>
          <div className={`illum ${styles.colophonRule}`} aria-hidden="true" />

          <div className={styles.fields}>
            <MetaRow label={work.secondary ? "Subject" : "Author"}>{figure.name}</MetaRow>
            {work.byline && <MetaRow label="Written by">{work.byline}</MetaRow>}
            <MetaRow label="Dated">{work.year || <em>Not established</em>}</MetaRow>
            <MetaRow label="Form">{work.secondary ? "Secondary scholarship" : work.kind}</MetaRow>
            <MetaRow label="Language">{work.lang}</MetaRow>
            <MetaRow label="Extent">
              {formatPages(work.pages)} pp. · {formatBytes(work.bytes)}
            </MetaRow>
            <MetaRow label="Printed">{work.printed || <em>Not established</em>}</MetaRow>
            <MetaRow label="Holder">{work.holder || <em>Not established</em>}</MetaRow>
            <MetaRow label="Rights">{work.rights}</MetaRow>
            <MetaRow label="Source">
              {work.r2Key ? "Held in the archive" : <em>Not yet uploaded</em>}
              {work.iaIdentifier && (
                <>
                  {" · "}
                  <a href={iaDetails(work.iaIdentifier)} rel="noopener">
                    also at the Internet Archive
                  </a>
                </>
              )}
            </MetaRow>
          </div>
        </aside>
      </div>

      {/* the document itself */}
      <div className={styles.openingLine}>
        <span className={styles.lineFill} aria-hidden="true" />
        <span className={styles.pip} aria-hidden="true" />
        <span className="diamond" aria-hidden="true" />
        <span className={styles.lineLabel}>
          the document, in {formatPages(work.pages)} leaves
        </span>
        <span className="diamond" aria-hidden="true" />
        <span className={styles.pip} aria-hidden="true" />
        <span className={`${styles.lineFill} ${styles.lineFillR}`} aria-hidden="true" />
      </div>

      <WorkViewer work={work} />

      <VerifyNotes notes={work.verify} />

      <nav className={styles.nav}>
        <Link href={`/f/${figure.slug}`} className={styles.navLink}>
          ← All works by {figure.name}
        </Link>
        {next && (
          <Link href={`/f/${figure.slug}/${next.slug}`} className={styles.navLink}>
            Next: {next.title} →
          </Link>
        )}
      </nav>
    </main>
  );
}
