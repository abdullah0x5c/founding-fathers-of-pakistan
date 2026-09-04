# -*- coding: utf-8 -*-
"""One-off (but safe to re-run) cleanup of content/'s folder and file names.

Folders become <figure order>-<figure slug> (matching content/figures.ts exactly);
files become <work slug>.pdf, or <work slug>-e2.pdf / -e3.pdf / … for further
editions of the same work — the same suffix scheme already used for archive.org
identifiers, so a file's name, its catalogue slug and its eventual archive.org
identifier all read the same way.

Run with --apply to actually move files; without it, prints the plan only.
Safe to re-run: a file already at its target path is left alone.
"""
import json, pathlib, re, sys

WEB = pathlib.Path(__file__).resolve().parents[1]
CONTENT_ROOT = WEB.parent / "content"
CATALOG_PATH = WEB / "content" / "works.catalog.json"
FIGURES_TS = WEB / "content" / "figures.ts"


def figure_order():
    text = FIGURES_TS.read_text()
    # figures.ts lists n then slug for each entry, in that order, a few lines apart
    blocks = re.findall(r'n:\s*"(\d+)",\s*\n\s*name:[^\n]*\n\s*nameUrdu:[^\n]*\n.*?slug', text, re.S)
    # simpler and more robust: pull all (n, slug) pairs by scanning sequentially
    tokens = re.findall(r'(?:n|slug):\s*"([^"]+)"', text)
    # tokens alternate slug, n, name... no — figure objects start with slug then n.
    pairs = {}
    slug = None
    for key, val in re.findall(r'(slug|n):\s*"([^"]+)"', text):
        if key == "slug":
            slug = val
        elif key == "n" and slug:
            pairs[slug] = val
            slug = None
    return pairs


def main():
    apply = "--apply" in sys.argv
    order = figure_order()
    catalog = json.loads(CATALOG_PATH.read_text())

    moves = []  # (old_path, new_path)
    seen_new = set()

    def plan(source_file, new_rel):
        old = CONTENT_ROOT / source_file
        new = CONTENT_ROOT / new_rel
        if new_rel in seen_new:
            sys.exit(f"COLLISION: two files would become {new_rel}")
        seen_new.add(new_rel)
        if not old.exists():
            print(f"  ! missing, skipped: {source_file}")
            return
        if old.resolve() == new.resolve():
            return
        moves.append((old, new))

    for w in catalog:
        n = order.get(w["figure"])
        if n is None:
            sys.exit(f"No order number found for figure slug {w['figure']!r}")
        folder = f"{n}-{w['figure']}"
        plan(w["sourceFile"], f"{folder}/{w['slug']}.pdf")
        for i, e in enumerate(w.get("editions", []), start=2):
            plan(e["sourceFile"], f"{folder}/{w['slug']}-e{i}.pdf")

    # Known non-catalogue files: renamed to be self-explanatory, never deleted.
    extras = [
        ("2. Ameer Ali/Islam by Syed Ameer Ali.pdf",
         f"{order['syed-ameer-ali']}-syed-ameer-ali/DUPLICATE-of-ethics-of-islam.pdf"),
        ("6. Shawkat Ali/Readme.txt",
         f"{order['maulana-shaukat-ali']}-maulana-shaukat-ali/notes.txt"),
    ]
    for old_rel, new_rel in extras:
        plan(old_rel, new_rel)

    if not moves:
        print("Nothing to rename — content/ already matches the standard.")
        return

    print(f"{len(moves)} files to rename/move:\n")
    for old, new in moves:
        print(f"  {old.relative_to(CONTENT_ROOT)}\n    -> {new.relative_to(CONTENT_ROOT)}")

    if not apply:
        print("\nDry run only — pass --apply to actually move files.")
        return

    for old, new in moves:
        new.parent.mkdir(parents=True, exist_ok=True)
        old.rename(new)

    # remove now-empty old folders (e.g. the flattened "Religious" subfolder,
    # and every numeral-dot-named folder once its files have moved out)
    for d in sorted(CONTENT_ROOT.glob("*"), reverse=True):
        if d.is_dir():
            for sub in sorted(d.rglob("*"), reverse=True):
                if sub.is_dir() and not any(sub.iterdir()):
                    sub.rmdir()
            if not any(d.iterdir()):
                d.rmdir()

    print(f"\nMoved {len(moves)} files.")


if __name__ == "__main__":
    main()
