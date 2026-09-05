import { formatBytes, formatPages, iaDetails } from "@/lib/archive";
import { r2Url } from "@/lib/storage";
import PdfReader from "./PdfReader";
import type { Work } from "@/content/types";
import styles from "./WorkViewer.module.css";

/**
 * The document. Everything the reader came for happens inside this frame.
 *
 * Scans are hosted in a Cloudflare R2 bucket the site owns, under the same key as
 * the work's `sourceFile` — R2 was chosen over embedding archive.org's BookReader
 * so the collection isn't dependent on a third party's item lifecycle, and because
 * R2 charges nothing for egress even on a 392 MB file. R2 serves byte ranges
 * (`Accept-Ranges: bytes`); the reader below is `PdfReader`, a pdf.js renderer
 * that opens the linearized PDF over range requests and rasterizes only the
 * pages near the viewport, so it never pulls the whole file down.
 *
 * `r2Key` is only ever set by scripts/check-r2-upload.py once a HEAD request has
 * confirmed the object is actually live with the right byte size — never by hand
 * — so its presence here is a real guarantee, not an assumption from a bulk
 * upload command that merely looked like it worked.
 *
 * This component is the single swap point if a different reader is wanted later;
 * the pages above it pass a Work and nothing else.
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
          <PdfReader url={url} pages={work.pages} lang={work.lang} />
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