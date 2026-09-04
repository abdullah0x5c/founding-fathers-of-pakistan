"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import styles from "./PdfReader.module.css";

/**
 * A self-hosted pdf.js reader: continuous vertical scroll through one <canvas>
 * per page, each page rendered only once it is about to scroll into view.
 *
 * pdf.js is loaded from /vendor/pdfjs/ (copied from node_modules by
 * scripts/copy-pdfjs.mjs on every install, see package.json's postinstall) —
 * not a CDN, and not bundled by webpack: the `webpackIgnore` comment below
 * keeps Next.js from trying to resolve it at build time, since it's meant to
 * be fetched at runtime as a plain static asset.
 *
 * getDocument() is called with `disableAutoFetch: true` and a chunked
 * `rangeChunkSize`, so pdf.js streams byte ranges from R2 on demand instead
 * of downloading the whole scan up front. That only pays off because R2
 * serves `Accept-Ranges: bytes` (confirmed) and the PDFs themselves have been
 * linearized ("Fast Web View") — a non-linearized file keeps its xref table
 * at the end, forcing pdf.js to jump around the file just to find page one.
 *
 * No page-turn animation, no thumbnail filmstrip, no rotate control — just
 * scroll, a live page counter, and a fixed set of zoom widths stepped by
 * +/-. See web/docs/pdf-reader-reference.md for the reader this pattern is
 * adapted from.
 */

const ZOOM_STEPS = [620, 800, 980, 1180, 1400] as const;
const DEFAULT_ZOOM_INDEX = 2;
const RENDER_MARGIN = "1000px 0px";

type LoadState =
  | { phase: "loading"; loaded: number; total: number | null }
  | { phase: "ready" }
  | { phase: "error"; message: string };

