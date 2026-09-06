"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./PdfReader.module.css";

/**
 * The in-house reader: pages rendered to <canvas>, laid out as the document
 * itself — the scan pages *are* the page. There is no reader box and no
 * toolbar: the book simply runs as one long scroll to the last page, and the
 * page counter sits permanently beside the leaf, level with the middle of the
 * viewport; click it and it turns into a number you can type to jump to any
 * page.
 *
 * It is windowed infinite scroll underneath: the DOM holds only the slots near
 * the viewport (a small sliding window), absolutely positioned over a spacer
 * that carries the full estimated height, so reading a 400+ page volume never
 * means 400+ DOM nodes. Pages further out have their canvases torn down;
 * pdf.js keeps the page data, so scrolling back is a fast re-draw, not a
 * re-fetch.
 *
 * Width is automatic: a page renders at the reader width, capped at the scan's
 * natural resolution so it never upscales past what the pixels hold. The last
 * scroll position is remembered between visits (per document), and the current
 * page drives the counter.
 *
 * Every piece of reader state lives in one per-load `Session` (see below):
 * React StrictMode mounts components twice in dev, and an effect that mutates
 * the DOM must not let one edition of itself keep writing into the next
 * edition's DOM. Async work always checks that its session is still the active
 * one before touching a node.
 *
 * pdf.js itself is self-hosted — core + worker live under `/vendor/pdfjs/`
 * (copied from node_modules by `scripts/copy-pdfjs.mjs` on every `npm install`)
 * and is fetched at runtime, so the reader carries no CDN dependency and
 * pdf.js isn't loaded until a document is actually opened.
 *
 * The PDF URL must be reachable from the browser with CORS headers — the R2
 * bucket's `pub-…r2.dev` endpoint serves none, so in production this is the
 * Cloudflare worker in `infra/r2-cors-proxy/` (see its README).
 */

const WORKER_SRC = "/vendor/pdfjs/pdf.worker.min.mjs";
const PDFJS_SRC = "/vendor/pdfjs/pdf.min.mjs";

/** How far above the viewport a page is fetched and held. The window these
 * build around the viewport is the whole virtualization: slots exist for
 * `[pageAt(scrollTop - RENDER_ABOVE), pageAt(scrollTop + innerHeight +
 * RENDER_BELOW)]`, and everything outside that window is removed. */
const RENDER_ABOVE = 1500;
const RENDER_BELOW = 2200;

/** Auto-fit cap: a page never lays out wider than this. The scans are ~150 dpi
 * JPEGs rasterized ~1167 px wide, but their PDF page boxes are smaller than the
 * pixels they hold (~560 CSS px), so capping at the box would show half-res
 * pages. 1180 is the scan's own pixel width, so it fills the desktop column at
 * full sharpness and never upscales past what the scan contains. */
const MAX_PAGE_WIDTH = 1180;

/** Hard cap on a canvas's device-pixel width. The scans are fixed raster, so
 * rendering much past ~2000 device px is upsampling nothing — this is what
 * keeps high-DPI screens from exploding canvas memory. */
const MAX_DEVICE_WIDTH = 2000;

/** Vertical gap between successive pages, added into the height math. Kept in
 * sync with the spacing the shadows need so the scrollbar matches the layout. */
const PAGE_GAP = 52;

/** How many pages past the window to warm in pdf.js's cache (data only, no
 * canvas) while the reader is idle. */
const PREFETCH_DEPTH = 2;

/** Sticky header height + a gutter: when jumping to a page we align its top
 * just below this, so the target page starts clear of the pinned header. */
const JUMP_OFFSET = 82;

/** All mutable reader state for one document load. A fresh one is created per
 * load; every async closing over one must verify `sessionRef.current` is still
 * it before touching the DOM (StrictMode-safe, see the header comment). */
interface Session {
  gen: number;
  doc: any;
  total: number;
  slots: Map<number, HTMLDivElement>;
  painted: Set<number>;
  pending: Set<number>;
  prefetched: Set<number>;
  tasks: Map<number, { cancel: () => void }>;
  ratios: number[];
  tops: number[];
  cap: number;
  slotW: number;
  spacer: HTMLDivElement | null;
}

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

function recomputeTops(s: Session, width?: number) {
  const w = width ?? s.slotW;
  const tops = new Array<number>(s.ratios.length + 1);
  let y = 0;
  tops[0] = 0;
  for (let i = 0; i < s.ratios.length; i++) {
    y += w / (s.ratios[i] || 1) + PAGE_GAP;
    tops[i + 1] = y;
  }
  s.tops = tops;
}

/** Page number whose top edge is just before `y` (i.e. the page containing it). */
function pageAt(s: Session, y: number): number {
  const tops = s.tops;
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
  return Math.max(1, Math.min(ans, s.total));
}

