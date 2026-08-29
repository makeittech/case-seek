/**
 * Search-hint escalation geometry (Insight). Kept structurally separate from
 * the translation-flip code path (Principle 7 / GDD §9). This module computes
 * WHERE the golden lens effects render; the charge economy lives in the round
 * runtime state.
 */
import type { Vec2 } from '../types';
import type { PropPlacement, SceneDef } from '../content/schemas';
import { SPRITE_SIZE } from '../render/sprites';

export interface HintGeometry {
  stage: 1 | 2 | 3;
  x: number;
  y: number;
  r: number;
  lingerMs: number;
  memoryMs?: number;
}

/** Stage 1: region pulse ≈ quarter of the scene containing the target. */
export function stageGeometry(scene: SceneDef, prop: PropPlacement, stage: 1 | 2 | 3): HintGeometry {
  const { w, h } = scene.size;
  if (stage === 1) {
    const qx = prop.x < w / 2 ? w * 0.25 : w * 0.75;
    const qy = prop.y < h / 2 ? h * 0.25 : h * 0.75;
    return { stage, x: qx, y: qy, r: Math.max(w, h) * 0.32, lingerMs: 5000, memoryMs: 20000 };
  }
  if (stage === 2) {
    return { stage, x: prop.x, y: prop.y, r: w * 0.15, lingerMs: 5000 };
  }
  const size = SPRITE_SIZE * prop.scale;
  return { stage, x: prop.x, y: prop.y, r: Math.max(60, size * 0.75), lingerMs: 3000 };
}

/** Auto-nudge region (weaker than stage 1, unlogged, Purist-gated). */
export function nudgeGeometry(scene: SceneDef, prop: PropPlacement): { x: number; y: number; r: number } {
  const { w, h } = scene.size;
  const qx = prop.x < w / 2 ? w * 0.25 : w * 0.75;
  const qy = prop.y < h / 2 ? h * 0.25 : h * 0.75;
  return { x: qx, y: qy, r: Math.max(w, h) * 0.3 };
}

/** Auto-pick: the target nearest to completion = plural target with most found, else first unfound. */
export function autoPickTargetId(
  targets: { targetId: string; count: number }[],
  progress: Record<string, { found: number; done: boolean }>,
): string | null {
  let best: { id: string; remaining: number } | null = null;
  for (const t of targets) {
    const pr = progress[t.targetId];
    if (!pr || pr.done) continue;
    const remaining = t.count - pr.found;
    if (!best || remaining < best.remaining) best = { id: t.targetId, remaining };
  }
  return best?.id ?? null;
}

/** Is the point (scene coords) currently visible in the camera rect? */
export function offscreenArrow(
  target: Vec2,
  visible: { x: number; y: number; w: number; h: number },
): { dx: number; dy: number } | null {
  const inX = target.x >= visible.x && target.x <= visible.x + visible.w;
  const inY = target.y >= visible.y && target.y <= visible.y + visible.h;
  if (inX && inY) return null;
  const cx = visible.x + visible.w / 2;
  const cy = visible.y + visible.h / 2;
  const len = Math.hypot(target.x - cx, target.y - cy) || 1;
  return { dx: (target.x - cx) / len, dy: (target.y - cy) / len };
}
