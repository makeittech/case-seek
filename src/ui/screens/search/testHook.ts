/**
 * e2e/debug hook: exposes verified-tappable page coordinates for the round's
 * remaining targets on window.__caseSeekTest, so Playwright drives the real
 * canvas → gesture → hit-test pipeline instead of faking finds.
 */
import { hitTest } from '../../../engine/hit/HitTester';
import { activeTargetPropIds } from '../../../engine/rounds/runtime';
import { useRound } from '../../../state/roundStore';
import type { Camera } from '../../../engine/scene/camera';
import type { RenderProp } from '../../../engine/render/SceneRenderer';
import { HIT_DILATION_PX, taggedPropIds, toHitProps } from './hitProps';

declare global {
  interface Window {
    __caseSeekTest?: {
      remainingTargets(): { propId: string; x: number; y: number }[];
      roundStatus(): string;
    };
  }
}

export function installTestHook(canvas: HTMLCanvasElement, camera: Camera, renderProps: RenderProp[]): () => void {
  window.__caseSeekTest = {
    roundStatus: () => useRound.getState().status,
    remainingTargets: () => {
      const cur = useRound.getState().state;
      if (!cur) return [];
      const activeIds = activeTargetPropIds(cur);
      const foundSet = new Set(cur.foundProps);
      const hitProps = toHitProps(renderProps, foundSet);
      // tagged occluders must block exactly as they do for a real tap — an
      // empty set would make hitTest treat them as see-through ambience and
      // report occluded points as tappable, stalling the driver forever
      const taggedIds = taggedPropIds(renderProps, foundSet);
      const rect = canvas.getBoundingClientRect();
      const out: { propId: string; x: number; y: number }[] = [];
      for (const p of renderProps) {
        if (!activeIds.has(p.id) || foundSet.has(p.id)) continue;
        // Walk the target's own silhouette cells center-out until the full
        // hit-test pipeline confirms a top-most, on-canvas, unobstructed
        // point. A fixed offset spiral misses heavily occluded targets —
        // e.g. a stool whose seat hides under a higher-z compass is only
        // tappable at its legs, exactly like a player would tap it.
        const mask = p.entry.mask;
        const strideX = Math.max(1, Math.floor(mask.w / 28));
        const strideY = Math.max(1, Math.floor(mask.h / 28));
        const cells: { lx: number; ly: number; d2: number }[] = [];
        for (let my = 0; my < mask.h; my += strideY) {
          for (let mx = 0; mx < mask.w; mx += strideX) {
            if (mask.data[my * mask.w + mx] !== 1) continue;
            const lx = ((mx + 0.5) / mask.w) * mask.spriteW;
            const ly = ((my + 0.5) / mask.h) * mask.spriteH;
            const dx = lx - mask.spriteW / 2;
            const dy = ly - mask.spriteH / 2;
            cells.push({ lx, ly, d2: dx * dx + dy * dy });
          }
        }
        cells.sort((a, b) => a.d2 - b.d2);
        for (const cell of cells) {
          // sprite-local → scene (inverse of the hit tester's toLocal)
          let dx = cell.lx - mask.spriteW / 2;
          const dy = cell.ly - mask.spriteH / 2;
          if (p.flipX) dx = -dx;
          const sx = dx * p.scale;
          const sy = dy * p.scale;
          const a = (p.rotation * Math.PI) / 180;
          const scenePt = {
            x: p.x + sx * Math.cos(a) - sy * Math.sin(a),
            y: p.y + sx * Math.sin(a) + sy * Math.cos(a),
          };
          const hit = hitTest({
            props: hitProps,
            scenePt,
            cameraScale: camera.scale(),
            dilationPx: HIT_DILATION_PX,
            activeTargetIds: activeIds,
            taggedIds,
          });
          if (hit.kind !== 'target-hit' || hit.propId !== p.id) continue;
          const screen = camera.sceneToScreen(scenePt);
          if (screen.x < 0 || screen.y < 0 || screen.x > rect.width || screen.y > rect.height) continue;
          const cx = rect.left + screen.x;
          const cy = rect.top + screen.y;
          // only report points where a real click reaches the canvas
          // (not the HUD, zoom controls, or a lingering word card)
          if (document.elementFromPoint(cx, cy) !== canvas) continue;
          out.push({ propId: p.id, x: cx, y: cy });
          break;
        }
      }
      return out;
    },
  };
  return () => {
    delete window.__caseSeekTest;
  };
}
