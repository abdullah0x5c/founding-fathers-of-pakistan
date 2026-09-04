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
 */

const R2_BASE =
  process.env.NEXT_PUBLIC_R2_BASE_URL || "https://pub-52015ba6ca1d4c5096d8546e93f6beb3.r2.dev";

/** Direct URL to an object, given its key (== a Work or Edition's sourceFile). */
export function r2Url(key: string): string {
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  return `${R2_BASE}/${encoded}`;
}
