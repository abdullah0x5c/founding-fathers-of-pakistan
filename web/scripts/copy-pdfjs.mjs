// Copies the two pdf.js runtime files this project self-hosts (see
// WorkViewer.tsx) from node_modules into public/vendor/pdfjs/, so the reader
// never depends on a CDN and the vendored copy always matches the
// `pdfjs-dist` version pinned in package.json. Runs on every `npm install`.
import { copyFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const webRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(webRoot, "node_modules/pdfjs-dist/build");
const dest = path.join(webRoot, "public/vendor/pdfjs");

mkdirSync(dest, { recursive: true });
for (const file of ["pdf.min.mjs", "pdf.worker.min.mjs"]) {
  copyFileSync(path.join(src, file), path.join(dest, file));
  console.log(`copied ${file} -> public/vendor/pdfjs/`);
}
