import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import UrduText from "@/components/UrduText";
import WorkCard from "@/components/WorkCard";
import ChaiButton from "@/components/ChaiButton";
import VerifyNotes from "@/components/VerifyNotes";
import { figures, getFigure, worksFor, primaryWorks } from "@/lib/catalogue";
import styles from "./page.module.css";

export function generateStaticParams() {
  return figures.map((f) => ({ figure: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ figure: string }>;
}): Promise<Metadata> {
  const { figure: slug } = await params;
  const figure = getFigure(slug);
  if (!figure) return {};
  return {
    title: figure.name,
    description: figure.bio[0]?.slice(0, 180),
  };
}

export default async function FigurePage({ params }: { params: Promise<{ figure: string }> }) {
  const { figure: slug } = await params;
  const figure = getFigure(slug);
  if (!figure) notFound();

  const shelf = worksFor(figure.slug);
  const primary = primaryWorks(figure.slug);
  const secondaryCount = shelf.length - primary.length;

  return (
    <main className={`${styles.main} soft-in`}>
      <div className={styles.crumb}>
        <Link href="/">The Eleven</Link>
        <span className={styles.slash}>·</span>
        {figure.name}
      </div>

      <div className="mount">
        <div className={`${styles.leaf} speck`}>
          {/* The name written large and faint across the head of the leaf, the
              way a scribe's practice hand shows through the paper. */}
          <UrduText className={`urdu-display ${styles.ghost}`} align="right">
            {figure.nameUrdu}
          </UrduText>

          <div className={styles.spread}>
            {/* ── verso: the shelf ── */}
            <div className={styles.verso}>
              <div className={styles.folio}>f. {Number(figure.n)}v · Works held</div>
              <h3 className={`display ${styles.versoTitle}`}>The shelf</h3>
              <div className={`illum ${styles.versoRule}`} aria-hidden="true" />

              {figure.note && <p className={styles.note}>{figure.note}</p>}

              {shelf.length > 0 ? (
                <>
                  <div className={styles.list}>
                    {shelf.map((w, i) => (
                      <WorkCard key={w.slug} work={w} index={i} />
                    ))}
                  </div>

                  <div className={styles.versoFoot}>
                    {primary.length} work{primary.length === 1 ? "" : "s"} by him
                    {secondaryCount > 0 &&
                      ` · ${secondaryCount} item${secondaryCount === 1 ? "" : "s"} about him`}
                    . Where a work exists in more than one printing or translation, the editions are
                    listed inside the work rather than beside it.
                  </div>
                </>
              ) : (
                <div className={styles.empty}>
                  <div className={styles.emptyLabel}>No scans digitised yet</div>
                  <p>
                    He wrote no books. What survives is speeches, legislative interventions,
                    statements and correspondence, recorded by others and published in compilations
                    of uneven editorial quality — a bibliographic problem rather than an absence of
                    material.
                  </p>
                  <p>
                    One file was collected for this shelf and it is not usable: an interrupted
                    browser download that terminates mid-file and cannot be opened. Rather than
                    present a broken document as a holding, the shelf is shown empty. It is the
                    emptiest page in the collection, and the most honest one.
                  </p>
                </div>
              )}
            </div>

            <div className={styles.spine} aria-hidden="true" />

            {/* ── recto: the portrait and the life ── */}
            <div className={styles.recto}>
              <div className={`${styles.folio} ${styles.folioRight}`}>f. {Number(figure.n)}r</div>

              <div className={styles.head}>
                <div className={`${styles.portraitFrame} hatch`}>
                  <div className={styles.portraitWindow}>
                    <Image
                      src={figure.portrait}
                      alt={`Portrait of ${figure.name}`}
                      fill
                      sizes="(max-width: 900px) 40vw, 160px"
                      className={styles.portrait}
                      priority
                    />
                  </div>
                </div>

                <div className={styles.names}>
                  <UrduText className={`urdu-display ${styles.nameUrdu}`} align="left">
                    {figure.nameUrdu}
                  </UrduText>
                  <h1 className={`display ${styles.name}`}>{figure.name}</h1>
                  <div className={styles.dates}>
                    {figure.role} · {figure.born}–{figure.died}
                    <br />
                    {figure.places}
                  </div>
                </div>
              </div>

              <div className={`illum-up ${styles.headRule}`} aria-hidden="true" />

              <div className={styles.bio}>
                {figure.bio.map((p, i) => (
                  <p key={i} className={i === 0 ? styles.bioOpen : undefined}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChaiButton />

      <VerifyNotes notes={figure.verify} />
    </main>
  );
}
