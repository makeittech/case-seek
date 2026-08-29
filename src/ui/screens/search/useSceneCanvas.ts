/**
 * The canvas side of the search screen: camera, SceneRenderer, InputController,
 * tap → hit-test → roundFlow feedback → renderer FX, plus the e2e test hook.
 * The component that uses this hook only renders DOM.
 */
import { useCallback, useEffect, useMemo, useRef, type RefObject, type MutableRefObject } from 'react';
import { Camera } from '../../../engine/scene/camera';
import { SceneRenderer, type RenderProp } from '../../../engine/render/SceneRenderer';
import { InputController } from '../../../engine/render/InputController';
import { getSprite, pruneSpriteCache, setSpriteUpdateListener } from '../../../engine/render/sprites';
import { hitTest } from '../../../engine/hit/HitTester';
import { activeTargetPropIds } from '../../../engine/rounds/runtime';
import { handleSceneTap } from '../../../app/roundFlow';
import { useRound } from '../../../state/roundStore';
import { useSettings } from '../../../state/settingsStore';
import type { SceneDef } from '../../../engine/content/schemas';
import { spriteIdFor } from '../../../engine/content/loader';
import { glyphFor } from './glyphs';
import { HIT_DILATION_PX, taggedPropIds, toHitProps } from './hitProps';
import { installTestHook } from './testHook';

export interface SceneCanvas {
  stageRef: RefObject<HTMLDivElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  rendererRef: MutableRefObject<SceneRenderer | null>;
  cameraRef: MutableRefObject<Camera | null>;
  /** Zoom around the viewport center (the +/- controls). */
  zoomBy(factor: number): void;
}

export function useSceneCanvas(scene: SceneDef | null): SceneCanvas {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<SceneRenderer | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const roundState = useRound((s) => s.state);
  const reducedMotion = useSettings((s) => s.reducedMotion);

  const renderProps: RenderProp[] = useMemo(() => {
    if (!scene) return [];
    return scene.props.map((p) => {
      const sprite = spriteIdFor(p);
      const { glyph, tint } = glyphFor(p);
      return { ...p, sprite, entry: getSprite({ sprite, glyph, tint }) };
    });
  }, [scene]);

  // ---------- renderer + input lifecycle ----------
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas || !scene) return;

    // bound decoded-sprite memory to the scene being entered
    pruneSpriteCache(new Set(renderProps.map((p) => p.sprite)));

    const camera = new Camera(scene.size.w, scene.size.h);
    cameraRef.current = camera;
    const renderer = new SceneRenderer(canvas, camera, scene, renderProps);
    renderer.reducedMotion = useSettings.getState().reducedMotion;
    rendererRef.current = renderer;

    const resize = (): void => {
      const r = stage.getBoundingClientRect();
      renderer.resize(r.width, r.height, window.devicePixelRatio || 1);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    const st = useRound.getState().state;
    if (st) renderer.setFound(new Set(st.foundProps));

    const input = new InputController(canvas, camera, {
      onTap: (scenePt, screenPt) => {
        const cur = useRound.getState();
        if (!cur.state || cur.status !== 'searching' || cur.wordCard || cur.pendingClue) {
          if (cur.wordCard) cur.setAll({ wordCard: null });
          return;
        }
        const foundSet = new Set(cur.state.foundProps);
        const hit = hitTest({
          props: toHitProps(renderProps, foundSet),
          scenePt,
          cameraScale: camera.scale(),
          dilationPx: HIT_DILATION_PX,
          activeTargetIds: activeTargetPropIds(cur.state),
          taggedIds: taggedPropIds(renderProps, foundSet),
        });
        const fb = handleSceneTap(hit, screenPt, Date.now());
        const now = performance.now();
        if (fb.kind === 'found' && fb.propId) {
          renderer.fx.founds.set(fb.propId, now);
          const next = useRound.getState().state;
          if (next) renderer.setFound(new Set(next.foundProps));
        } else if (fb.kind === 'shimmer' && fb.propId) {
          renderer.fx.shimmer = { propId: fb.propId, start: now, until: now + 900 };
          renderer.markDirty();
        } else if (fb.kind === 'miss') {
          renderer.fx.dustPuff = { x: scenePt.x, y: scenePt.y, start: now };
          renderer.markDirty();
        }
      },
      onCameraChange: () => {
        renderer.markDirty();
        const cur = useRound.getState().state;
        if (cur) useRound.getState().setState({ ...cur, lastInputAt: Date.now() });
      },
    });

    setSpriteUpdateListener(() => renderer.markDirty());
    renderer.start();
    const uninstallHook = installTestHook(canvas, camera, renderProps);

    return () => {
      input.destroy();
      renderer.stop();
      ro.disconnect();
      setSpriteUpdateListener(null);
      uninstallHook();
    };
    // renderProps/scene identity change together with sceneId; reducedMotion synced separately
  }, [scene, renderProps]);

  // keep renderer found-set + reduced motion in sync
  useEffect(() => {
    const r = rendererRef.current;
    if (!r) return;
    r.reducedMotion = reducedMotion;
    if (roundState) r.setFound(new Set(roundState.foundProps));
  }, [roundState, reducedMotion]);

  const zoomBy = useCallback((factor: number) => {
    const c = cameraRef.current;
    if (!c) return;
    c.zoomAt({ x: c.viewportW / 2, y: c.viewportH / 2 }, c.zoom * factor);
    rendererRef.current?.markDirty();
  }, []);

  return { stageRef, canvasRef, rendererRef, cameraRef, zoomBy };
}
