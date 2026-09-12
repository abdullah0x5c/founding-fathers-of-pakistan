// Copies the pdf.js runtime files this project self-hosts (see
// WorkViewer.tsx) from node_modules into public/vendor/pdfjs/, so the reader
// never depends on a CDN and the vendored copy always matches the
// `pdfjs-dist` version pinned in package.json. Runs on every `npm install`.
//
// This includes the wasm/ directory (openjpeg.wasm, jbig2.wasm, qcms_bg.wasm,
// quickjs-eval.wasm, and their JS fallbacks). openjpeg.wasm in particular is
// required for JPEG2000 (JPX) image decoding, which is how scanned-page PDFs
// commonly encode their page images — without it every such page renders
// blank.
import { copyFileSync, cpSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const webRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pdfjsRoot = path.join(webRoot, "node_modules/pdfjs-dist");
const src = path.join(pdfjsRoot, "build");
const dest = path.join(webRoot, "public/vendor/pdfjs");

mkdirSync(dest, { recursive: true });
for (const file of ["pdf.min.mjs", "pdf.worker.min.mjs"]) {
  copyFileSync(path.join(src, file), path.join(dest, file));
  console.log(`copied ${file} -> public/vendor/pdfjs/`);
}

const wasmSrc = path.join(pdfjsRoot, "wasm");
const wasmDest = path.join(dest, "wasm");
mkdirSync(wasmDest, { recursive: true });
cpSync(wasmSrc, wasmDest, { recursive: true });
console.log("copied wasm/ -> public/vendor/pdfjs/wasm/");
