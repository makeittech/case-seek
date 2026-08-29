#!/usr/bin/env python3
"""FABLE asset audit: manifest <-> disk <-> content integration + visual QA heuristics.

Checks per manifest entry:
  - file exists at generatedPath (missing)
  - file decodes as an image (broken)
  - placeholder heuristics: tiny file, tiny dimensions, near-solid color (low stddev)
  - alpha contract: transparentBackground entries must carry an alpha channel with
    real transparency; opaque entries must not be mostly transparent
  - dimension sanity vs targetDimensions (aspect within tolerance)

Cross-checks:
  - orphan files on disk not in manifest
  - duplicate generatedPath entries
  - every sprite referenced by content/scenes/*.json resolves to a real prop file
  - every scene id in content/scenes has a plate in public/assets/scenes
"""
import json
import os
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "content" / "assets-manifest.json"

def load_manifest():
    with open(MANIFEST) as f:
        return json.load(f)

def audit():
    m = load_manifest()
    assets = m["assets"]
    problems = {"missing": [], "broken": [], "placeholder": [], "alpha": [], "dims": [], "status": []}

    seen_paths = {}
    for a in assets:
        aid = a["assetId"]
        rel = a.get("generatedPath") or ""
        if rel in seen_paths:
            problems["status"].append((aid, f"duplicate generatedPath with {seen_paths[rel]}: {rel}"))
        seen_paths[rel] = aid

        p = ROOT / rel
        if not rel or not p.is_file():
            problems["missing"].append((aid, rel or "<no generatedPath>"))
            continue

        size = p.stat().st_size
        try:
            img = Image.open(p)
            img.load()
        except Exception as e:
            problems["broken"].append((aid, f"{rel}: {e}"))
            continue

        w, h = img.size
        # placeholder heuristics
        if size < 2048:
            problems["placeholder"].append((aid, f"{rel}: file only {size}B"))
        if w < 32 or h < 32:
            problems["placeholder"].append((aid, f"{rel}: dims {w}x{h}"))
        rgb = img.convert("RGB")
        small = rgb.resize((min(w, 64), min(h, 64)))
        px = list(small.getdata())
        n = len(px)
        means = [sum(c[i] for c in px) / n for i in range(3)]
        var = sum(sum((c[i] - means[i]) ** 2 for i in range(3)) for c in px) / (n * 3)
        std = var ** 0.5
        if std < 4.0:
            problems["placeholder"].append((aid, f"{rel}: near-solid color (std={std:.2f})"))

        # alpha contract
        wants_alpha = bool(a.get("transparentBackground"))
        has_alpha = img.mode in ("RGBA", "LA", "PA") or (img.mode == "P" and "transparency" in img.info)
        if wants_alpha:
            if not has_alpha:
                problems["alpha"].append((aid, f"{rel}: transparentBackground=true but no alpha channel"))
            else:
                alpha = img.convert("RGBA").getchannel("A")
                lo, hi = alpha.getextrema()
                if lo == 255:
                    problems["alpha"].append((aid, f"{rel}: alpha channel fully opaque"))
                elif hi == 0:
                    problems["alpha"].append((aid, f"{rel}: alpha channel fully transparent"))
        else:
            if has_alpha:
                alpha = img.convert("RGBA").getchannel("A")
                hist = alpha.histogram()
                transparent_frac = sum(hist[:16]) / (w * h)
                if transparent_frac > 0.5:
                    problems["alpha"].append((aid, f"{rel}: opaque asset but {transparent_frac:.0%} transparent"))

        # dimension sanity: aspect ratio within 25% of target
        td = a.get("targetDimensions") or {}
        tw, th = td.get("width"), td.get("height")
        if tw and th:
            target_ar = tw / th
            actual_ar = w / h
            if abs(actual_ar - target_ar) / target_ar > 0.25:
                problems["dims"].append((aid, f"{rel}: {w}x{h} vs target {tw}x{th} (aspect off)"))

        if a.get("status") != "generated":
            problems["status"].append((aid, f"status={a.get('status')}"))

    # orphans
    manifest_paths = {a.get("generatedPath") for a in assets}
    orphans = []
    for p in sorted((ROOT / "public" / "assets").rglob("*")):
        if p.is_file():
            rel = str(p.relative_to(ROOT))
            if rel not in manifest_paths:
                orphans.append(rel)

    # scene content integration
    integration = []
    prop_dir = ROOT / "public" / "assets" / "props"
    scene_dir = ROOT / "public" / "assets" / "scenes"
    for sf in sorted((ROOT / "content" / "scenes").glob("*.json")):
        sc = json.load(open(sf))
        sid = sc["id"]
        plate = sc.get("plate") or f"public/assets/scenes/{sid}.webp"
        plate = plate.lstrip("/")
        if plate.startswith("assets/"):
            plate = "public/" + plate
        if not (ROOT / plate).is_file():
            integration.append(f"{sf.name}: missing plate {plate}")
        for prop in sc.get("props", []):
            spr = prop.get("sprite")
            if spr and not (prop_dir / f"{spr}.webp").is_file():
                integration.append(f"{sf.name}: prop {prop['id']} sprite {spr} missing")

    return problems, orphans, integration

if __name__ == "__main__":
    problems, orphans, integration = audit()
    total_issues = 0
    for k, v in problems.items():
        print(f"== {k}: {len(v)}")
        for aid, msg in v[:50]:
            print(f"   {aid}: {msg}")
        if len(v) > 50:
            print(f"   ... and {len(v) - 50} more")
        total_issues += len(v)
    print(f"== orphans: {len(orphans)}")
    for o in orphans[:20]:
        print(f"   {o}")
    print(f"== scene integration issues: {len(integration)}")
    for i in integration[:50]:
        print(f"   {i}")
    total_issues += len(orphans) + len(integration)
    print(f"\nTOTAL ISSUES: {total_issues}")
    sys.exit(0 if total_issues == 0 else 1)
