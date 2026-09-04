# -*- coding: utf-8 -*-
"""Bulk-upload pipeline for getting the 50 scans onto archive.org without
touching each one by hand.

    python3 scripts/build-works.py            # regenerate the catalogue first
    python3 scripts/generate-ia-upload.py plan

    # then, once, outside this repo:
    pip install internetarchive
    ia configure

    ia upload --spreadsheet=scripts/ia-uploads.csv

    python3 scripts/generate-ia-upload.py confirm
    python3 scripts/build-works.py             # now fills in every iaIdentifier
    git add -A && git commit -m "Bring scans online" && git push

`plan` assigns a deterministic identifier to every scan that content/works.catalog.json
says isn't mapped yet (ffop-<figure>-<work>, or -e2/-e3/... for further editions of the
same work), checks each one against the public archive.org metadata API to make sure it
isn't already someone else's item, and writes:

  - scripts/ia-uploads.csv   the spreadsheet `ia upload --spreadsheet=` uploads unattended
  - scripts/ia-plan.json     the same mapping, held here until it's confirmed live

`confirm` re-checks that same public API for each planned identifier, and merges only the
ones that are actually present on archive.org into content/ia-map.json — the file
build-works.py reads to fill in iaIdentifier/iaFilename. Nothing is marked live on the
site until this step has verified it really is; an upload that's still running, or that
failed partway, just doesn't show up yet and can be confirmed again later.

Both commands are safe to re-run. `plan` only assigns identifiers to scans that don't
have one yet, and `confirm` only ever adds to content/ia-map.json, never removes.
"""
import csv
import json
import pathlib
import re
import sys
import time
import urllib.request

WEB = pathlib.Path(__file__).resolve().parents[1]
CONTENT_ROOT = WEB.parent / "content"
CATALOG_PATH = WEB / "content" / "works.catalog.json"
IA_MAP_PATH = WEB / "content" / "ia-map.json"
PLAN_PATH = WEB / "scripts" / "ia-plan.json"
CSV_PATH = WEB / "scripts" / "ia-uploads.csv"

RTL_LANGS = {"Urdu", "Persian", "Arabic"}
SUBJECTS = "Founding Fathers of Pakistan;Pakistan Movement;South Asian history"


def figure_names():
    """slug -> display name, read straight out of figures.ts rather than duplicated here."""
    text = (WEB / "content" / "figures.ts").read_text()
    slugs = re.findall(r'slug:\s*"([^"]+)"', text)
    names = re.findall(r'\n\s*name:\s*"([^"]+)"', text)
    return dict(zip(slugs, names))


def sanitize(identifier: str) -> str:
    identifier = identifier.lower()
    identifier = re.sub(r"[^a-z0-9._-]+", "-", identifier)
    identifier = re.sub(r"-{2,}", "-", identifier).strip("-")
    return identifier[:80]


def remote_item_exists(identifier: str) -> bool:
    """True if archive.org already has *anything* under this identifier. Uses the
    public metadata endpoint — no archive.org account or `ia configure` needed."""
    try:
        with urllib.request.urlopen(f"https://archive.org/metadata/{identifier}", timeout=15) as r:
            data = json.loads(r.read())
        return bool(data.get("metadata")) or bool(data.get("files"))
    except Exception as e:
        print(f"  ! could not check {identifier}: {e}", file=sys.stderr)
        return False


def remote_item_has_file(identifier: str, filename: str) -> bool:
    try:
        with urllib.request.urlopen(f"https://archive.org/metadata/{identifier}", timeout=15) as r:
            data = json.loads(r.read())
        return any(f.get("name") == filename for f in data.get("files", []))
    except Exception as e:
        print(f"  ! could not check {identifier}: {e}", file=sys.stderr)
        return False


