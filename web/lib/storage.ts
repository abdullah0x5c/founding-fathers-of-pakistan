/**
 * R2 is the back end for this site's documents. archive.org's BookReader was the
 * original plan — its page-level streaming solved the problem of scans this large
 * without needing our own infrastructure — but this collection now lives in a
 * Cloudflare R2 bucket the site owns instead: full control, no dependency on a
 * third party's item lifecycle, and R2 charges nothing for egress even on a
 * 392 MB file.
 *
 * The bucket's object keys are identical to each work's `sourceFile` — the same
 * relative path under content/ — so no separate mapping is needed between a
 * catalogue entry and where its file lives in the bucket.
 *
 * `R2_BASE_URL` deliberately has no `NEXT_PUBLIC_` prefix. Every route on this site
 * is statically generated, so this value is only ever read here on the server at
 * build time — it gets baked into the rendered HTML as a plain `<iframe src>`/`href`,
 * never read from `process.env` in browser JS. The `NEXT_PUBLIC_` prefix exists to
 * inline a value into the client bundle for exactly that kind of runtime browser
 * read, which nothing here does, so it isn't needed even though the URL itself
 * was never a secret (it's a public bucket's public URL).
 */

const R2_BASE = process.env.R2_BASE_URL || "https://pub-52015ba6ca1d4c5096d8546e93f6beb3.r2.dev";

/** Direct URL to an object, given its key (== a Work or Edition's sourceFile). */
export function r2Url(key: string): string {
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  return `${R2_BASE}/${encoded}`;
}