/** Where the reader stage sits in the document, in window-scroll Y terms.
 * The stage is in normal flow, so its top edge depends on the content above it
 * (the page metadata) — virtualization and page jumps are measured from here. */
function stageTop(): number {
  const el = document.querySelector(`.${styles.readerStage}`) as HTMLElement | null;
  return el ? el.getBoundingClientRect().top + window.scrollY : 0;
}

/** Current viewport height (cached for listeners that shouldn't re-query). */
function viewportH(): number {
  return window.innerHeight || 0;
}

export default function PdfReader({ url, pages }: PdfReaderProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<Session | null>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [total, setTotal] = useState(pages);
  const [current, setCurrent] = useState(1);
  const [attempt, setAttempt] = useState(0);

  // The counter is clickable → it becomes a small number input.
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");

  const genRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPageRef = useRef(0);

  /** The reader root. Carries the measured page width as a custom property so
   * the counter can sit beside the leaf without JS positioning it. */
  const readerRef = useRef<HTMLDivElement | null>(null);

  /** Publish the page measure to CSS. The counter is placed off the right edge
   * of the page rather than off the right edge of the window, so it has to know
   * how wide the page currently is; this is the only channel it needs, and it
   * costs no re-render. */
  const publishPageWidth = useCallback((w: number) => {
    readerRef.current?.style.setProperty("--page-w", `${Math.round(w)}px`);
  }, []);

  /** Drop a page: cancel its render, remove its slot, forget it. */
  const evict = useCallback((s: Session, n: number) => {
    const task = s.tasks.get(n);
    if (task) {
      try {
        task.cancel();
      } catch {
        /* already finished */
      }
      s.tasks.delete(n);
    }
    const slot = s.slots.get(n);
    if (slot) slot.remove();
    s.slots.delete(n);
    s.painted.delete(n);
    s.pending.delete(n);
  }, []);

  const positionSlots = useCallback((s: Session) => {
    for (const [n, el] of s.slots) {
      el.style.top = `${s.tops[n - 1] ?? 0}px`;
    }
    if (s.spacer) {
      s.spacer.style.height = `${s.tops[s.tops.length - 1] ?? 0}px`;
    }
  }, []);

  const renderPage = useCallback(async (s: Session, n: number) => {
    if (!s.doc || s.pending.has(n) || s.painted.has(n)) return;
    const slot = s.slots.get(n);
    if (!slot || s.slotW === 0) return;

    s.pending.add(n);
    try {
      const page = await s.doc.getPage(n);
      if (sessionRef.current !== s) return;
      const base = page.getViewport({ scale: 1 });
      const ratio = base.width / base.height;
      const dpr = Math.min(
        (typeof window !== "undefined" ? window.devicePixelRatio : 1) || 1,
        MAX_DEVICE_WIDTH / s.slotW
      );
      const viewport = page.getViewport({ scale: (s.slotW * dpr) / base.width });

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      canvas.className = styles.pageCanvas;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) {
        s.pending.delete(n);
        return;
      }

      // A page whose aspect differs from the estimate corrects the shared
      // layout height right here, keeping the scrollbar honest.
      if (s.ratios[n - 1] !== ratio) {
        s.ratios[n - 1] = ratio;
        slot.style.aspectRatio = `${base.width} / ${base.height}`;
        recomputeTops(s);
        positionSlots(s);
      }
      slot.replaceChildren(canvas);

      const task = page.render({ canvas, viewport });
      s.tasks.set(n, task);
      try {
        await task.promise;
        if (sessionRef.current === s) s.painted.add(n);
      } catch {
        // Cancelled (scrolled away / resized) or failed — drop the in-progress
        // canvas so the placeholder shows and a later pass re-renders it.
        if (sessionRef.current === s && slot.firstElementChild === canvas) {
          slot.replaceChildren();
        }
      } finally {
        s.tasks.delete(n);
      }
    } catch {
      /* transient getPage failure — the next pass will retry */
    } finally {
      s.pending.delete(n);
    }
  }, [positionSlots]);

  /** Warm pages just past the window in pdf.js's cache — no canvas, no DOM. */
  const prefetchPages = useCallback((s: Session, from: number) => {
    for (let n = from; n <= Math.min(from + PREFETCH_DEPTH - 1, s.total); n++) {
      if (s.prefetched.has(n)) continue;
      s.prefetched.add(n);
      s.doc.getPage(n).catch(() => {
        s.prefetched.delete(n);
      });
    }
  }, []);

  /** The single window pass: sync the slot set with the viewport window, paint
   * the unpainted pages in it, and warm the pages just beyond. Scroll offsets
   * are measured from the stage's document top, so `window.scrollY - stageTop`
   * is how far into the book the viewport sits. */
  const renderWindow = useCallback(
    (s: Session) => {
      const stage = stageRef.current;
      if (!stage || s.tops.length === 0) return;
      if (sessionRef.current !== s) return;

      const inside = Math.max(0, window.scrollY - stageTop());
      const first = pageAt(s, inside - RENDER_ABOVE);
      const last = pageAt(s, inside + viewportH() + RENDER_BELOW);

      for (const n of [...s.slots.keys()]) {
        if (n < first || n > last) evict(s, n);
      }
      for (let n = first; n <= Math.min(last, s.total); n++) {
        let slot = s.slots.get(n);
        if (!slot) {
          slot = document.createElement("div");
          slot.className = styles.pageSlot;
          slot.setAttribute("data-page", String(n));
          slot.setAttribute("aria-hidden", "true");
          slot.style.width = `${s.slotW}px`;
          slot.style.top = `${s.tops[n - 1] ?? 0}px`;
          slot.style.aspectRatio = `${s.ratios[n - 1] || 1}`;
          stage.appendChild(slot);
          s.slots.set(n, slot);
        }
        void renderPage(s, n);
      }
      prefetchPages(s, last + 1);
    },
    [evict, prefetchPages, renderPage]
  );

  // Load the document and build the scrolling scaffold. One Session per load —
  // a fresh one on retry, and StrictMode's double mount keeps two editions of
  // the loop from ever sharing imperative state.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !url) return;

    const gen = ++genRef.current;
    let cancelled = false;

    // Teardown of any previous session that may still be standing.
    const prev = sessionRef.current;
    if (prev) {
      for (const task of prev.tasks.values()) {
        try {
          task.cancel();
        } catch {
          /* ignore */
        }
      }
      if (prev.doc) {
        try {
          prev.doc.destroy();
        } catch {
          /* ignore */
        }
      }
    }
    stage.replaceChildren();

    const s: Session = {
      gen,
      doc: null,
      total: pages,
      slots: new Map(),
      painted: new Set(),
      pending: new Set(),
      prefetched: new Set(),
      tasks: new Map(),
      ratios: [],
      tops: [],
      cap: 0,
      slotW: 0,
      spacer: null,
    };
    sessionRef.current = s;

    (async () => {
      try {
        const pdfjs = await loadPdfjs();
        if (cancelled || genRef.current !== gen) return;

        const loadingTask = pdfjs.getDocument({
          url,
          rangeChunkSize: 1 << 20,
          disableAutoFetch: true,
          disableStream: false,
        });
        let doc: any;
        try {
          doc = await loadingTask.promise;
        } catch {
          if (!cancelled && genRef.current === gen) setStatus("error");
          return;
        }
        if (cancelled || genRef.current !== gen) {
          doc.destroy();
          return;
        }
        s.doc = doc;
        s.total = doc.numPages;
        setTotal(doc.numPages);

        const first = await doc.getPage(1);
        if (cancelled || genRef.current !== gen) return;
        const base = first.getViewport({ scale: 1 });
        const ratio = base.width / base.height;
        s.cap = MAX_PAGE_WIDTH;

        // Deep scroll positions are saved per document; restore on return.
        let start = 0;
        try {
          start = Number(sessionStorage.getItem(storageKey(url))) || 0;
        } catch {
          /* storage unavailable — start at the top */
        }

        s.ratios = new Array<number>(doc.numPages).fill(ratio);
        s.slotW = Math.min(stage.clientWidth || 0, s.cap);
        publishPageWidth(s.slotW);
        recomputeTops(s);

        const spacer = document.createElement("div");
        spacer.className = styles.spacer;
        s.spacer = spacer;
        stage.appendChild(spacer);
        positionSlots(s);

        // Restore where the reader sat, then seed the counter + first window.
        window.scrollTo({
          top: Math.min(stageTop() + start, document.body.scrollHeight),
          behavior: "instant",
        });
        setCurrent(pageAt(s, Math.max(0, window.scrollY - stageTop()) + viewportH() / 2));

        if (!cancelled && genRef.current === gen) {
          setStatus("ready");
          renderWindow(s);
        }
      } catch {
        if (!cancelled && genRef.current === gen) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      if (sessionRef.current === s) sessionRef.current = null;
      if (s.doc) {
        try {
          s.doc.destroy();
        } catch {
          /* ignore */
        }
      }
      for (const task of s.tasks.values()) {
        try {
          task.cancel();
        } catch {
          /* ignore */
        }
      }
      if (stage) stage.replaceChildren();
      s.spacer = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, attempt]);

  // Scroll (of the whole window now — the book is the page): current page,
  // the appearing counter, the saved position, and the window pass, all in a
  // single rAF-throttled sweep (rAF also throttles to zero while hidden).
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const s = sessionRef.current;
        if (!s || s.tops.length === 0) return;

        const inside = Math.max(0, window.scrollY - stageTop());
        const next = pageAt(s, inside + viewportH() / 2);
        if (next !== lastPageRef.current) {
          lastPageRef.current = next;
          setCurrent(next);
        }
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          try {
            sessionStorage.setItem(storageKey(url), String(inside));
          } catch {
            /* ignore */
          }
        }, 350);
        renderWindow(s);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [renderWindow, url]);

  // Resize: pages are auto-fit, so a width change re-fits every page and
  // keeps the page under the viewport anchored where it was.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => {
      const s = sessionRef.current;
      if (!s || !s.doc) return;
      const cap = s.cap || Infinity;
      const next = Math.min(stage.clientWidth || 0, cap);
      if (Math.abs(next - s.slotW) < 3 || next === 0) return;

      const inside = Math.max(0, window.scrollY - stageTop());
      const anchorPage = pageAt(s, inside + viewportH() / 2);
      const oldTop = s.tops[anchorPage - 1] ?? 0;

      s.slotW = next;
      publishPageWidth(next);
      recomputeTops(s);
      positionSlots(s);

      const newTop = s.tops[anchorPage - 1] ?? 0;
      window.scrollTo({ top: window.scrollY + (newTop - oldTop), behavior: "instant" });

      // Width change means stale pixel sizes: rebuild the visible canvases.
      for (const task of s.tasks.values()) {
        try {
          task.cancel();
        } catch {
          /* ignore */
        }
      }
      s.tasks.clear();
      for (const n of s.painted) {
        const slot = s.slots.get(n);
        if (slot) slot.replaceChildren();
      }
      s.painted.clear();
      s.pending.clear();
      for (const slot of s.slots.values()) {
        slot.style.width = `${next}px`;
      }
      renderWindow(s);
    });

    ro.observe(stage);
    return () => ro.disconnect();
  }, [positionSlots, renderWindow]);

  const onStageKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    switch (e.key) {
      case " ":
      case "PageDown":
        e.preventDefault();
        window.scrollBy({ top: Math.round(viewportH() * 0.9) });
        break;
      case "ArrowDown":
        e.preventDefault();
        window.scrollBy({ top: Math.round(viewportH() * 0.8) });
        break;
      case "ArrowUp":
        e.preventDefault();
        window.scrollBy({ top: -Math.round(viewportH() * 0.8) });
        break;
      case "PageUp":
        e.preventDefault();
        window.scrollBy({ top: -Math.round(viewportH() * 0.9) });
        break;
      case "Home":
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "instant" });
        break;
      case "End":
        e.preventDefault();
        window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
        break;
    }
  };

  /** The counter turns into a number input on click; committing (Enter or blur)
   * parses the value and jumps so that page's top sits just below the header. */
  const beginEdit = () => {
    setInputVal(String(current));
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const commitEdit = () => {
    const s = sessionRef.current;
    const wanted = parseInt(inputVal, 10);
    const max = s?.total ?? total ?? pages;
    if (s && s.tops.length > 0 && Number.isFinite(wanted)) {
      const n = Math.max(1, Math.min(wanted || 1, max));
      window.scrollTo({
        top: stageTop() + (s.tops[n - 1] ?? 0) - JUMP_OFFSET,
        behavior: "instant",
      });
      setCurrent(n);
    }
    setEditing(false);
  };

  const shownTotal = (total || pages).toLocaleString("en-US");

  return (
    <div ref={readerRef} className={styles.reader} role="region" aria-label="Document">
      <div
        ref={stageRef}
        className={styles.readerStage}
        tabIndex={0}
        onKeyDown={onStageKeyDown}
        aria-label="Document pages"
      />

      <div className={styles.pill} aria-live="polite">
        {editing ? (
          <form
            className={styles.pillForm}
            onSubmit={(e) => {
              e.preventDefault();
              commitEdit();
            }}
          >
            <input
              autoFocus
              className={styles.pillInput}
              aria-label="Jump to page"
              inputMode="numeric"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  e.stopPropagation();
                  cancelEdit();
                }
              }}
            />
            <span className={styles.pillTotal}>/ {shownTotal}</span>
          </form>
        ) : (
          <button type="button" className={styles.pillLabel} onClick={beginEdit}>
            Page {Math.min(current, total || 1)} / {shownTotal}
          </button>
        )}
      </div>

      {status !== "ready" && (
        <div
          className={`${styles.readerOverlay} ${
            status === "error" ? styles.readerOverlayInteractive : ""
          }`}
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
                connection was interrupted. The record above is complete; try again in a
                moment.
              </p>
              <button
                type="button"
                className={styles.readerBtn}
                onClick={() => setAttempt((a) => a + 1)}
              >
                Try again
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function storageKey(url: string): string {
  return `ffop:reader:${url}`;
}