def cmd_plan():
    if not CATALOG_PATH.exists():
        sys.exit("content/works.catalog.json is missing — run scripts/build-works.py first.")
    catalog = json.loads(CATALOG_PATH.read_text())
    names = figure_names()
    ia_map = json.loads(IA_MAP_PATH.read_text()) if IA_MAP_PATH.exists() else {}

    rows = []       # for the CSV
    plan = {}        # sourceFile -> {identifier, filename}
    skipped_missing_file = []
    collisions = []

    def add(source_file, title, urdu, lang, year, kind, intro, figure_slug, ident_hint, byline=None):
        if source_file in ia_map:
            return  # already confirmed live in an earlier round
        full_path = CONTENT_ROOT / source_file
        if not full_path.exists():
            skipped_missing_file.append(source_file)
            return

        identifier = sanitize(ident_hint)
        if remote_item_exists(identifier):
            collisions.append(identifier)
            return

        filename = full_path.name
        plan[source_file] = {"identifier": identifier, "filename": filename}
        rows.append({
            "identifier": identifier,
            "file": str(full_path),
            "title": title,
            "creator": byline or names.get(figure_slug, figure_slug),
            "date": year,
            "language": lang,
            "page-progression": "rl" if lang in RTL_LANGS else "lr",
            "collection": "opensource",
            "mediatype": "texts",
            "subject": f"{SUBJECTS};{names.get(figure_slug, figure_slug)}",
            "description": intro,
        })

    for w in catalog:
        add(w["sourceFile"], w["title"], w.get("titleUrdu"), w["lang"], w.get("year", ""),
            w["kind"], w["intro"], w["figure"], f"ffop-{w['figure']}-{w['slug']}")
        for i, e in enumerate(w.get("editions", []), start=2):
            add(e["sourceFile"], f"{w['title']} — {e['label']}", None, e["lang"], w.get("year", ""),
                w["kind"], f"{e['label']}. {w['intro']}", w["figure"],
                f"ffop-{w['figure']}-{w['slug']}-e{i}")

    if not rows:
        print("Nothing new to plan — every scan is already mapped or already planned.")
        if PLAN_PATH.exists():
            print(f"(An existing plan is still sitting at {PLAN_PATH.relative_to(WEB)}; "
                  f"run `confirm` if you've already uploaded it.)")
        return

    with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    # merge into any earlier, not-yet-confirmed plan rather than clobbering it
    existing_plan = json.loads(PLAN_PATH.read_text()) if PLAN_PATH.exists() else {}
    existing_plan.update(plan)
    PLAN_PATH.write_text(json.dumps(existing_plan, indent=2, ensure_ascii=False) + "\n")

    total_bytes = sum(pathlib.Path(r["file"]).stat().st_size for r in rows)
    print(f"Planned {len(rows)} uploads ({total_bytes / 1024**3:.2f} GB) -> {CSV_PATH.relative_to(WEB)}")
    print(f"Mapping recorded at {PLAN_PATH.relative_to(WEB)} (not live until `confirm`)")
    if skipped_missing_file:
        print(f"\n{len(skipped_missing_file)} catalogued scans not found on disk (skipped):")
        for s in skipped_missing_file:
            print("  ", s)
    if collisions:
        print(f"\n{len(collisions)} planned identifiers already exist on archive.org and were "
              f"skipped — rename the identifier scheme if these are collisions rather than your "
              f"own earlier uploads:")
        for c in collisions:
            print("  ", c)
    print(f"\nNext: pip install internetarchive && ia configure && "
          f"ia upload --spreadsheet={CSV_PATH.relative_to(WEB)}")


def cmd_confirm():
    if not PLAN_PATH.exists():
        sys.exit("No plan to confirm — run `plan` first, then `ia upload`, then `confirm`.")
    plan = json.loads(PLAN_PATH.read_text())
    ia_map = json.loads(IA_MAP_PATH.read_text()) if IA_MAP_PATH.exists() else {}

    confirmed, pending = [], []
    for source_file, entry in plan.items():
        if source_file in ia_map:
            continue
        ok = remote_item_has_file(entry["identifier"], entry["filename"])
        (confirmed if ok else pending).append(source_file)
        if ok:
            ia_map[source_file] = entry
        time.sleep(0.2)  # be polite to the public API

    if confirmed:
        IA_MAP_PATH.write_text(json.dumps(ia_map, indent=2, ensure_ascii=False) + "\n")
        for s in confirmed:
            plan.pop(s, None)
        PLAN_PATH.write_text(json.dumps(plan, indent=2, ensure_ascii=False) + "\n")

    print(f"{len(confirmed)} confirmed live and merged into {IA_MAP_PATH.relative_to(WEB)}")
    if pending:
        print(f"{len(pending)} not yet visible on archive.org (upload still running, or failed):")
        for s in pending:
            print("  ", plan.get(s, {}).get("identifier", "?"), " ", s)
        print("\nRun `ia upload --spreadsheet=scripts/ia-uploads.csv` again — it skips files "
              "that already fully uploaded — then run `confirm` again.")
    if confirmed:
        print("\nNext: python3 scripts/build-works.py   (fills in iaIdentifier for the confirmed ones)")


if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in ("plan", "confirm"):
        sys.exit(f"usage: {sys.argv[0]} plan|confirm")
    (cmd_plan if sys.argv[1] == "plan" else cmd_confirm)()
