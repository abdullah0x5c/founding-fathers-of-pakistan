/**
 * Edge proxy that lets the in-page pdf.js reader fetch byte ranges from the
 * R2 bucket.
 *
 * Why this exists: the bucket's `pub-….r2.dev` public endpoint truthfully
 * supports HTTP Range requests (206 Partial Content, `Accept-Ranges: bytes`)
 * but serves NO `Access-Control-Allow-Origin` header, and the `r2.dev`
 * subdomain cannot have a CORS policy configured against it (R2 CORS is only
 * configurable for custom domains). A browser trying to `fetch()` said ranges
 * cross-origin — which is exactly what the reader does — is therefore blocked
 * before a single byte moves. This worker adds the missing headers and proxies
 * the request. It is a thin, stateless pass-through: the Range header is
 * forwarded verbatim and the upstream response is streamed straight back, so
 * files are never buffered in the worker and R2 egress stays free.
 *
 * Alternative if you have a spare domain on Cloudflare: point it at the bucket,
 * configure a CORS policy in the R2 dashboard for that domain, and set
 * R2_BASE_URL to it — then no worker is needed. This proxy exists so the set-up
 * works with the existing `pub-….r2.dev` URL alone.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const origin = request.headers.get("Origin") || "*";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range",
      "Access-Control-Max-Age": "86400",
      // The reader's fetch needs to see the range bookkeeping on responses.
      "Access-Control-Expose-Headers":
        "Content-Range, Content-Length, Accept-Ranges, Etag",
      Vary: "Origin, Range",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response(null, { status: 405, headers: cors });
    }

    const key = url.pathname.replace(/^\//, "");
    if (!key) {
      return new Response("Not found", { status: 404, headers: cors });
    }

    const upstream = `${env.BUCKET_ORIGIN}/${key}`;
    const headers = new Headers();
    const range = request.headers.get("Range");
    if (range) headers.set("Range", range);
    // Cloudflare rejects some tooling default user agents as bots; the reader
    // and pdf.js send ordinary browser ones, but this keeps HEAD checks simple.
    headers.set("User-Agent", "Mozilla/5.0 (compatible; ffop-r2-reader/1.0)");

    const res = await fetch(upstream, { method: request.method, headers });

    const out = new Headers(res.headers);
    out.set("Access-Control-Allow-Origin", origin);
    out.set("Vary", "Origin, Range");
    if (!out.has("Cache-Control")) {
      // Scans are immutable once uploaded; let R2/CF edge cache them.
      out.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    }

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: out,
    });
  },
};