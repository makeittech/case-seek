/** RenderProp → HitTester input mapping, shared by the tap path and e2e hook. */
import type { RenderProp } from '../../../engine/render/SceneRenderer';
import type { HitProp } from '../../../engine/hit/HitTester';

/** Screen-space mask dilation (ARCH: zoom-invariant forgiveness radius). */
export const HIT_DILATION_PX = 10;

/** Hit-test candidates (z-ascending), excluding already-found props. */
export function toHitProps(renderProps: readonly RenderProp[], exclude: ReadonlySet<string>): HitProp[] {
  return renderProps
    .filter((p) => !exclude.has(p.id))
    .map((p) => ({
      id: p.id,
      mask: p.entry.mask,
      x: p.x,
      y: p.y,
      scale: p.scale,
      rotation: p.rotation,
      flipX: p.flipX,
      z: p.z,
    }))
    .sort((a, b) => a.z - b.z);
}

/** Ids of unfound props that carry a real concept (not ambience, not clues). */
export function taggedPropIds(renderProps: readonly RenderProp[], exclude: ReadonlySet<string>): Set<string> {
  const out = new Set<string>();
  for (const p of renderProps) {
    if (exclude.has(p.id)) continue;
    if (p.concept !== 'untagged:ambience' && !p.clue) out.add(p.id);
  }
  return out;
}
