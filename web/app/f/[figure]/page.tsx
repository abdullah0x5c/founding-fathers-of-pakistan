import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import UrduText from "@/components/UrduText";
import WorkCard from "@/components/WorkCard";
import VerifyNotes from "@/components/VerifyNotes";
import { MetaCell } from "@/components/MetaRow";
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
        <span className={styles.slash}>/</span>
        {figure.n} {figure.name}
      </div>

      <div className={styles.columns}>
        <div className={styles.plate}>
          <div className={styles.portraitFrame}>
            <Image
              src={figure.portrait}
              alt={`Portrait of ${figure.name}`}
              fill
              sizes="(max-width: 900px) 100vw, 560px"
              className={styles.portrait}
              priority
            />
            <span className={styles.duotone} aria-hidden="true" />
          </div>

          <div className={styles.plateBody}>
            <div className={styles.plateTop}>
              <span className={styles.plateN}>{figure.n}</span>
              <span>{figure.role}</span>
            </div>

            <h1 className={styles.name}>{figure.name}</h1>
            <UrduText className={styles.nameUrdu} align="left">
              {figure.nameUrdu}
            </UrduText>

            <hr className={styles.plateRule} />

            <div className={styles.metaGrid}>
              <MetaCell label="Born">{figure.born}</MetaCell>
              <MetaCell label="Died">{figure.died}</MetaCell>
              <MetaCell label="Places">{figure.places}</MetaCell>
              <MetaCell label="Works held">
                {shelf.length === 0 ? "Nothing held" : `${shelf.length} items`}
              </MetaCell>
            </div>

            <hr className={styles.plateRule} />

            <div className={styles.bio}>
              {figure.bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.shelf}>
          <div className={styles.shelfHead}>
            <h2 className={styles.shelfTitle}>Works</h2>
            <div className={styles.shelfCount}>
              {shelf.length === 0
                ? "Nothing held"
                : `${primary.length} work${primary.length === 1 ? "" : "s"} in the collection${
                    secondaryCount > 0 ? ` · ${secondaryCount} about him` : ""
                  }`}
            </div>
          </div>

          {figure.note && <p className={styles.note}>{figure.note}</p>}

          {shelf.length > 0 ? (
            <>
              <div className={styles.list}>
                {shelf.map((w) => (
                  <WorkCard key={w.slug} work={w} />
                ))}
              </div>
              <div className={styles.foot}>
                Scans are hosted by the Internet Archive. Where a work exists here in more than one
                printing or translation, the editions are listed inside the work rather than beside
                it.
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyLabel}>No scans digitised yet</div>
              <p className={styles.emptyBody}>
                He wrote no books. What survives is speeches, legislative interventions, statements
                and correspondence, recorded by others and published in compilations of uneven
                editorial quality — a bibliographic problem rather than an absence of material.
              </p>
              <p className={styles.emptyBody}>
                One file was collected for this shelf and it is not usable: an interrupted browser
                download that terminates mid-file and cannot be opened. Rather than present a broken
                document as a holding, the shelf is shown empty. It is the emptiest page in the
                collection, and the most honest one.
              </p>
            </div>
          )}

          <VerifyNotes notes={figure.verify} />
        </div>
      </div>
    </main>
  );
}
