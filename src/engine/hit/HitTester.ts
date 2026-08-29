/**
 * Alpha-silhouette hit testing with screen-space zoom-invariant dilation,
 * z-order occlusion honesty, and the 12 px coat-tail rule (targets only).
 * GDD §7.1 / UX §7.1 / ARCH §5.3.
 */
import type { Vec2 } from '../types';
import { maskAt, type MaskData } from './mask';

export interface HitProp {
  id: string;
  mask: MaskData;
  x: number; // anchor = sprite center, scene px
  y: number;
  scale: number;
  rotation: number; // degrees
  flipX: boolean;
  z: number;
}

export type HitClass = 'target-hit' | 'tagged-non-target' | 'ambience' | 'miss';

export interface HitResult {
  kind: HitClass;
  propId?: string;
  coatTail?: boolean;
}

export interface HitOptions {
  /** props sorted by z ASCENDING (draw order); found props excluded by caller */
  props: HitProp[];
  scenePt: Vec2;
  /** camera scale (screen px per scene px) — makes dilation zoom-invariant */
  cameraScale: number;
  /** +10 touch / +6 pointer, screen px */
  dilationPx: number;
  /** prop ids that are currently active (unfound) targets */
  activeTargetIds: ReadonlySet<string>;
  /** prop ids tagged with a real concept (non-ambience) */
  taggedIds: ReadonlySet<string>;
  coatTailPx?: number; // default 12 screen px
}

/** Is the scene point inside the prop's silhouette, dilated by `dilateScene` scene px? */
export function propHit(prop: HitProp, scenePt: Vec2, dilateScene: number): boolean {
  const local = toLocal(prop, scenePt);
  const dilateLocal = dilateScene / prop.scale;
  if (maskAt(prop.mask, local.x, local.y)) return true;
  if (dilateLocal <= 0) return false;
  // sample a disc: two rings of 8 points
  for (const f of [1, 0.5]) {
    const r = dilateLocal * f;
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      if (maskAt(prop.mask, local.x + Math.cos(a) * r, local.y + Math.sin(a) * r)) return true;
    }
  }
  return false;
}

function toLocal(prop: HitProp, scenePt: Vec2): Vec2 {
  let dx = scenePt.x - prop.x;
  let dy = scenePt.y - prop.y;
  if (prop.rotation !== 0) {
    const a = (-prop.rotation * Math.PI) / 180;
    const rx = dx * Math.cos(a) - dy * Math.sin(a);
    const ry = dx * Math.sin(a) + dy * Math.cos(a);
    dx = rx;
    dy = ry;
  }
  dx /= prop.scale;
  dy /= prop.scale;
  if (prop.flipX) dx = -dx;
  return { x: dx + prop.mask.spriteW / 2, y: dy + prop.mask.spriteH / 2 };
}

/**
 * Approximate distance (scene px) from a point to the prop's silhouette,
 * searched up to maxDist; returns Infinity when nothing within range.
 */
export function distanceToSilhouette(prop: HitProp, scenePt: Vec2, maxDist: number): number {
  if (propHit(prop, scenePt, 0)) return 0;
  const steps = 6;
  for (let i = 1; i <= steps; i++) {
    const d = (maxDist * i) / steps;
    const local = toLocal(prop, scenePt);
    const r = d / prop.scale;
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      if (maskAt(prop.mask, local.x + Math.cos(a) * r, local.y + Math.sin(a) * r)) return d;
    }
  }
  return Infinity;
}

export function hitTest(opts: HitOptions): HitResult {
  const { props, scenePt, cameraScale, dilationPx, activeTargetIds, taggedIds } = opts;
  const dilateScene = dilationPx / cameraScale;
  // z-descending: topmost mask hit wins (occlusion honesty) — except untagged
  // ambience dressing, which is transparent to real objects beneath it so a
  // decoration can never make a target unfindable.
  let ambience: HitResult | null = null;
  for (let i = props.length - 1; i >= 0; i--) {
    const prop = props[i]!;
    // dilation only helps targets feel generous; occluders are hit at true silhouette
    const dil = activeTargetIds.has(prop.id) ? dilateScene : 0;
    if (propHit(prop, scenePt, dil)) {
      if (activeTargetIds.has(prop.id)) return { kind: 'target-hit', propId: prop.id };
      if (taggedIds.has(prop.id)) return { kind: 'tagged-non-target', propId: prop.id };
      ambience ??= { kind: 'ambience', propId: prop.id };
    }
  }
  // coat-tail: nearest active target silhouette within 12 screen px
  const coatScene = (opts.coatTailPx ?? 12) / cameraScale;
  let best: { prop: HitProp; d: number } | null = null;
  for (const prop of props) {
    if (!activeTargetIds.has(prop.id)) continue;
    const d = distanceToSilhouette(prop, scenePt, coatScene);
    if (d === Infinity) continue;
    if (!best || d < best.d - 1e-6 || (Math.abs(d - best.d) <= 1e-6 && prop.z > best.prop.z)) {
      best = { prop, d };
    }
  }
  if (best) return { kind: 'target-hit', propId: best.prop.id, coatTail: true };
  if (ambience) return ambience;
  return { kind: 'miss' };
}
