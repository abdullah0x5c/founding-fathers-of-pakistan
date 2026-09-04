import { formatBytes, formatPages, iaDetails } from "@/lib/archive";
import { r2Url } from "@/lib/storage";
import type { Work } from "@/content/types";
import PdfReader from "./PdfReader";
import styles from "./WorkViewer.module.css";

/**
 * The document. Everything the reader came for happens inside this frame.
 *
 * Scans are hosted in a Cloudflare R2 bucket the site owns, under the same key as
 * the work's `sourceFile` — R2 was chosen over embedding archive.org's BookReader
 * so the collection isn't dependent on a third party's item lifecycle, and because
 * R2 charges nothing for egress even on a 392 MB file. Rendering is a self-hosted
 * pdf.js reader (`PdfReader`) rather than the browser's native PDF viewer: it
 * renders one page at a time as it scrolls into view instead of leaving paging
 * behavior up to whichever PDF plugin the visitor's browser happens to ship, and
 * it streams byte ranges from R2 (`Accept-Ranges: bytes`, confirmed) rather than
 * downloading the whole file — which only pays off because the PDFs served here
 * have also been linearized ("Fast Web View") ahead of upload; see
 * web/docs/pdf-reader-reference.md for the reader this is adapted from.
 *
 * `r2Key` is only ever set by scripts/check-r2-upload.py once a HEAD request has
 * confirmed the object is actually live with the right byte size — never by hand
 * — so its presence here is a real guarantee, not an assumption from a bulk
 * upload command that merely looked like it worked.
 *
 * This component is the single swap point if a fully custom page-image viewer is
 * wanted later — the pages above it pass a Work and nothing else.
 */
export default function WorkViewer({ work }: { work: Work }) {
  const rtl = work.lang === "Urdu" || work.lang === "Persian" || work.lang === "Arabic";
  const direction = rtl ? "right to left" : "left to right";
  const size = formatBytes(work.bytes);
  const url = work.r2Key ? r2Url(work.r2Key) : null;

  return (
    <section className={styles.frame}>
      <div className={styles.bar}>
        <div className={styles.barLabel}>
          Document viewer · {work.lang}, {direction}
        </div>
        {url ? (
          <a className={styles.download} href={url} download rel="noopener">
            Download · {size}
          </a>
        ) : (
          <span className={styles.downloadOff}>Download · {size} · not yet online</span>
        )}
      </div>

      {url ? (
        <div className={styles.stage}>
          <PdfReader url={url} title={work.title} />
        </div>
      ) : (
        <div className={styles.pending}>
          <div className={styles.pendingLabel}>Scan not yet online</div>
          <div className={styles.pendingMeta}>
            {formatPages(work.pages)} pp. · {size} · {work.lang}
          </div>
          <p className={styles.pendingBody}>
            This document is held in the collection and has been catalogued, but it has not been
            confirmed live in storage yet. The record above is complete; only the pages are
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
            Also at the Internet Archive
          </a>
        )}
      </div>
    </section>
  );
}
