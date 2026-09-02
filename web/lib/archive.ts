/**
 * archive.org is the back end for this site. The scans are far too large to serve
 * from Vercel — the collection runs to 1.7 GB and one volume alone is 392 MB — so
 * every document is hosted as an archive.org item and read through their embedded
 * BookReader, which already solves page-level streaming for scans this size.
 *
 * A work is live the moment its `iaIdentifier` is filled in. Until then the viewer
 * renders a pending state and nothing else about the page changes.
 */

const BASE = "https://archive.org";

/** The embeddable BookReader for an item, optionally opened at a given page. */
export function iaEmbed(identifier: string, page = 1): string {
  const start = Math.max(0, page - 1);
  return `${BASE}/embed/${encodeURIComponent(identifier)}?ui=embed#page/n${start}/mode/1up`;
}

/** The item's public record page, linked from the record panel as provenance. */
export function iaDetails(identifier: string): string {
  return `${BASE}/details/${encodeURIComponent(identifier)}`;
}

/**
 * A direct download. With a filename this points at the file itself; without one
 * it opens the item's file listing, which is the safer default when the exact
 * name inside the item is not recorded.
 */
export function iaDownload(identifier: string, filename?: string): string {
  const id = encodeURIComponent(identifier);
  return filename ? `${BASE}/download/${id}/${encodeURIComponent(filename)}` : `${BASE}/download/${id}`;
}

/**
 * File weight for the download control. The brief is firm that the size is always
 * stated: on an ordinary connection in Pakistan a 392 MB download is a decision,
 * not a click.
 */
export function formatBytes(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  if (mb >= 100) return `${Math.round(mb)} MB`;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Page counts read better with a thousands separator once they pass a thousand. */
export function formatPages(pages: number): string {
  return pages.toLocaleString("en-US");
}
