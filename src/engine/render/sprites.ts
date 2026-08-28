/**
 * Sprite store. Shipping art is webp under /assets/props/<sprite>.webp
 * (asset-manifest contract). Until those images land on disk, sprites are
 * generated stand-ins: a soft paper-tone plaque + a large glyph, drawn to an
 * offscreen canvas. Both paths produce the same {canvas, mask} record, so
 * swapping in real art changes nothing downstream.
 */
import { maskFromImageData, type MaskData } from '../hit/mask';

export const SPRITE_SIZE = 256;

export interface SpriteEntry {
  id: string;
  canvas: HTMLCanvasElement;
  mask: MaskData;
  ready: boolean; // true once final art (or fallback) is committed
}

interface SpriteRequest {
  sprite: string;
  glyph: string; // stand-in glyph (emoji)
  tint: string; // domain tint for the plaque
  shape?: 'round' | 'tall' | 'wide' | 'square';
}

const cache = new Map<string, SpriteEntry>();
let onUpdate: (() => void) | null = null;

export function setSpriteUpdateListener(cb: (() => void) | null): void {
  onUpdate = cb;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return h >>> 0;
}

function drawFallback(req: SpriteRequest): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = SPRITE_SIZE;
  c.height = SPRITE_SIZE;
  const ctx = c.getContext('2d')!;
  const h = hashCode(req.sprite);
  const shape = req.shape ?? (['round', 'tall', 'wide', 'square'] as const)[h % 4]!;
  const cx = SPRITE_SIZE / 2;
  const cy = SPRITE_SIZE / 2;

  // plaque silhouette (guarantees a consistent hit shape even without emoji fonts)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((((h >> 4) % 13) - 6) * 0.012);
  ctx.fillStyle = req.tint;
  ctx.strokeStyle = 'rgba(40,30,18,0.55)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  if (shape === 'round') {
    ctx.ellipse(0, 0, 104, 96, 0, 0, Math.PI * 2);
  } else if (shape === 'tall') {
    roundRect(ctx, -74, -112, 148, 224, 30);
  } else if (shape === 'wide') {
    roundRect(ctx, -112, -74, 224, 148, 30);
  } else {
    roundRect(ctx, -96, -96, 192, 192, 34);
  }
  ctx.fill();
  ctx.stroke();
  // paper grain highlight
  const grad = ctx.createLinearGradient(0, -110, 0, 110);
  grad.addColorStop(0, 'rgba(255,255,255,0.22)');
  grad.addColorStop(1, 'rgba(0,0,0,0.10)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  if (shape === 'round') ctx.ellipse(0, 0, 104, 96, 0, 0, Math.PI * 2);
  else if (shape === 'tall') roundRect(ctx, -74, -112, 148, 224, 30);
  else if (shape === 'wide') roundRect(ctx, -112, -74, 224, 148, 30);
  else roundRect(ctx, -96, -96, 192, 192, 34);
  ctx.fill();
  ctx.restore();

  // glyph
  ctx.font = `150px "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#2c2317';
  ctx.fillText(req.glyph, cx, cy + 8);
  return c;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function extractMask(canvas: HTMLCanvasElement): MaskData {
  const ctx = canvas.getContext('2d')!;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return maskFromImageData(img);
}

/** Get (or lazily create) a sprite. Attempts the real /assets webp, falls back to a generated stand-in. */
export function getSprite(req: SpriteRequest): SpriteEntry {
  const existing = cache.get(req.sprite);
  if (existing) return existing;

  const canvas = drawFallback(req);
  const entry: SpriteEntry = { id: req.sprite, canvas, mask: extractMask(canvas), ready: true };
  cache.set(req.sprite, entry);

  // Async upgrade to shipped art when present (assets-manifest path contract).
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = SPRITE_SIZE;
    c.height = SPRITE_SIZE;
    const ctx = c.getContext('2d')!;
    const s = Math.min(SPRITE_SIZE / img.width, SPRITE_SIZE / img.height);
    const w = img.width * s;
    const hh = img.height * s;
    ctx.drawImage(img, (SPRITE_SIZE - w) / 2, (SPRITE_SIZE - hh) / 2, w, hh);
    entry.canvas = c;
    entry.mask = extractMask(c);
    onUpdate?.();
  };
  img.onerror = () => {}; // generated stand-in remains
  img.src = `/assets/props/${req.sprite}.webp`;

  return entry;
}

export function clearSpriteCache(): void {
  cache.clear();
}

/**
 * Evict sprites the active scene doesn't use. Each entry pins a decoded
 * 256×256 RGBA canvas (~262 KB) plus its hit mask, so without eviction a
 * full-campaign session accumulates every visited scene's sprite set
 * (tens of MB per scene). Evicted sprites reload on demand — the compressed
 * webp stays in the service-worker art cache.
 */
export function pruneSpriteCache(keep: ReadonlySet<string>): void {
  for (const id of cache.keys()) {
    if (!keep.has(id)) cache.delete(id);
  }
}
