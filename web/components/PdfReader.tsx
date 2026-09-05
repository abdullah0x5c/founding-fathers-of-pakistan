"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./PdfReader.module.css";

/**
 * The in-house reader: a virtualized pdf.js canvas renderer.
 *
 * Replaces the browser's native `<iframe>` PDF viewer. The native viewer (Chrome
 * above all) pulls most of the file down before showing page one, which makes a
 * linearized 117 MB scan feel broken. This reader instead opens the document
 * over HTTP **range requests** (`getDocument({ url, disableAutoFetch: true, ... })`),
 * so only the linearized head and the byte ranges of pages near the viewport are
 * ever transferred, and renders each of those pages into a `<canvas>`.
 *
 * Pages are rendered lazily: a scroll window keeps only the pages near the
 * viewport in the DOM as `<canvas>` elements, evicts the ones far outside it
 * (pdf.js keeps the page data cached, so re-scrolling is a fast re-draw rather
 * than a re-fetch), and re-renders everything when the zoom step changes.
 *
 * pdf.js itself is self-hosted — core + worker live under `/vendor/pdfjs/`
 * (copied from node_modules by `scripts/copy-pdfjs.mjs` on every `npm install`,
 * so the vendored copy always matches the pinned `pdfjs-dist` version) and is
 * fetched at runtime, so the reader carries no CDN dependency and pdf.js isn't
 * loaded until a document is actually opened.
 *
 * The PDF URL must be reachable from the browser with CORS headers — the R2
 * bucket's `pub-…r2.dev` endpoint serves none, so in production this is the
 * Cloudflare worker in `infra/r2-cors-proxy/` (see its README).
 */

const WORKER_SRC = "/vendor/pdfjs/pdf.worker.min.mjs";
const PDFJS_SRC = "/vendor/pdfjs/pdf.min.mjs";

/** Global "zoom" is a stepped set of reader widths, not a CSS transform —
 * matching the reference reader this was adapted from. Changing width tears
 * down the visible canvases and re-renders them at the new scale. */
const ZOOM_STEPS = [620, 800, 980, 1180, 1400];
const DEFAULT_STEP = 2; // 980

/** How far past the viewport a page is fetched; how much farther it must go
 * before its canvas is evicted (hysteresis so a few px of scrolling doesn't
 * thrash the renderer). */
const RENDER_MARGIN = 1200;
const EVICT_MARGIN = 2600;

/** Cap the rendered size of a page in device pixels. These are ~150 dpi scans
 * (~1167 px wide) — rendering past ~2000 device px is upsampling nothing. */
const MAX_DEVICE_WIDTH = 2000;

/** Vertical spacing applied by `.pageSlot`'s `margin: 14px auto`. Kept in sync
 * with the CSS so the scroll math lines up with the layout. */
const PAGE_GAP = 28;

type PdfJs = typeof import("pdfjs-dist");

interface PdfReaderProps {
  url: string;
  pages: number;
  lang: string;
}

let pdfjsPromise: Promise<PdfJs> | null = null;

function loadPdfjs(): Promise<PdfJs> {
  if (!pdfjsPromise) {
    // Fetched at runtime from public/vendor/pdfjs — deliberately not resolved
    // by webpack/Next at build time.
    pdfjsPromise = import(
      /* webpackIgnore: true */
      /* turbopackIgnore: true */
      PDFJS_SRC
    ).then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = WORKER_SRC;
      return mod as PdfJs;
    });
  }
  return pdfjsPromise;
}

