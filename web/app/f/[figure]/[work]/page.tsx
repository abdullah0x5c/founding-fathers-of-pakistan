import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import UrduText from "@/components/UrduText";
import WorkViewer from "@/components/WorkViewer";
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
      <div className={styles.crumb}>
        <Link href="/">The Eleven</Link>
        <span className={styles.slash}>/</span>
        <Link href={`/f/${figure.slug}`}>{figure.name}</Link>
        <span className={styles.slash}>/</span>
        {work.year || "Undated"}
      </div>

      <section className={styles.head}>
        <div className={styles.titleRow}>
          <h1 className={`display ${styles.title}`}>{work.title}</h1>
          {work.titleUrdu && (
            <UrduText className={styles.titleUrdu}>
              {work.titleUrdu}
            </UrduText>
          )}
        </div>

        {work.byline && <div className={styles.byline}>by {work.byline}</div>}

        <hr className={`rule-fade ${styles.hr}`} />

        <div className={styles.record}>
          <p className={styles.intro}>{work.intro}</p>

          <div className={styles.fields}>
            <MetaRow label={work.secondary ? "Subject" : "Author"}>{figure.name}</MetaRow>
            {work.byline && <MetaRow label="Written by">{work.byline}</MetaRow>}
            <MetaRow label="Dated">{work.year || "Not established"}</MetaRow>
            <MetaRow label="Form">{work.secondary ? "Secondary scholarship" : work.kind}</MetaRow>
            <MetaRow label="Language">{work.lang}</MetaRow>
            <MetaRow label="Extent">
              {formatPages(work.pages)} pp. · {formatBytes(work.bytes)}
            </MetaRow>
            {work.printed && <MetaRow label="Printed">{work.printed}</MetaRow>}
            <MetaRow label="Holder">{work.holder ?? "Not established"}</MetaRow>
            <MetaRow label="Rights">{work.rights}</MetaRow>
            <MetaRow label="Source">
              {work.iaIdentifier ? (
                <a href={iaDetails(work.iaIdentifier)} rel="noopener">
                  Internet Archive · {work.iaIdentifier}
                </a>
              ) : (
                "Not yet uploaded"
              )}
            </MetaRow>
          </div>
        </div>
      </section>

      <WorkViewer work={work} />

      {work.editions && work.editions.length > 0 && (
        <section className={styles.editions}>
          <div className={styles.editionsHead}>
            Other editions of this work held in the collection
          </div>
          {work.editions.map((e) => (
            <div key={e.sourceFile} className={styles.edition}>
              <span className={styles.editionLabel}>{e.label}</span>
              <span className={styles.editionMeta}>
                {e.lang} · {formatPages(e.pages)} pp. · {formatBytes(e.bytes)} ·{" "}
                {e.iaIdentifier ? "online" : "not yet online"}
              </span>
            </div>
          ))}
        </section>
      )}

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
