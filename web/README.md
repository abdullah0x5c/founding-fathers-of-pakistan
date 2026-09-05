# Founding Fathers of Pakistan

A reading archive of the primary writings of eleven figures in the making of Pakistan.
Next.js App Router, fully static, deployed on Vercel. The scans themselves are hosted
in a Cloudflare R2 bucket the site owns, and read through the browser's own PDF viewer.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 11 figure routes + 61 work routes + / and /about
```

## Deploying to Vercel

The repository root is the archive folder; the site lives in `web/`. When importing the
project, set **Root Directory** to `web`. Everything else is defaults — no build
overrides.

The one environment variable that matters for the reader: `R2_BASE_URL`, the
bucket's **CORS-enabled** public URL. Note no `NEXT_PUBLIC_` prefix — every route
here is statically generated, so this is only ever read on the server at build
time and baked into the HTML; nothing reads it from the browser at runtime.
`lib/storage.ts` falls back to the committed `pub-….r2.dev` URL if it's unset.

**The reader needs CORS on that URL.** `PdfReader` renders pages by fetching PDF
byte ranges from the browser — a cross-origin `fetch` — so the storage endpoint
must answer `Access-Control-Allow-Origin`. The bucket's raw `pub-….r2.dev`
endpoint serves no CORS headers and can't be configured (R2 CORS applies to
custom domains only), so by default the reader cannot reach it; request the
worker in `infra/r2-cors-proxy/` (deploy steps in its README) and set
`R2_BASE_URL` to its URL at build time.

`content/` (1.7 GB of scans) is gitignored. It never needs to reach Vercel — the site
reads it from R2 at request time (the reader's ranged fetch), not from the repo.

## Bringing documents online

Every work page already exists and shows its full record. Where a work has no
`r2Key`, the reader area shows a quiet "scan not yet online" panel.

### Uploading to R2

R2's object keys are just each work's `sourceFile` — the same relative path files
already live at under `content/` — so once a file is uploaded under that same key,
confirming it is a single step:

```bash
# upload content/ to the bucket however you like — the Cloudflare dashboard,
# rclone, or the S3-compatible API — preserving the folder structure exactly
# (01-sir-syed-ahmad-khan/asar-us-sanadid.pdf, and so on)

python3 scripts/check-r2-upload.py   # HEAD-checks every catalogued scan against
                                      # the bucket and compares byte sizes
