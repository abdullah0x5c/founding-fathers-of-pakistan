import { formatBytes, formatPages } from "@/lib/archive";
import { r2Url } from "@/lib/storage";
import PdfReader from "./PdfReader";
import type { Work } from "@/content/types";
import styles from "./WorkViewer.module.css";

/**
 * The document, presented as itself: a band of scan pages you scroll through.
 *
 * Scans are hosted in a Cloudflare R2 bucket the site owns, under the same key
 * as the work's `sourceFile` — R2 was chosen over embedding archive.org's
 * BookReader so the collection isn't dependent on a third party's item
 * lifecycle, and because R2 charges nothing for egress even on a 392 MB file.
 * R2 serves byte ranges (`Accept-Ranges: bytes`); `PdfReader` renders the
 * linearized PDF over range requests, so it never pulls the whole file down.
 * There is no frame around it — the page *is* the document, one long scroll to
 * the last page. No toolbar, no download row, no footer beneath the book.
 *
 * `r2Key` is only ever set by scripts/check-r2-upload.py once a HEAD request
 * has confirmed the object is actually live with the right byte size — never by
 * hand — so its presence here is a real guarantee, not an assumption from a
 * bulk upload command that merely looked like it worked.
 */
export default function WorkViewer({ work }: { work: Work }) {
  const size = formatBytes(work.bytes);
  const url = work.r2Key ? r2Url(work.r2Key) : null;

  return (
    <>
      {url ? (
        <div className={styles.viewer}>
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
    </>
  );
}