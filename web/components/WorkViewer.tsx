import { iaEmbed, iaDetails, iaDownload, formatBytes, formatPages } from "@/lib/archive";
import type { Work } from "@/content/types";
import styles from "./WorkViewer.module.css";

/**
 * The document. Everything the reader came for happens inside this frame.
 *
 * The scans are hosted on archive.org because they cannot be served from here —
 * the collection is 1.7 GB and one volume alone is 392 MB, which no browser should
 * be asked to pull down to show page one. Their BookReader already solves page-level
 * streaming for material this size, and it handles right-to-left page order itself
 * when the item's language metadata says Urdu or Persian, so the page order for the
 * Urdu half of the corpus is set at upload time rather than here.
 *
 * The chrome around the frame is ours; what is inside it is theirs. Drawing our own
 * zoom, rotate, page field and filmstrip outside an iframe that already has all four
 * would give the reader two sets of controls that disagree with each other.
 *
 * This component is the single swap point if a fully custom page-image viewer is
 * wanted later — the pages above it pass a Work and nothing else.
 */
export default function WorkViewer({ work }: { work: Work }) {
  const rtl = work.lang === "Urdu" || work.lang === "Persian" || work.lang === "Arabic";
  const direction = rtl ? "right to left" : "left to right";
  const size = formatBytes(work.bytes);

  return (
    <section className={styles.frame}>
      <div className={styles.bar}>
        <div className={styles.barLabel}>
          Document viewer · {work.lang}, {direction}
        </div>
        {work.iaIdentifier ? (
          <a
            className={styles.download}
            href={iaDownload(work.iaIdentifier, work.iaFilename)}
            rel="noopener"
          >
            Download · {size}
          </a>
        ) : (
          <span className={styles.downloadOff}>Download · {size} · not yet online</span>
        )}
      </div>

      {work.iaIdentifier ? (
        <div className={styles.stage}>
          <iframe
            className={styles.embed}
            src={iaEmbed(work.iaIdentifier)}
            title={`${work.title} — page images`}
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <div className={styles.pending}>
          <div className={styles.pendingLabel}>Scan not yet online</div>
          <div className={styles.pendingMeta}>
            {formatPages(work.pages)} pp. · {size} · {work.lang}
          </div>
          <p className={styles.pendingBody}>
            This document is held in the collection and has been catalogued, but it has not been
            uploaded to the Internet Archive yet. The record above is complete; only the pages are
            missing.
          </p>
        </div>
      )}

      {work.scanNote && <div className={styles.scanNote}>{work.scanNote}</div>}

      <div className={styles.foot}>
        <span>
          {formatPages(work.pages)} pages · {size}
          {work.editions && work.editions.length > 0
            ? ` · ${work.editions.length} further edition${work.editions.length > 1 ? "s" : ""} held`
            : ""}
        </span>
        {work.iaIdentifier && (
          <a href={iaDetails(work.iaIdentifier)} rel="noopener">
            Record at the Internet Archive
          </a>
        )}
      </div>
    </section>
  );
}
