/**
 * Alpha masks for hit testing. Masks are stored at half sprite resolution,
 * one byte per cell (0 = transparent, 1 = solid). In the shipping pipeline
 * masks come precomputed from the asset build; for generated stand-in sprites
 * they are extracted from the drawn canvas at load time.
 */

export interface MaskData {
  /** mask grid width/height (half of sprite pixel size) */
  w: number;
  h: number;
  /** sprite pixel size the mask maps onto */
  spriteW: number;
  spriteH: number;
  data: Uint8Array;
}

export function maskFromAlpha(
  alpha: Uint8ClampedArray | Uint8Array,
  spriteW: number,
  spriteH: number,
  threshold = 8,
): MaskData {
  const w = Math.max(1, spriteW >> 1);
  const h = Math.max(1, spriteH >> 1);
  const data = new Uint8Array(w * h);
  for (let my = 0; my < h; my++) {
    for (let mx = 0; mx < w; mx++) {
      // sample the 2x2 block; solid if any pixel passes the threshold
      let solid = 0;
      for (let dy = 0; dy < 2 && !solid; dy++) {
        for (let dx = 0; dx < 2 && !solid; dx++) {
          const px = Math.min(spriteW - 1, mx * 2 + dx);
          const py = Math.min(spriteH - 1, my * 2 + dy);
          if (alpha[py * spriteW + px]! > threshold) solid = 1;
        }
      }
      data[my * w + mx] = solid;
    }
  }
  return { w, h, spriteW, spriteH, data };
}

/** Build a mask from ImageData (RGBA). */
export function maskFromImageData(img: { data: Uint8ClampedArray; width: number; height: number }): MaskData {
  const alpha = new Uint8Array(img.width * img.height);
  for (let i = 0; i < alpha.length; i++) alpha[i] = img.data[i * 4 + 3]!;
  return maskFromAlpha(alpha, img.width, img.height);
}

/** Sample the mask at sprite-local pixel coords. */
export function maskAt(mask: MaskData, localX: number, localY: number): boolean {
  const mx = Math.floor((localX / mask.spriteW) * mask.w);
  const my = Math.floor((localY / mask.spriteH) * mask.h);
  if (mx < 0 || my < 0 || mx >= mask.w || my >= mask.h) return false;
  return mask.data[my * mask.w + mx] === 1;
}

/** Synthetic rectangular mask (tests + fallback). */
export function rectMask(spriteW: number, spriteH: number, solid: import('../types').Rect | null = null): MaskData {
  const w = Math.max(1, spriteW >> 1);
  const h = Math.max(1, spriteH >> 1);
  const data = new Uint8Array(w * h);
  const r = solid ?? { x: 0, y: 0, w: spriteW, h: spriteH };
  for (let my = 0; my < h; my++) {
    for (let mx = 0; mx < w; mx++) {
      const px = mx * 2;
      const py = my * 2;
      if (px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h) data[my * w + mx] = 1;
    }
  }
  return { w, h, spriteW, spriteH, data };
}

/** Synthetic circular mask (tests). */
export function circleMask(spriteW: number, spriteH: number, cx: number, cy: number, radius: number): MaskData {
  const w = Math.max(1, spriteW >> 1);
  const h = Math.max(1, spriteH >> 1);
  const data = new Uint8Array(w * h);
  for (let my = 0; my < h; my++) {
    for (let mx = 0; mx < w; mx++) {
      const px = mx * 2 + 1;
      const py = my * 2 + 1;
      const d2 = (px - cx) * (px - cx) + (py - cy) * (py - cy);
      if (d2 <= radius * radius) data[my * w + mx] = 1;
    }
  }
  return { w, h, spriteW, spriteH, data };
}
