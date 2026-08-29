#!/usr/bin/env python3
"""Convert generated artifact PNGs into manifest-sized WebP assets."""

from __future__ import annotations

import argparse
import io
import json
from pathlib import Path

from PIL import Image, ImageOps


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("batch")
    parser.add_argument(
        "--artifacts",
        type=Path,
        default=Path("/opt/cursor/artifacts/assets"),
    )
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--remove-backgrounds", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    manifest_path = args.root / "content/assets-manifest.json"
    manifest = json.loads(manifest_path.read_text())
    assets = [asset for asset in manifest["assets"] if asset["batch"] == args.batch]

    remove = None
    session = None
    if args.remove_backgrounds:
        from rembg import new_session
        from rembg import remove as remove_background

        remove = remove_background
        session = new_session("u2netp")

    for index, asset in enumerate(assets, 1):
        source = args.artifacts / f"{asset['assetId']}.png"
        destination = args.root / asset["generatedPath"]
        destination.parent.mkdir(parents=True, exist_ok=True)

        image = Image.open(source).convert("RGBA")
        if remove is not None and asset["transparentBackground"]:
            image = remove(image, session=session, alpha_matting=False)
            if isinstance(image, bytes):
                image = Image.open(io.BytesIO(image)).convert("RGBA")

        dimensions = asset["targetDimensions"]
        image = ImageOps.fit(
            image,
            (dimensions["width"], dimensions["height"]),
            method=Image.Resampling.LANCZOS,
        )
        image.save(destination, "WEBP", quality=88, method=6)
        print(f"{index:03d}/{len(assets):03d} {asset['assetId']}")


if __name__ == "__main__":
    main()
