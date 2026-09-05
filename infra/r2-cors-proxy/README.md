# R2 CORS proxy (Cloudflare Worker)

Deploys the missing CORS layer in front of the R2 bucket. The site's reader
(`web/components/PdfReader.tsx`) opens PDFs over HTTP range requests, which the
browser can only make cross-origin when the server answers
`Access-Control-Allow-Origin`. The `pub-….r2.dev` endpoint supports ranges but
serves no CORS headers and cannot be configured (R2 CORS applies to custom
domains only), so this worker adds them and passes the request through to the
bucket.

It forwards each request's `Range` header verbatim and streams the upstream
response back, so nothing is buffered and R2's free egress is preserved.

## Deploy

```bash
cd infra/r2-cors-proxy
npx wrangler login          # once
npx wrangler deploy
```

Then point the site's storage at the worker URL. In Vercel set the build-time
env var:

```
R2_BASE_URL = https://ffop-r2-reader.<your-subdomain>.workers.dev
```

(`lib/storage.ts` reads `R2_BASE_URL` at build time, so rebuild /
re-deploy after changing it.) No code change needed — the worker accepts the
same object keys the bucket does.

## Verify

```bash
curl -sI -H "Origin: https://example.com" -r 0-255 \
  "https://<your-worker>.workers.dev/01-sir-syed-ahmad-khan/causes-of-the-indian-revolt.pdf"
# expect: HTTP/2 206, Access-Control-Allow-Origin, Content-Range: bytes 0-255/…
```

## Alternative without a worker

If you have a spare domain on Cloudflare, attach it to the bucket, configure a
CORS policy in the R2 dashboard (`Allow-all` origins is fine — the bucket is
public; allow the `Range` header), and set `R2_BASE_URL` to that domain. Then
this proxy is unnecessary.