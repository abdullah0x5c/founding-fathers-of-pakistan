// Walks ../content/ and records, for every PDF, its measured page count and byte
// size. Hand-typing those for fifty scans invites errors; works.ts is written on
// top of this seed so both numbers are measured rather than guessed.
//
//   node scripts/scan-content.mjs
//
// Re-run whenever the corpus changes. Requires poppler's pdfinfo on PATH.

import { readdir, stat, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { join, relative } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const ROOT = fileURLToPath(new URL("../../content/", import.meta.url));
const OUT = fileURLToPath(new URL("../content/works.seed.json", import.meta.url));

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.name.toLowerCase().endsWith(".pdf")) out.push(full);
  }
  return out;
}

async function pageCount(file) {
  try {
    const { stdout } = await run("pdfinfo", [file]);
    const m = stdout.match(/^Pages:\s+(\d+)/m);
    return m ? Number(m[1]) : null;
  } catch {
    return null; // truncated or corrupt — the caller records it as unreadable
  }
}

const files = (await walk(ROOT)).sort();
const records = [];

for (const file of files) {
  const rel = relative(ROOT, file);
  const [folder] = rel.split("/");
  const { size } = await stat(file);
  const pages = await pageCount(file);
  records.push({ sourceFile: rel, folder, bytes: size, pages, readable: pages !== null });
  process.stdout.write(`${pages === null ? "  UNREADABLE" : String(pages).padStart(5)}  ${rel}\n`);
}

await writeFile(OUT, JSON.stringify(records, null, 2) + "\n");
console.log(`\n${records.length} files -> content/works.seed.json`);
console.log(`${records.filter((r) => !r.readable).length} unreadable`);
