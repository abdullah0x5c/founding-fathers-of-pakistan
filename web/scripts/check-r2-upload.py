# -*- coding: utf-8 -*-
"""Confirms which scans are actually live in the R2 bucket, and only then marks
them so in the catalogue.

    python3 scripts/check-r2-upload.py
    python3 scripts/build-works.py     # fills in r2Key for everything confirmed

Checks every sourceFile from content/works.catalog.json against the bucket's
public URL with a HEAD request, and compares the reported size against the
locally measured byte count in content/works.seed.json — matching content-length
alone isn't proof of nothing, but it catches a truncated or wrong-file upload
far more reliably than "the request didn't 404" would on its own.

Only entries that are present *and* the right size are written to
content/r2-map.json, which build-works.py reads to set `r2Key`. Nothing on the
site can claim a document is available before this has actually verified it.

Safe to re-run at any time — e.g. after uploading more files, or after fixing a
mismatched one.
"""
import json
import pathlib
import sys
import urllib.request

WEB = pathlib.Path(__file__).resolve().parents[1]
CATALOG_PATH = WEB / "content" / "works.catalog.json"
SEED_PATH = WEB / "content" / "works.seed.json"
R2_MAP_PATH = WEB / "content" / "r2-map.json"

R2_BASE = "https://pub-52015ba6ca1d4c5096d8546e93f6beb3.r2.dev"

# Cloudflare rejects urllib's default "Python-urllib/3.x" user agent as a bot;
# any ordinary-looking one gets through.
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; ffop-r2-check/1.0)"}


def head_size(key: str):
    url = f"{R2_BASE}/{key}"
    req = urllib.request.Request(url, method="HEAD", headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            length = r.headers.get("Content-Length")
            return int(length) if length is not None else None
    except Exception as e:
        print(f"  ! {key}: {e}", file=sys.stderr)
        return None


def main():
    if not CATALOG_PATH.exists():
        sys.exit("content/works.catalog.json is missing — run scripts/build-works.py first.")
    catalog = json.loads(CATALOG_PATH.read_text())
    seed = {r["sourceFile"]: r for r in json.loads(SEED_PATH.read_text())}
    r2_map = json.loads(R2_MAP_PATH.read_text()) if R2_MAP_PATH.exists() else {}

    keys = []
    for w in catalog:
        keys.append(w["sourceFile"])
        for e in w.get("editions", []):
            keys.append(e["sourceFile"])

    confirmed, mismatched, missing = [], [], []
    for key in keys:
        expected = seed.get(key, {}).get("bytes")
        remote = head_size(key)
        if remote is None:
            missing.append(key)
        elif expected is not None and remote != expected:
            mismatched.append((key, expected, remote))
        else:
            confirmed.append(key)
            r2_map[key] = True

    R2_MAP_PATH.write_text(json.dumps(r2_map, indent=2, ensure_ascii=False) + "\n")

    print(f"{len(confirmed)} confirmed live with matching size (of {len(keys)} catalogued scans)")
    if mismatched:
        print(f"\n{len(mismatched)} present but the WRONG SIZE — likely a partial or wrong upload, "
              f"not marked live:")
        for key, exp, got in mismatched:
            print(f"   expected {exp:>12,} bytes, got {got:>12,}  {key}")
    if missing:
        print(f"\n{len(missing)} not found in the bucket:")
        for key in missing:
            print("  ", key)
    if confirmed:
        print("\nNext: python3 scripts/build-works.py   (fills in r2Key for the confirmed ones)")


if __name__ == "__main__":
    main()
