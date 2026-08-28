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
import { HIT_DILATION_PX, toHitProps } from './hitProps';

declare global {
  interface Window {
    __caseSeekTest?: {
      remainingTargets(): { propId: string; x: number; y: number }[];
      roundStatus(): string;
    };
  }
}

// sample the prop center and a small spiral until the hit test agrees
const SAMPLE_OFFSETS: [number, number][] = [
  [0, 0],
  [12, 0],
  [-12, 0],
  [0, 12],
  [0, 40],
  [0, -40],
  [40, 0],
  [-40, 0],
  [0, 64],
  [0, -64],
  [0, -12],
  [24, 24],
  [-24, -24],
  [24, -24],
  [-24, 24],
];

export function installTestHook(canvas: HTMLCanvasElement, camera: Camera, renderProps: RenderProp[]): () => void {
  window.__caseSeekTest = {
    roundStatus: () => useRound.getState().status,
    remainingTargets: () => {
      const cur = useRound.getState().state;
      if (!cur) return [];
      const activeIds = activeTargetPropIds(cur);
      const foundSet = new Set(cur.foundProps);
      const hitProps = toHitProps(renderProps, foundSet);
      const taggedIds = new Set<string>();
      const rect = canvas.getBoundingClientRect();
      const out: { propId: string; x: number; y: number }[] = [];
      for (const p of renderProps) {
        if (!activeIds.has(p.id) || foundSet.has(p.id)) continue;
        for (const [dx, dy] of SAMPLE_OFFSETS) {
          const scenePt = { x: p.x + dx, y: p.y + dy };
          const hit = hitTest({
            props: hitProps,
            scenePt,
            cameraScale: camera.scale(),
            dilationPx: HIT_DILATION_PX,
            activeTargetIds: activeIds,
            taggedIds,
          });
          if (hit.kind === 'target-hit' && hit.propId === p.id) {
            const screen = camera.sceneToScreen(scenePt);
            if (screen.x >= 0 && screen.y >= 0 && screen.x <= rect.width && screen.y <= rect.height) {
              const cx = rect.left + screen.x;
              const cy = rect.top + screen.y;
              // only report points where a real click reaches the canvas
              // (not the HUD, zoom controls, or a lingering word card)
              if (document.elementFromPoint(cx, cy) !== canvas) continue;
              out.push({ propId: p.id, x: cx, y: cy });
              break;
            }
          }
        }
      }
      return out;
    },
  };
  return () => {
    delete window.__caseSeekTest;
  };
}
