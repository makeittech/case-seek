/**
 * The search screen, composed: useSceneCanvas owns the canvas/engine glue,
 * subcomponents own each overlay, and this file owns the round-level effects
 * (activity ticker, hint application). Round logic lives in app/roundFlow.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '../../../app/content';
import { resolveSceneDef } from '../../../engine/content/loader';
import { tickActivity, NUDGE_IDLE_MS } from '../../../engine/rounds/runtime';
import { stageGeometry, nudgeGeometry, autoPickTargetId } from '../../../engine/hints/insight';
import { spendHint } from '../../../app/roundFlow';
import { markRoundDirty } from '../../../app/persist';
import { speechAvailable } from '../../../app/speak';
import { useRound } from '../../../state/roundStore';
import { useCase } from '../../../state/caseStore';
import { useSettings } from '../../../state/settingsStore';
import { ui } from '../../strings';
import { useSceneCanvas } from './useSceneCanvas';
import { SearchHud } from './SearchHud';
import { WordCardOverlay } from './WordCardOverlay';
import { HintPicker } from './HintPicker';
import { EvidenceOverlay } from './EvidenceOverlay';
import { IntroCards } from './IntroCards';
import { FindTray } from './FindTray';

export function SearchScreen({ roundId }: { roundId: string }): JSX.Element {
  const rs = useRound();
  const row = useCase((s) => s.row);
  const [hintOpen, setHintOpen] = useState(false);
  const [nowTick, setNowTick] = useState(0);

  const template = db().rounds.get(roundId);
  const scene = useMemo(() => (rs.sceneId ? resolveSceneDef(db(), rs.sceneId) : null), [rs.sceneId]);
  const { stageRef, canvasRef, rendererRef, cameraRef, zoomBy } = useSceneCanvas(scene);

  // activity ticker: insight regen + auto-nudge + UI clock
  useEffect(() => {
    const iv = window.setInterval(() => {
      setNowTick(Date.now());
      const cur = useRound.getState();
      if (!cur.state || cur.status !== 'searching') return;
      const now = Date.now();
      const within = now - cur.state.lastInputAt < 20_000;
      let next = tickActivity(cur.state, now, 1000, within);
      // auto-nudge (Purist off): idle 90 s since last find and last nudge
      if (
        !useSettings.getState().purist &&
        now - next.lastFindAt > NUDGE_IDLE_MS &&
        now - next.lastNudgeAt > NUDGE_IDLE_MS &&
        scene
      ) {
        const tid = autoPickTargetId(next.targets, next.progress);
        const target = tid ? next.targets.find((t) => t.targetId === tid) : null;
        const propId = target?.propIds.find((pid) => !next.foundProps.includes(pid));
        const prop = propId ? scene.props.find((p) => p.id === propId) : null;
        if (prop && rendererRef.current) {
          const g = nudgeGeometry(scene, prop);
          const pnow = performance.now();
          rendererRef.current.fx.nudge = { ...g, start: pnow, until: pnow + 4000 };
          rendererRef.current.markDirty();
        }
        next = { ...next, lastNudgeAt: now };
      }
      if (next !== cur.state) {
        cur.setState(next);
        markRoundDirty();
      }
    }, 1000);
    return () => window.clearInterval(iv);
  }, [scene, rendererRef]);

  const applyHint = useCallback(
    (targetId: string | null) => {
      const cur = useRound.getState();
      if (!cur.state || !scene) return;
      const tid = targetId ?? autoPickTargetId(cur.state.targets, cur.state.progress);
      if (!tid) return;
      if (!spendHint(tid)) {
        setHintOpen(false);
        return;
      }
      const after = useRound.getState().state;
      if (!after) return;
      const stage = after.hintStages[tid];
      const target = after.targets.find((t) => t.targetId === tid);
      const propId = target?.propIds.find((pid) => !after.foundProps.includes(pid));
      const prop = propId ? scene.props.find((p) => p.id === propId) : null;
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      if (stage && prop && renderer && camera) {
        const g = stageGeometry(scene, prop, stage);
        const pnow = performance.now();
        renderer.fx.hint = {
          stage: g.stage,
          x: g.x,
          y: g.y,
          r: g.r,
          start: pnow,
          until: pnow + g.lingerMs,
          memoryUntil: g.memoryMs !== undefined ? pnow + g.lingerMs + g.memoryMs : undefined,
        };
        if (g.stage >= 2) camera.centerOn({ x: prop.x, y: prop.y });
        renderer.markDirty();
      }
      setHintOpen(false);
    },
    [scene, rendererRef, cameraRef],
  );

  if (!scene || !rs.state || !template) {
    return (
      <main className="screen search-screen">
        <div className="screen-inner" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <p>Loading the scene…</p>
        </div>
      </main>
    );
  }

  const state = rs.state;
  const steady = rs.steadyUntil > nowTick && rs.steadyUntil > Date.now() - 100;

  return (
    <main className="screen search-screen" data-testid="search-screen">
      <div className="search-stage" ref={stageRef}>
        <canvas ref={canvasRef} aria-label={`${scene.name} — search scene`} role="img" />
        <SearchHud objective={template.objective} insight={state.insight} onHint={() => setHintOpen(true)} zoomBy={zoomBy} />
        <WordCardOverlay stageRef={stageRef} />

        {rs.curiositySlip && rs.curiositySlip.until > nowTick && (
          <div
            className="curiosity-slip"
            style={{ left: Math.max(4, rs.curiositySlip.x - 40), top: Math.max(4, rs.curiositySlip.y - 44) }}
          >
            {rs.curiositySlip.text}
          </div>
        )}

        {steady && <div className="steady-toast">{ui('steady')}</div>}

        {!speechAvailable() && rs.status === 'searching' && state.foundProps.length === 0 && (
          <div className="speech-warning" style={{ position: 'absolute', bottom: 8, left: 8, right: 64, zIndex: 5 }}>
            {ui('speechOff')}
          </div>
        )}

        {rs.status === 'intro' && rs.introQueue.length > 0 && (
          <IntroCards
            queue={rs.introQueue}
            onDone={() => useRound.getState().setAll({ status: 'searching', introQueue: [] })}
          />
        )}

        <EvidenceOverlay />

        {hintOpen && <HintPicker onPick={applyHint} onClose={() => setHintOpen(false)} />}
      </div>

      <FindTray sceneName={scene.name} nowTick={nowTick} />

      {row && <span className="sr-only">{`Language: ${db().packs[row.lang].name}`}</span>}
    </main>
  );
}