export default function PdfReader({ url, title }: { url: string; title: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
  const renderedRef = useRef<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const visibleRatiosRef = useRef<Map<number, number>>(new Map());

  const [state, setState] = useState<LoadState>({ phase: "loading", loaded: 0, total: null });
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);

  // Load the document once per URL.
  useEffect(() => {
    let cancelled = false;
    setState({ phase: "loading", loaded: 0, total: null });
    setNumPages(0);
    setCurrentPage(1);
    renderedRef.current.clear();
    pageRefs.current = [];

    async function load() {
      const pdfjsUrl = "/vendor/pdfjs/pdf.min.mjs";
      const pdfjsLib = (await import(
        /* webpackIgnore: true */
        /* turbopackIgnore: true */
        pdfjsUrl
      )) as typeof import("pdfjs-dist");
      if (cancelled) return;

      pdfjsLib.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.mjs";

      const task = pdfjsLib.getDocument({
        url,
        disableAutoFetch: true,
        disableStream: false,
        rangeChunkSize: 65536,
      });
      loadingTaskRef.current = task;

      task.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
        if (cancelled) return;
        setState({ phase: "loading", loaded, total: total || null });
      };

      try {
        const pdfDoc: PDFDocumentProxy = await task.promise;
        if (cancelled) {
          task.destroy();
          return;
        }
        pdfDocRef.current = pdfDoc;
        setNumPages(pdfDoc.numPages);
        setState({ phase: "ready" });
      } catch (err) {
        if (cancelled) return;
        setState({
          phase: "error",
          message: err instanceof Error ? err.message : "The scan failed to load.",
        });
      }
    }

    load();

    return () => {
      cancelled = true;
      observerRef.current?.disconnect();
      loadingTaskRef.current?.destroy();
      loadingTaskRef.current = null;
      pdfDocRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Once the document is ready and placeholders exist, size each placeholder
  // by page 1's aspect ratio and start observing them.
  useEffect(() => {
    if (state.phase !== "ready" || numPages === 0) return;
    const pdfDoc = pdfDocRef.current;
    const container = containerRef.current;
    if (!pdfDoc || !container) return;

    let cancelled = false;

    async function sizePlaceholders() {
      const page1 = await pdfDoc!.getPage(1);
      if (cancelled) return;
      const viewport = page1.getViewport({ scale: 1 });
      const aspectRatio = viewport.width / viewport.height;
      pageRefs.current.forEach((el) => {
        if (el) el.style.aspectRatio = `${aspectRatio}`;
      });
    }

    sizePlaceholders();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLDivElement;
          const pageNum = Number(el.dataset.page);
          if (entry.isIntersecting) {
            visibleRatiosRef.current.set(pageNum, entry.intersectionRatio);
            renderPage(pageNum);
          } else {
            visibleRatiosRef.current.delete(pageNum);
          }
        }
        let best = currentPage;
        let bestRatio = -1;
        visibleRatiosRef.current.forEach((ratio, page) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = page;
          }
        });
        if (bestRatio >= 0) setCurrentPage(best);
      },
      { root: null, rootMargin: RENDER_MARGIN, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    observerRef.current = observer;
    pageRefs.current.forEach((el) => el && observer.observe(el));

    return () => {
      cancelled = true;
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, numPages]);

  async function renderPage(pageNum: number) {
    const pdfDoc = pdfDocRef.current;
    const placeholder = pageRefs.current[pageNum - 1];
    if (!pdfDoc || !placeholder || renderedRef.current.has(pageNum)) return;
    renderedRef.current.add(pageNum);

    try {
      const page = await pdfDoc.getPage(pageNum);
      const cssWidth = placeholder.clientWidth;
      const unscaled = page.getViewport({ scale: 1 });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scale = (cssWidth / unscaled.width) * dpr;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      canvas.className = styles.canvas;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      placeholder.replaceChildren(canvas);
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    } catch {
      renderedRef.current.delete(pageNum);
    }
  }

  function rerenderVisible() {
    renderedRef.current.clear();
    pageRefs.current.forEach((el) => {
      if (!el) return;
      el.replaceChildren();
      const rect = el.getBoundingClientRect();
      if (rect.bottom > -1000 && rect.top < window.innerHeight + 1000) {
        renderPage(Number(el.dataset.page));
      }
    });
  }

  function zoom(direction: 1 | -1) {
    setZoomIndex((i) => {
      const next = Math.min(ZOOM_STEPS.length - 1, Math.max(0, i + direction));
      if (next !== i) requestAnimationFrame(rerenderVisible);
      return next;
    });
  }

  const maxWidth = ZOOM_STEPS[zoomIndex];

  return (
    <div className={styles.reader}>
      <div className={styles.readerBar}>
        <span className={styles.pageCount}>
          {numPages > 0 ? (
            <>
              {currentPage} / {numPages}
            </>
          ) : (
            "—"
          )}
        </span>
        <span className={styles.grow} />
        <button
          type="button"
          className={styles.zoomButton}
          aria-label="Narrower"
          onClick={() => zoom(-1)}
          disabled={zoomIndex === 0}
        >
          &minus;
        </button>
        <button
          type="button"
          className={styles.zoomButton}
          aria-label="Wider"
          onClick={() => zoom(1)}
          disabled={zoomIndex === ZOOM_STEPS.length - 1}
        >
          +
        </button>
      </div>

      {state.phase === "error" ? (
        <div className={styles.status}>
          <p>{state.message}</p>
          <p>Use the download link above to read this scan directly instead.</p>
        </div>
      ) : (
        <>
          {state.phase === "loading" && (
            <p className={styles.status}>
              Loading {title}&hellip;
              <span className={styles.progress}>
                <i
                  className={styles.progressBar}
                  style={
                    state.total
                      ? { width: `${Math.min(100, (state.loaded / state.total) * 100)}%` }
                      : undefined
                  }
                  data-indeterminate={state.total ? undefined : "true"}
                />
              </span>
            </p>
          )}
          <div
            ref={containerRef}
            className={styles.pages}
            style={{ maxWidth: `${maxWidth}px` }}
          >
            {Array.from({ length: numPages }, (_, i) => (
              <div
                key={i}
                ref={(el) => {
                  pageRefs.current[i] = el;
                }}
                data-page={i + 1}
                className={styles.page}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