export default function PdfReader({ url, pages }: PdfReaderProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [total, setTotal] = useState(pages);
  const [current, setCurrent] = useState(1);
  const [zoomIdx, setZoomIdx] = useState(DEFAULT_STEP);

  // Mutable reader state shared by the scroll/zoom/render loops. The stage is
  // deliberately never given React children — every DOM node inside it is owned
  // imperatively, so React and the renderer can't fight over the same element.
  const totalRef = useRef(pages);
  const docRef = useRef<any>(null);
  const slotsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const renderedRef = useRef<Set<number>>(new Set());
  const pendingRef = useRef<Set<number>>(new Set());
  const tasksRef = useRef<Map<number, { cancel: () => void }>>(new Map());
  const ratiosRef = useRef<number[]>([]);
  const topsRef = useRef<number[]>([]);
  const slotWRef = useRef<number>(0);
  const zoomIdxRef = useRef(DEFAULT_STEP);
  const rafRef = useRef<number | null>(null);

  const recomputeTops = useCallback(() => {
    const ratios = ratiosRef.current;
    const width = slotWRef.current;
    const tops = new Array<number>(ratios.length + 1);
    let y = 0;
    tops[0] = 0;
    for (let i = 0; i < ratios.length; i++) {
      y += width / ratios[i] + PAGE_GAP;
      tops[i + 1] = y;
    }
    topsRef.current = tops;
  }, []);

  /** Page number whose top edge is just before `y` (i.e. the page containing it). */
  const pageAt = useCallback((y: number): number => {
    const tops = topsRef.current;
    if (tops.length === 0) return 1;
    let lo = 0;
    let hi = tops.length - 2;
    let ans = 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (tops[mid] <= y) {
        ans = mid + 1;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return Math.min(ans, totalRef.current);
  }, []);

  const evictPage = useCallback((n: number) => {
    const task = tasksRef.current.get(n);
    if (task) {
      try {
        task.cancel();
      } catch {
        /* already finished */
      }
      tasksRef.current.delete(n);
    }
    const slot = slotsRef.current.get(n);
    if (slot) slot.replaceChildren();
    // The placeholder keeps the page's aspect ratio, so the layout holds.
    renderedRef.current.delete(n);
    pendingRef.current.delete(n);
  }, []);

  const renderPage = useCallback(
    async (n: number) => {
      const doc = docRef.current;
      if (!doc || pendingRef.current.has(n) || renderedRef.current.has(n)) return;
      const slot = slotsRef.current.get(n);
      const width = slotWRef.current;
      if (!slot || width === 0) return;

      pendingRef.current.add(n);
      try {
        const page = await doc.getPage(n);
        const base = page.getViewport({ scale: 1 });
        const ratio = base.width / base.height;
        const dpr = Math.min(
          (typeof window !== "undefined" ? window.devicePixelRatio : 1) || 1,
          MAX_DEVICE_WIDTH / width
        );
        const viewport = page.getViewport({ scale: (width * dpr) / base.width });

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        canvas.className = styles.pageCanvas;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) {
          pendingRef.current.delete(n);
          return;
        }

        if (ratiosRef.current[n - 1] !== ratio) {
          ratiosRef.current[n - 1] = ratio;
          slot.style.aspectRatio = `${base.width} / ${base.height}`;
          recomputeTops();
        }
        slot.replaceChildren(canvas);

        const task = page.render({ canvas, viewport });
        tasksRef.current.set(n, task);
        try {
          await task.promise;
          renderedRef.current.add(n);
        } catch {
          // Cancelled (scrolled far away) or failed — drop the in-progress
          // canvas so the placeholder shows and a later pass re-renders it.
          if (slot.firstElementChild === canvas) slot.replaceChildren();
        } finally {
          tasksRef.current.delete(n);
        }
      } catch {
        /* transient getPage failure — the next pass will retry */
      } finally {
        pendingRef.current.delete(n);
      }
    },
    [recomputeTops]
  );

  const renderVisible = useCallback(() => {
    const stage = stageRef.current;
    // Safe before the document exists: renderPage no-ops while `docRef` is null.
    if (!stage) return;
    const tops = topsRef.current;
    if (tops.length === 0) return;
    const first = pageAt(Math.max(0, stage.scrollTop - RENDER_MARGIN));
    const last = pageAt(stage.scrollTop + stage.clientHeight + RENDER_MARGIN);
    for (let n = first; n <= Math.min(last, totalRef.current); n++) {
      void renderPage(n);
    }
  }, [pageAt, renderPage]);

  const rerenderAll = useCallback(() => {
    for (const task of tasksRef.current.values()) {
      try {
        task.cancel();
      } catch {
        /* ignore */
      }
    }
    tasksRef.current.clear();
    for (const n of renderedRef.current) {
      const slot = slotsRef.current.get(n);
      if (slot) slot.replaceChildren();
    }
    renderedRef.current.clear();
    pendingRef.current.clear();
    recomputeTops();
    renderVisible();
  }, [recomputeTops, renderVisible]);

  // Wire up zoom and keep `slotWRef` in sync with the actual laid-out width.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const width = ZOOM_STEPS[zoomIdx];
    zoomIdxRef.current = zoomIdx;
    stage.style.setProperty("--rw", `${width}px`);
    slotWRef.current = Math.min(stage.clientWidth || width, width);
    recomputeTops();
    if (docRef.current) rerenderAll();
  }, [zoomIdx, recomputeTops, rerenderAll]);

  // Open the document and build the page skeleton.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !url) return;

    let cancelled = false;
    let doc: any = null;

    (async () => {
      try {
        const pdfjs = await loadPdfjs();
        if (cancelled) return;

        const loadingTask = pdfjs.getDocument({
          url,
          rangeChunkSize: 1 << 20,
          disableAutoFetch: true,
          disableStream: false,
        });
        doc = await loadingTask.promise;
        if (cancelled) {
          doc.destroy();
          return;
        }
        docRef.current = doc;
        totalRef.current = doc.numPages;
        setTotal(doc.numPages);

        // First page's viewport gives the placeholder ratio for every scan
        // (most scans are uniform; mixed-format volumes self-correct per page
        // the moment each one renders).
        const first = await doc.getPage(1);
        const base = first.getViewport({ scale: 1 });
        const ratio = base.width / base.height;

        stage.style.setProperty("--rw", `${ZOOM_STEPS[zoomIdxRef.current]}px`);
        slotWRef.current = Math.min(stage.clientWidth, ZOOM_STEPS[zoomIdxRef.current]);

        const ratios = new Array<number>(doc.numPages).fill(ratio);
        ratiosRef.current = ratios;
        recomputeTops();

        const slots = slotsRef.current;
        for (let n = 1; n <= doc.numPages; n++) {
          const slot = document.createElement("div");
          slot.className = styles.pageSlot;
          slot.style.aspectRatio = `${base.width} / ${base.height}`;
          slot.setAttribute("data-page", String(n));
          slot.setAttribute("aria-hidden", "true");
          stage.appendChild(slot);
          slots.set(n, slot);
        }

        if (!cancelled) {
          setStatus("ready");
          renderVisible();
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      for (const task of tasksRef.current.values()) {
        try {
          task.cancel();
        } catch {
          /* ignore */
        }
      }
      tasksRef.current.clear();
      if (doc) doc.destroy();
      docRef.current = null;
      slotsRef.current.clear();
      renderedRef.current.clear();
      pendingRef.current.clear();
      if (stage) stage.replaceChildren();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Scroll: update the current page readout and evict canvases far outside the
  // viewport, in one rAF-throttled pass (no IO observer — the math is cheaper
  // and gives the eviction hysteresis for free).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const tops = topsRef.current;
        if (tops.length === 0) return;

        const scrollTop = stage.scrollTop;
        const clientHeight = stage.clientHeight;

        const next = pageAt(scrollTop + clientHeight / 2);
        setCurrent((prev) => (prev === next ? prev : next));

        const minTop = scrollTop - EVICT_MARGIN;
        const maxBottom = scrollTop + clientHeight + EVICT_MARGIN;
        for (const n of renderedRef.current) {
          const top = tops[n - 1];
          const bottom = top + slotWRef.current / ratiosRef.current[n - 1];
          if (bottom < minTop || top > maxBottom) evictPage(n);
        }

        // Render pages that have just come into the window (the scroll pass is
        // the render trigger — there is no separate observer).
        renderVisible();
      });
    };

    stage.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      stage.removeEventListener("scroll", onScroll);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [evictPage, pageAt, renderVisible]);

  // Resize: re-measure the laid-out width and re-render the visible window.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const width = ZOOM_STEPS[zoomIdxRef.current];
      const next = Math.min(stage.clientWidth || width, width);
      if (Math.abs(next - slotWRef.current) > 2) {
        slotWRef.current = next;
        recomputeTops();
        renderVisible();
      }
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, [recomputeTops, renderVisible]);

  const onStageKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    const stage = stageRef.current;
    if (!stage) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        stage.scrollBy({ top: Math.round(stage.clientHeight * 0.8) });
        break;
      case "ArrowUp":
        e.preventDefault();
        stage.scrollBy({ top: -Math.round(stage.clientHeight * 0.8) });
        break;
      case "PageDown":
        e.preventDefault();
        stage.scrollBy({ top: Math.max(1, Math.round(stage.clientHeight * 0.9)) });
        break;
      case "PageUp":
        e.preventDefault();
        stage.scrollBy({ top: -Math.max(1, Math.round(stage.clientHeight * 0.9)) });
        break;
      case "Home":
        e.preventDefault();
        stage.scrollTo({ top: 0 });
        break;
      case "End":
        e.preventDefault();
        stage.scrollTo({ top: stage.scrollHeight });
        break;
    }
  };

  const atMinZoom = zoomIdx === 0;
  const atMaxZoom = zoomIdx === ZOOM_STEPS.length - 1;

  return (
    <div className={styles.reader} role="region" aria-label="Document reader">
      <div className={styles.readerBar}>
        <span aria-live="polite">
          Page {Math.min(current, total || 1)} / {(total || pages).toLocaleString("en-US")}
        </span>
        <div className={styles.readerZoom}>
          <button
            type="button"
            className={styles.readerBtn}
            aria-label="Zoom out"
            disabled={status !== "ready" || atMinZoom}
            onClick={() => setZoomIdx((i) => Math.max(0, i - 1))}
          >
            &minus;
          </button>
          <button
            type="button"
            className={styles.readerBtn}
            aria-label="Zoom in"
            disabled={status !== "ready" || atMaxZoom}
            onClick={() => setZoomIdx((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.readerStageWrap}>
        <div
          ref={stageRef}
          className={styles.readerStage}
          tabIndex={0}
          onKeyDown={onStageKeyDown}
          aria-label="Scan pages"
        />

        {status !== "ready" && (
          <div
            className={styles.readerOverlay}
            role={status === "error" ? "alert" : "status"}
          >
            {status === "loading" ? (
              <>
                <span className={styles.readerLoaderText}>Loading the scan&hellip;</span>
                <span className={styles.readerLoaderBar}>
                  <span className={styles.readerLoaderFill} />
                </span>
              </>
            ) : (
              <>
                <div className={styles.readerErrorLabel}>This document could not be opened</div>
                <p className={styles.readerErrorBody}>
                  The scan may not have finished uploading to the archive yet, or the
                  connection was interrupted. The record above is complete; try again shortly.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}