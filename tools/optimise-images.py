#!/usr/bin/env python3
"""
Re-encodes the site's photographs and brochure covers to the size they are
actually shown at.

The brochure covers were the first page of each PDF at 800x1024 and around
200 KB each — 3.3 MB for sixteen thumbnails that are displayed in a four-column
grid, so about 260 px wide. Even allowing twice that for a high-density screen,
they carried roughly four times the pixels anyone sees.

This matters twice over: the visitor downloads less, and the single-file build
— which inlines every one of these — stops being too heavy to serve.

    python3 tools/optimise-images.py            # report only, writes nothing
    python3 tools/optimise-images.py --apply    # rewrite the files

Run it again after adding images; anything already small enough is skipped.

Re-encoding is lossy and overwrites in place, which is safe here because the
previous versions stay in the repository's history — `git show <commit>:<path>`
brings any of them back — and the brochure covers can be re-rendered from the
PDFs with tools/covers-from-pdf.js.
"""

import argparse
import glob
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Falta Pillow.  pip install pillow")

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")

# max width, JPEG quality. Widths are twice the largest size the layout gives
# each image, which covers high-density screens with nothing to spare.
# The shell is 1140px wide with 40px gutters, so the four-column grids give each
# card about 238px. 560px is well past twice that.
RULES = [
    ("assets/img/brochures/*.jpg", 560, 80),   # brochure covers
    ("assets/img/exhibitors/*.jpg", 560, 82),  # logo tiles, same grid
    ("assets/img/exhibitors/*.png", 560, None),
    ("assets/img/photos/*.jpg", 1600, 80),     # full-bleed, so they stay large
]


def process(path, max_w, quality, apply_changes):
    before = os.path.getsize(path)
    im = Image.open(path)
    width, height = im.size

    resize = width > max_w
    if not resize and quality is None:
        return before, before, ""

    if resize:
        im = im.resize((max_w, round(height * max_w / width)), Image.LANCZOS)

    if not apply_changes:
        # Encode to memory to find out what it would weigh.
        import io
        buf = io.BytesIO()
        if quality is None:
            im.save(buf, "PNG", optimize=True)
        else:
            im.convert("RGB").save(buf, "JPEG", quality=quality,
                                   optimize=True, progressive=True)
        after = buf.tell()
    else:
        if quality is None:
            im.save(path, "PNG", optimize=True)
        else:
            im.convert("RGB").save(path, "JPEG", quality=quality,
                                   optimize=True, progressive=True)
        after = os.path.getsize(path)

    note = f"{width}px → {max_w}px" if resize else "recomprimido"
    return before, after, note


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true",
                    help="reescribe los archivos (sin esto solo informa)")
    args = ap.parse_args()

    total_before = total_after = 0
    touched = 0

    for pattern, max_w, quality in RULES:
        files = sorted(glob.glob(os.path.join(ROOT, pattern)))
        if not files:
            continue
        group_before = group_after = 0
        for path in files:
            before, after, note = process(path, max_w, quality, args.apply)
            # Never make a file bigger: if re-encoding does not help, leave it.
            if after >= before and not args.apply:
                after = before
            group_before += before
            group_after += after
            if note and after < before:
                touched += 1
        print(f"{pattern:35s} {group_before/1024/1024:5.2f} MB → "
              f"{group_after/1024/1024:5.2f} MB   ({len(files)} archivos)")
        total_before += group_before
        total_after += group_after

    saved = total_before - total_after
    print(f"\n{'TOTAL':35s} {total_before/1024/1024:5.2f} MB → "
          f"{total_after/1024/1024:5.2f} MB   "
          f"(-{saved/1024/1024:.2f} MB, {saved/total_before*100:.0f}%)")

    if not args.apply:
        print(f"\n{touched} archivos cambiarían. Nada escrito: "
              f"repite con --apply para aplicarlo.")


if __name__ == "__main__":
    main()
