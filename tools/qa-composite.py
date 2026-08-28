#!/usr/bin/env python3
"""Composite scenes exactly like SceneRenderer (plate -> props z-asc -> light pass)
so prop scale, lighting, and consistency can be visually QA'd without a browser."""
import json
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
SPRITE_SIZE = 256

LIGHT_PASS = {
    "day": ("#ffedcb", 0.06),
    "dawn": ("#e0a5c0", 0.16),
    "evening": ("#c46a2e", 0.22),
    "lamplit": ("#3a2a14", 0.34),
    "night": ("#101c38", 0.45),
    "night-lantern": ("#131b3d", 0.46),
    "fog-dusk": ("#5a6675", 0.32),
    "storm": ("#28323e", 0.40),
    "night-storm": ("#0d1526", 0.52),
}

def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))

def load_sprite(name):
    p = ROOT / "public" / "assets" / "props" / f"{name}.webp"
    img = Image.open(p).convert("RGBA")
    s = min(SPRITE_SIZE / img.width, SPRITE_SIZE / img.height)
    w, h = round(img.width * s), round(img.height * s)
    img = img.resize((w, h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (SPRITE_SIZE, SPRITE_SIZE), (0, 0, 0, 0))
    canvas.alpha_composite(img, ((SPRITE_SIZE - w) // 2, (SPRITE_SIZE - h) // 2))
    return canvas

def resolve_scene(scene_id):
    sc = json.load(open(ROOT / "content" / "scenes" / f"{scene_id}.json"))
    if "parent" not in sc:
        return sc
    parent = json.load(open(ROOT / "content" / "scenes" / f"{sc['parent']}.json"))
    removed = set(sc.get("removeProps", []))
    moved = {m["id"]: m for m in sc.get("moveProps", [])}
    props = []
    for prop in parent["props"]:
        if prop["id"] in removed:
            continue
        if prop["id"] in moved:
            prop = {**prop, **{k: v for k, v in moved[prop["id"]].items() if k != "id"}}
        props.append(prop)
    props.extend(sc.get("addProps", []))
    return {**parent, **{k: v for k, v in sc.items() if k not in ("addProps", "moveProps", "removeProps", "parent")}, "props": props}

def composite(scene_id, out_path):
    sc = resolve_scene(scene_id)
    w, h = sc["size"]["w"], sc["size"]["h"]
    plate = Image.open(ROOT / "public" / "assets" / "scenes" / f"{scene_id}.webp")
    plate = plate.convert("RGBA").resize((w, h), Image.Resampling.LANCZOS)

    cache = {}
    for prop in sorted(sc.get("props", []), key=lambda p: p["z"]):
        spr = prop["sprite"]
        if spr not in cache:
            cache[spr] = load_sprite(spr)
        img = cache[spr]
        size = round(SPRITE_SIZE * prop["scale"])
        img = img.resize((size, size), Image.Resampling.LANCZOS)
        if prop.get("flipX"):
            img = img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        if prop.get("rotation"):
            img = img.rotate(-prop["rotation"], expand=True, resample=Image.Resampling.BICUBIC)
        plate.alpha_composite(img, (round(prop["x"] - img.width / 2), round(prop["y"] - img.height / 2)))

    color, alpha = LIGHT_PASS[sc["lightState"]]
    tint = Image.new("RGB", (w, h), hex_rgb(color))
    multiplied = ImageChops.multiply(plate.convert("RGB"), tint)
    final = Image.blend(plate.convert("RGB"), multiplied, alpha)
    final.save(out_path)
    print(f"{scene_id}: {len(sc.get('props', []))} props -> {out_path}")

if __name__ == "__main__":
    for sid in sys.argv[1:]:
        composite(sid, f"/tmp/qa-{sid}.png")
