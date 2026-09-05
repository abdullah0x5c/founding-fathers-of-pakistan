# Reference: a self-hosted PDF.js scan reader

Notes on a working in-house PDF viewer found on `hamid-uddin-farahi.com/library/`
(e.g. `/library/tafsir-surah-baqarah/`), captured for anyone building a custom
reader for this archive instead of — or in addition to — the current
Internet Archive BookReader embed (`web/components/WorkViewer.tsx`).

This is a **reference to study and adapt, not a page to copy wholesale**. It is
someone else's site; treat the numbers below as "here is proof this approach
works and roughly how," not as code to lift verbatim.

## Why this project doesn't already do this

`web/components/WorkViewer.tsx` currently embeds archive.org's BookReader in an
iframe deliberately: the collection is 1.7 GB (one volume alone is 392 MB), so a
client-side viewer has to stream pages rather than download the whole PDF, and
BookReader already solves that plus RTL pagination for Urdu/Persian/Arabic
items via upload-time metadata. A custom reader is worth building only if it
needs to do something BookReader can't (in-house branding, a reading feature
BookReader doesn't have, removing the archive.org dependency, etc.) — the
streaming/RTL problem it solves still has to be solved by whatever replaces it.

## What the reference site does

Confirmed by fetching the live page and reading its shipped JS directly
(not from memory or the pdf.js docs) — `curl -A "Mozilla/5.0 ..." https://hamid-uddin-farahi.com/library/tafsir-surah-baqarah/`
(the site 403s generic/bot user agents, a normal browser UA gets 200) and
`view-source`-diffing the one inline `<script>` block that drives the reader.

**Stack:** the site is static Astro; the reader itself is vanilla JS on top of
**self-hosted PDF.js** — no framework, no third-party viewer widget, no
`<iframe>`/`<embed>`/native PDF plugin. Every page renders to a `<canvas>`.

**Assets:**
- `/vendor/pdfjs/pdf.min.mjs` — pdf.js core, self-hosted (not CDN), loaded via
  dynamic `import()`.
- `/vendor/pdfjs/pdf.worker.min.mjs` — the pdf.js worker, wired up via
  `lib.GlobalWorkerOptions.workerSrc` before calling `getDocument()`.

**Markup skeleton** (Astro-rendered, then hydrated by the inline script):

```html
<div class="reader-bar">
  <span class="pgcount"><span id="pgnow">1</span> / <span id="pgtot">152</span></span>
  <span class="grow"></span>
  <button id="zout" aria-label="Narrower">&minus;</button>
  <button id="zin" aria-label="Wider">+</button>
</div>
<div id="reader" class="reader" data-pdf="/library/tafsir-surah-baqarah.pdf"></div>
<p id="rstat" class="rstat">Loading the scan&hellip;<span class="rprog indet" id="rprog"><i id="rbar"></i></span></p>
```

**Load sequence** (paraphrased from the shipped script, not quoted verbatim):

1. Dynamically `import()` the pdf.js module, set the worker source, then call
   `getDocument({ url, disableAutoFetch: true, disableStream: false, rangeChunkSize: 65536 })`.
   `disableAutoFetch` + a chunked range size means it streams byte ranges on
   demand instead of pulling the whole PDF up front — the same problem
   BookReader solves for this project, solved here with pdf.js's own HTTP
   range-request support instead of an archive.org-hosted item.
2. `task.onProgress` reports `{loaded, total}`; the loading line and a progress
   bar fill in as bytes arrive (falls back to an indeterminate animated bar
   until the total is known).
3. Once the document resolves, read `pdfDoc.numPages`, compute page 1's aspect
   ratio (`viewport.width / viewport.height`), and create one placeholder
   `<div class="pg">` per page up front, each pre-sized with CSS
   `aspect-ratio` so the layout doesn't jump before any canvas exists.
4. Lazy-render with an `IntersectionObserver` (root margin ~1000px, so pages
   render just before they scroll into view, not exactly on entry): for each
   page that intersects, `pdfDoc.getPage(n)`, build a viewport scaled to the
   placeholder's current CSS width times `min(devicePixelRatio, 2)`, create a
   canvas at that pixel size, `page.render({ canvasContext, viewport })`,
   append it, and mark the page as rendered in a `Set` so it's never
   redrawn. Capping the DPR multiplier at 2 keeps very high-DPI screens from
   rendering absurdly large canvases.
5. "Zoom" is a fixed set of container max-widths (`620/800/980/1180/1400`px)
   stepped by `+`/`−` buttons — not a CSS transform. Changing width tears down
   every rendered canvas, clears the rendered-set, and lets the
   IntersectionObserver re-render each visible page at the new size. Simple,
   and correct because canvases are cheap to regenerate one page at a time,
   but it means re-rendering, not resampling.
6. `contextmenu` is suppressed on the reader container (`e.preventDefault()`)
   as a soft deterrent against "Save image as" — cosmetic only; the PDF URL
   itself is still a plain, directly fetchable static asset.

## What this implies for adapting it here

- **Range requests need a host that supports them.** pdf.js's chunked
  streaming relies on the server honoring HTTP `Range` headers on the PDF
  file. A static host (Vercel, in this project's case) serving files from
  `public/` generally does; confirm before relying on it — this project's
  scans currently live on archive.org specifically to avoid serving files this
  large from the app's own hosting at all.
- **RTL pagination is not solved by pdf.js or this pattern.** BookReader
  currently gets Urdu/Persian page order right from archive.org item
  metadata set at upload time. A pdf.js-based reader would need to either bake
  correct page order into the PDF itself or add explicit RTL handling (reverse
  IntersectionObserver order, mirror the scroll direction, etc.) — nothing
  here does that for you.
- **This is a scroll-through-canvases reader, not a paginated book UI.** No
  page-turn animation, no thumbnail filmstrip, no rotate control — just one
  long vertical scroll to the last page, with a right-edge page counter that
  is clickable to type a page number and jump. Decide whether that's the
  desired reading experience before using this as the target shape.
- **Self-host the two pdf.js files** (`pdf.min.mjs` + `pdf.worker.min.mjs`)
  under `public/vendor/pdfjs/` rather than a CDN, matching the reference site
  and keeping the reader working offline/without a third-party dependency.
- **`WorkViewer.tsx` is now the render spot for `PdfReader.tsx`** — it wraps
  the reader with no frame around it: no download row, no page/size metadata
  footer, and no site footer beneath the book, just the "not yet online"
  panel for works without a confirmed `r2Key`.
