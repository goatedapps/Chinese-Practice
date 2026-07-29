"""Slices the owl sprite sheet (6 stage columns x 4 mood rows) into 24
individual PNGs named owl-{stage}-{mood}.png.

Usage:
  python slice_owl_sprites.py --preview   # crop a few sample cells only, for visual verification
  python slice_owl_sprites.py             # crop and save all 24 cells
"""
import argparse
from pathlib import Path
from PIL import Image

SRC = Path(r"C:\Users\Yiwen\Downloads\owl-images.png")
OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "owl"
PREVIEW_DIR = Path(__file__).resolve().parent / "preview"

STAGES = ["egg", "baby", "toddler", "young", "teenager", "adult"]   # left -> right
MOODS = ["sad", "neutral", "happy", "very_happy"]                    # top -> bottom

# Grid content area (excludes the header stage-name row and left mood-name
# column) -- starting estimates, verify with --preview before trusting.
GRID_LEFT = 122
GRID_TOP = 75
GRID_RIGHT = 1516
GRID_BOTTOM = 1014
INSET = 6  # trims a few px off each cell edge to avoid neighboring-cell bleed


def cell_box(col_idx, row_idx):
    cell_w = (GRID_RIGHT - GRID_LEFT) / len(STAGES)
    cell_h = (GRID_BOTTOM - GRID_TOP) / len(MOODS)
    left = GRID_LEFT + col_idx * cell_w + INSET
    top = GRID_TOP + row_idx * cell_h + INSET
    right = left + cell_w - 2 * INSET
    bottom = top + cell_h - 2 * INSET
    return (left, top, right, bottom)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--preview", action="store_true", help="only crop a handful of sample cells")
    args = parser.parse_args()

    im = Image.open(SRC).convert("RGB")

    if args.preview:
        PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
        samples = [(0, 0), (3, 1), (5, 3), (0, 3), (5, 0)]
        for col_idx, row_idx in samples:
            stage, mood = STAGES[col_idx], MOODS[row_idx]
            crop = im.crop(cell_box(col_idx, row_idx))
            out_path = PREVIEW_DIR / f"owl-{stage}-{mood}.png"
            crop.save(out_path, optimize=True)
            print(f"wrote {out_path} ({crop.size[0]}x{crop.size[1]})")
        return

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for row_idx, mood in enumerate(MOODS):
        for col_idx, stage in enumerate(STAGES):
            crop = im.crop(cell_box(col_idx, row_idx))
            out_path = OUT_DIR / f"owl-{stage}-{mood}.png"
            crop.save(out_path, optimize=True)
            print(f"wrote {out_path} ({crop.size[0]}x{crop.size[1]})")


if __name__ == "__main__":
    main()
