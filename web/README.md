# Founding Fathers of Pakistan

A reading archive of the primary writings of eleven figures in the making of Pakistan.
Next.js App Router, fully static, deployed on Vercel. The scans themselves are hosted
on the Internet Archive and read through their embedded BookReader.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 11 figure routes + 47 work routes + / and /about
```

## Deploying to Vercel

The repository root is the archive folder; the site lives in `web/`. When importing the
project, set **Root Directory** to `web`. Everything else is defaults — no environment
variables, no build overrides.

`content/` (1.7 GB of scans) is gitignored. It never needs to reach Vercel.

## Bringing a document online

Every work page already exists and shows its full record. Where a work has no
`iaIdentifier`, the viewer shows a quiet "scan not yet online" panel instead of an
embed. To bring one online:

1. Upload the PDF to archive.org as its own item.
2. **Set the item's language correctly.** For Urdu and Persian items this is what
   makes BookReader paginate right to left. Getting it wrong is immediately obvious
   to an Urdu reader and almost never noticed by the person who uploaded it.
3. Add the identifier to the record in `content/works.ts`:

   ```ts
   iaIdentifier: "asar-us-sanadid-urdu",
   iaFilename: "asar-us-sanadid-urdu.pdf",   // optional, for the direct download link
   ```

That is the whole change. Commit and Vercel redeploys.

`iaFilename` is optional: without it the download button opens the item's file listing
instead of the file itself, which is the safer default when the name inside the item
isn't known.

One record is already live — Aga Khan III's *India in Transition* points at an existing
public-domain Archive item (`indiaintransitio00agakuoft`) so the embed path can be seen
working. Replace it if you would rather serve your own scan.

## Where things live

| Path | What it is |
|---|---|
| `content/types.ts` | The `Figure`, `Work` and `Edition` shapes |
| `content/figures.ts` | The eleven, with biographies |
| `content/works.ts` | **Generated.** 47 catalogue entries over 50 scans |
| `content/works.seed.json` | **Generated.** Measured page counts and byte sizes |
| `lib/archive.ts` | archive.org URL builders, byte and page formatting |
| `lib/catalogue.ts` | Lookups, shelf ordering, counts |
| `components/WorkViewer.tsx` | The viewer. Single swap point for a custom reader |
| `scripts/scan-content.mjs` | Walks `../content/`, measures every PDF |
| `scripts/build-works.py` | Merges the prose table with the measurements |

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
only — they never reach the production build. There are around ninety of them, mostly
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
- **The viewer's own controls are archive.org's.** The canvas draws zoom, rotate, a page
  field and a thumbnail filmstrip. BookReader supplies all four inside the iframe, and
  drawing a second set outside it would give the reader two sets of controls that
  disagree. The chrome around the frame — bar, language and direction label, download
  button with its size stated — is ours.
- **Portraits are duotoned.** The source photographs span ninety years and several
  processes, and their scan tints range from sepia through cold grey to one distinctly
  purple. They are flattened to a single treatment so the set reads as one collection.
