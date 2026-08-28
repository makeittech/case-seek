#!/usr/bin/env python3
"""Regenerate tools/prop-masks.json — downsampled alpha-silhouette masks for
every prop sprite, consumed by tools/validate.ts to enforce the Fairness
Charter occlusion cap (ARCH §11: "occlusion estimate ≤ 60% (mask overlap of
higher-z placements)").

Mirrors the runtime sprite pipeline (src/engine/render/sprites.ts): each webp
is contain-fitted into a 256×256 canvas, and a grid cell is solid when any
pixel in its block has alpha > 8. Stored at 64×64 (4×4-px cells) — coarse but
plenty for occlusion percentages.

Run after adding or re-rendering prop art:  python3 tools/gen-prop-masks.py
"""
import base64
import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PROPS = ROOT / "public" / "assets" / "props"
OUT = ROOT / "tools" / "prop-masks.json"

SPRITE = 256
GRID = 64
CELL = SPRITE // GRID
ALPHA_THRESHOLD = 8


def mask_bits(path: Path) -> bytes:
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    s = min(SPRITE / w, SPRITE / h)
    nw, nh = max(1, round(w * s)), max(1, round(h * s))
    fit = Image.new("RGBA", (SPRITE, SPRITE), (0, 0, 0, 0))
    fit.paste(img.resize((nw, nh)), ((SPRITE - nw) // 2, (SPRITE - nh) // 2))
    alpha = fit.getchannel("A").load()
    bits = bytearray(GRID * GRID // 8)
    for gy in range(GRID):
        for gx in range(GRID):
            solid = False
            for py in range(gy * CELL, (gy + 1) * CELL):
                for px in range(gx * CELL, (gx + 1) * CELL):
                    if alpha[px, py] > ALPHA_THRESHOLD:
                        solid = True
                        break
                if solid:
                    break
            if solid:
                i = gy * GRID + gx
                bits[i >> 3] |= 1 << (i & 7)
    return bytes(bits)


def main() -> None:
    masks = {}
    files = sorted(PROPS.glob("*.webp"))
    for i, f in enumerate(files, 1):
        sprite_id = f.stem
        digest = hashlib.sha1(f.read_bytes()).hexdigest()[:12]
        masks[sprite_id] = {
            "hash": digest,
            "bits": base64.b64encode(mask_bits(f)).decode("ascii"),
        }
        print(f"[{i}/{len(files)}] {sprite_id}")
    OUT.write_text(
        json.dumps({"sprite": SPRITE, "grid": GRID, "masks": masks}, indent=1) + "\n"
    )
    print(f"wrote {OUT.relative_to(ROOT)} ({len(masks)} sprites)")


if __name__ == "__main__":
    main()