python3 scripts/build-works.py       # fills in r2Key for everything confirmed
```

`check-r2-upload.py` doesn't just check that a file exists — it compares the reported
size against the byte count measured locally in `content/works.seed.json`, so a
truncated or wrong upload gets caught rather than silently marked live. Only entries
that match get written to `content/ia-map.json`'s counterpart, `content/r2-map.json`,
which `build-works.py` reads to set `r2Key`. Nothing on the site can claim a document
is online before this has actually verified it — re-run it any time after uploading
more files.

If a HEAD request gets a `403 Forbidden` from a script or tool rather than a browser,
that's Cloudflare rejecting the tool's default user agent as a bot, not a real access
problem — set an ordinary-looking `User-Agent` header and it goes away (already handled
in `check-r2-upload.py`).

### One at a time

For a single item — replacing a bad scan, adding one you found later — upload the file
to the bucket under the exact key `sourceFile` already names for that record, then run
the two commands above; there's no per-record editing needed since the key is derived
from data already in the catalogue.

### The archive.org path (superseded, kept for reference)

`scripts/generate-ia-upload.py` runs the equivalent pipeline against archive.org
instead of R2 — plan, upload via the `ia` CLI, confirm, regenerate — and is still there
if R2 ever needs a fallback or a second mirror. `iaIdentifier`/`iaFilename` on a record
now only drive an optional "Also at the Internet Archive" citation line in the record
panel; they no longer affect the viewer or the download link, both of which come from
`r2Key`. One record carries this citation already — Allama Iqbal's *The Development of
Metaphysics in Persia* happens to be an exact match (same title, same author, confirmed
via the archive.org metadata API) for an existing public-domain item there.

## Where things live

| Path | What it is |
|---|---|
| `content/types.ts` | The `Figure`, `Work` and `Edition` shapes |
| `content/figures.ts` | The eleven, with biographies |
| `content/works.ts` | **Generated.** 61 catalogue entries over 64 scans |
| `content/works.seed.json` | **Generated.** Measured page counts and byte sizes |
| `content/works.catalog.json` | **Generated.** Machine-readable catalogue dump, read by `generate-ia-upload.py` |
| `content/r2-map.json` | **Generated**, once uploads exist. `sourceFile` → confirmed live in R2 |
| `content/ia-map.json` | **Generated**, archive.org path only. `sourceFile` → confirmed archive.org identifier |
| `lib/storage.ts` | Builds the R2 URL a work's reader and download link use |
| `lib/archive.ts` | archive.org URL builders (citation only now), byte and page formatting |
| `lib/catalogue.ts` | Lookups, shelf ordering, counts |
| `components/WorkViewer.tsx` | The document: reader (or "not yet online" panel) + the quiet download link |
| `components/PdfReader.tsx` | The reader: windowed pdf.js canvas renderer — the DOM holds only a few pages near the viewport over a full-height spacer, pages auto-fit (capped at the scan's resolution), keyboard nav, a fading page pill, scroll-position memory |
| `public/vendor/pdfjs/pdf.worker.min.mjs` | Self-hosted pdf.js worker |
| `infra/r2-cors-proxy/` | Cloudflare Worker adding CORS to R2 range requests — see "Deploying to Vercel" |
| `scripts/scan-content.mjs` | Walks `../content/`, measures every PDF |
| `scripts/build-works.py` | Merges the prose table with the measurements |
| `scripts/check-r2-upload.py` | Confirms uploads and fills in `r2Key` — see "Bringing documents online" above |
| `scripts/generate-ia-upload.py` | archive.org path, superseded — see above |

### Regenerating the catalogue

`pages` and `bytes` are never typed by hand — hand-typing them for fifty scans invites
errors. They are measured by `scan-content.mjs` (which needs poppler's `pdfinfo`) and
merged into `works.ts` by `build-works.py`, which also holds every title, date and
introduction.

```bash
node scripts/scan-content.mjs     # remeasure content/
python3 scripts/build-works.py    # regenerate content/works.ts
```

Editing `content/works.ts` directly is fine for a one-off — adding an identifier, fixing
a typo — but the next regeneration will overwrite it. Anything that should survive
belongs in `build-works.py`.

The generator prints any scan it did not catalogue. One is expected: `Islam by Syed
Ameer Ali.pdf` is byte-identical to `Ethics of Islam` and is deliberately catalogued once.

## Before launch

Run `npm run dev` and read the dashed boxes. Every claim written from general knowledge
rather than read off a scan is recorded in a `verify` array and rendered in development
only — they never reach the production build. There are 107 of them, mostly
dates and attributions. They are the launch checklist.

Three things in particular need a decision rather than a check:

- **Rights on four modern items.** The Troll study (1978) is in copyright; the Shan
  Mohammad compilation, the 1978 Rahmat Ali collected works, the Aga Khan memoirs (1954)
  and Liaquat's 1950 speeches all carry apparatus or authorship that probably still is.
  Decide what can be hosted before uploading.
- **The Shaukat Ali note.** The source collection's `Readme.txt` credits him with the
  magazine *Zamindar*, which is more usually associated with Zafar Ali Khan. The note is
  on his page and should be confirmed or removed.
- **Two folded editions.** `Khutbat Al Ahmadia` and `Life of Muhammad … = Khutbat` are
  treated as one work in two languages on the strength of the second title. If they turn
  out to be different works, split them in `build-works.py`.

## Known deviations from the design canvas

- **No century-of-overlap ribbon** and **no completeness ledger or progress bars**, by
  instruction. Counts on the site are counts of what is held, never `N of M`.
- **The pages are the document — there is no viewer chrome.** A work's scans
  render in-page via a custom pdf.js reader (`components/PdfReader.tsx`) that
  looks like the book itself: a full-width column of pages, auto-fitted to the
  container (capped at the scan's native resolution, so nothing upscales
  blurry), the next page simply below the one above it as you scroll. It
  streams byte ranges from R2 over a sliding window — only a handful of page
  slots and canvases exist for the viewport, over a spacer that carries the
  document's full height — so a 117 MB scan opens in seconds instead of after
  a full download, and a 415-page volume never means 415 DOM nodes. The only
  reader UI is a page pill that fades after you stop scrolling; arrows,
  PageUp/PageDown, Home and End drive the pages from the keyboard, and the last
  scroll position is remembered per visit. Print and search, being per-panel
  native-viewer features, are not reproduced.
- **Portraits are duotoned.** The source photographs span ninety years and several
  processes, and their scan tints range from sepia through cold grey to one distinctly
  purple. They are flattened to a single treatment so the set reads as one collection.
