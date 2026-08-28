/**
 * The search screen: one canvas (SceneRenderer), pointer gestures
 * (InputController), the word tray, Insight hints, word cards, curiosity
 * slips, evidence close-up, and New-tier intro cards. All round logic lives
 * in app/roundFlow — this component renders and forwards.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { db } from '../../app/content';
import { resolveSceneDef } from '../../engine/content/loader';
import { Camera } from '../../engine/scene/camera';
import { SceneRenderer, type RenderProp } from '../../engine/render/SceneRenderer';
import { InputController } from '../../engine/render/InputController';
import { getSprite, setSpriteUpdateListener } from '../../engine/render/sprites';
import { hitTest, type HitProp } from '../../engine/hit/HitTester';
import { activeTargetPropIds, tickActivity, NUDGE_IDLE_MS } from '../../engine/rounds/runtime';
import { stageGeometry, nudgeGeometry, autoPickTargetId } from '../../engine/hints/insight';
import { flipChip, handleSceneTap, pinPendingClue, spendHint } from '../../app/roundFlow';
import { markRoundDirty } from '../../app/persist';
import { speakConcept, speakText, speechAvailable } from '../../app/speak';
import { useRound } from '../../state/roundStore';
import { useCase } from '../../state/caseStore';
import { useSettings } from '../../state/settingsStore';
import { useUi } from '../../state/uiStore';
import { goBack } from '../../app/flow';
import { ui } from '../strings';
import { WordChip } from '../components/WordChip';
import type { ChipModel } from '../../engine/rounds/present';
import type { PropPlacement } from '../../engine/content/schemas';
import type { Domain } from '../../engine/types';

const DOMAIN_TINT: Record<Domain, string> = {
  household: '#c5a06c',
  'kitchen-food': '#cfa952',
  'clothing-textile': '#b58a96',
  tools: '#9a9a86',
  'art-craft': '#a591c2',
  'stationery-office': '#c2b482',
  maritime: '#7aa0b5',
  'travel-transit': '#b59c68',
  nature: '#86b57e',
  'music-leisure': '#c2957a',
  'instruments-measures': '#a3b3c2',
  'furniture-fixtures': '#ad9168',
};

const AMBIENCE_GLYPHS = ['📦', '🧹', '🪑', '🧺', '🖼️', '🕰️', '📚', '🧴'];

function glyphFor(p: PropPlacement): { glyph: string; tint: string } {
  if (p.clue) {
    const clue = db().clues.get(p.clue);
    return { glyph: clue?.icon ?? '❔', tint: '#e3c87e' };
  }
  if (p.concept === 'untagged:ambience') {
    let h = 0;
    for (let i = 0; i < p.id.length; i++) h = (h * 31 + p.id.charCodeAt(i)) | 0;
    return { glyph: AMBIENCE_GLYPHS[Math.abs(h) % AMBIENCE_GLYPHS.length]!, tint: '#8f8574' };
  }
  const c = db().concepts.get(p.concept);
  return { glyph: c?.icon ?? '❓', tint: c ? DOMAIN_TINT[c.domain] : '#9a9a86' };
}

declare global {
  interface Window {
    __caseSeekTest?: {
      remainingTargets(): { propId: string; x: number; y: number }[];
      roundStatus(): string;
    };
  }
}

export function SearchScreen({ roundId }: { roundId: string }): JSX.Element {
  const rs = useRound();
  const row = useCase((s) => s.row);
  const settings = useSettings();
  const openNotebook = useUi((s) => s.openNotebook);
  const setSettingsOpen = useUi((s) => s.setSettingsOpen);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<SceneRenderer | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [nowTick, setNowTick] = useState(0);

  const template = db().rounds.get(roundId);
  const scene = useMemo(
    () => (rs.sceneId ? resolveSceneDef(db(), rs.sceneId) : null),
    [rs.sceneId],
  );

  const renderProps: RenderProp[] = useMemo(() => {
    if (!scene) return [];
    return scene.props.map((p) => {
      const { glyph, tint } = glyphFor(p);
      return {
        ...p,
        sprite: p.sprite ?? `prop-${p.concept.split(':')[1] ?? p.id}`,
        entry: getSprite({ sprite: p.sprite ?? `prop-${p.id}`, glyph, tint }),
      };
    });
  }, [scene]);

  // ---------- renderer + input lifecycle ----------
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas || !scene) return;

    const camera = new Camera(scene.size.w, scene.size.h);
    cameraRef.current = camera;
    const renderer = new SceneRenderer(canvas, camera, scene, renderProps);
    renderer.reducedMotion = settings.reducedMotion;
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
        const activeIds = activeTargetPropIds(cur.state);
        const foundSet = new Set(cur.state.foundProps);
        const hitProps: HitProp[] = [];
        const taggedIds = new Set<string>();
        for (const p of renderProps) {
          if (foundSet.has(p.id)) continue;
          hitProps.push({
            id: p.id,
            mask: p.entry.mask,
            x: p.x,
            y: p.y,
            scale: p.scale,
            rotation: p.rotation,
            flipX: p.flipX,
            z: p.z,
          });
          if (p.concept !== 'untagged:ambience' && !p.clue) taggedIds.add(p.id);
        }
        hitProps.sort((a, b) => a.z - b.z);
        const hit = hitTest({
          props: hitProps,
          scenePt,
          cameraScale: camera.scale(),
          dilationPx: 10,
          activeTargetIds: activeIds,
          taggedIds,
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

    // e2e/debug hook: verified tappable page coordinates for remaining targets
    window.__caseSeekTest = {
      roundStatus: () => useRound.getState().status,
      remainingTargets: () => {
        const cur = useRound.getState().state;
        if (!cur) return [];
        const activeIds = activeTargetPropIds(cur);
        const foundSet = new Set(cur.foundProps);
        const hitProps: HitProp[] = renderProps
          .filter((p) => !foundSet.has(p.id))
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
        const taggedIds = new Set<string>();
        const rect = canvas.getBoundingClientRect();
        const out: { propId: string; x: number; y: number }[] = [];
        for (const p of renderProps) {
          if (!activeIds.has(p.id) || foundSet.has(p.id)) continue;
          // sample the prop center and a small spiral until the hit test agrees
          const offsets: [number, number][] = [
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
          for (const [dx, dy] of offsets) {
            const scenePt = { x: p.x + dx, y: p.y + dy };
            const hit = hitTest({
              props: hitProps,
              scenePt,
              cameraScale: camera.scale(),
              dilationPx: 10,
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
      input.destroy();
      renderer.stop();
      ro.disconnect();
      setSpriteUpdateListener(null);
      delete window.__caseSeekTest;
    };
    // renderProps/scene identity change together with sceneId; reducedMotion synced separately
  }, [scene, renderProps]);

  // keep renderer found-set + reduced motion in sync
  useEffect(() => {
    const r = rendererRef.current;
    if (!r) return;
    r.reducedMotion = settings.reducedMotion;
    if (rs.state) r.setFound(new Set(rs.state.foundProps));
  }, [rs.state, settings.reducedMotion]);

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
  }, [scene]);

  // word card auto-dismiss
  useEffect(() => {
    if (!rs.wordCard) return;
    const t = window.setTimeout(() => useRound.getState().setAll({ wordCard: null }), 2600);
    return () => window.clearTimeout(t);
  }, [rs.wordCard]);

  const speakChip = useCallback(
    (chip: ChipModel) => {
      if (chip.isEvidence) return;
      if (chip.conceptId) speakConcept(chip.conceptId, { plural: chip.plural });
      else speakText(chip.speech);
    },
    [],
  );

  const onFlip = useCallback((chip: ChipModel) => {
    flipChip(chip.targetId, Date.now());
  }, []);

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
      const stage = after.hintStages[tid] ?? 1;
      const target = after.targets.find((t) => t.targetId === tid);
      const propId = target?.propIds.find((pid) => !after.foundProps.includes(pid));
      const prop = propId ? scene.props.find((p) => p.id === propId) : null;
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      if (prop && renderer && camera) {
        const g = stageGeometry(scene, prop, stage as 1 | 2 | 3);
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
    [scene],
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
  const foundCount = state.targets.filter((t) => state.progress[t.targetId]?.done).length;
  const steady = rs.steadyUntil > nowTick && rs.steadyUntil > Date.now() - 100;
  const clue = rs.pendingClue ? db().clues.get(rs.pendingClue) : null;

  return (
    <main className="screen search-screen" data-testid="search-screen">
      <div className="search-stage" ref={stageRef}>
        <canvas ref={canvasRef} aria-label={`${scene.name} — search scene`} role="img" />
        <div className="search-hud">
          <button type="button" className="iconbtn" aria-label="Back" onClick={goBack}>
            ←
          </button>
          <div className="search-hud__objective">“{template.objective}”</div>
          <div className="insight-meter" aria-label={`${ui('insight')}: ${state.insight} of 3`}>
            <button
              type="button"
              className="insight-meter__lens"
              aria-label="Use a hint"
              data-testid="btn-hint"
              onClick={() => setHintOpen(true)}
              disabled={state.insight <= 0}
              style={{ minWidth: 32, minHeight: 32 }}
            >
              🔍
            </button>
            {[0, 1, 2].map((i) => (
              <span key={i} className={`insight-pip ${i < state.insight ? 'insight-pip--full' : ''}`} />
            ))}
          </div>
          <button type="button" className="iconbtn" aria-label={ui('notebook')} onClick={() => openNotebook()}>
            📓
          </button>
          <button type="button" className="iconbtn" aria-label={ui('settings')} onClick={() => setSettingsOpen(true)}>
            ⚙
          </button>
        </div>

        <div className="zoom-controls">
          <button
            type="button"
            className="iconbtn"
            aria-label={ui('zoomIn')}
            onClick={() => {
              const c = cameraRef.current;
              if (!c) return;
              c.zoomAt({ x: c.viewportW / 2, y: c.viewportH / 2 }, c.zoom * 1.35);
              rendererRef.current?.markDirty();
            }}
          >
            ＋
          </button>
          <button
            type="button"
            className="iconbtn"
            aria-label={ui('zoomOut')}
            onClick={() => {
              const c = cameraRef.current;
              if (!c) return;
              c.zoomAt({ x: c.viewportW / 2, y: c.viewportH / 2 }, c.zoom / 1.35);
              rendererRef.current?.markDirty();
            }}
          >
            －
          </button>
        </div>

        {rs.wordCard && (
          <div
            className="word-card"
            style={{
              left: Math.max(8, Math.min(rs.wordCard.screenX - 110, (stageRef.current?.clientWidth ?? 320) - 240)),
              top: Math.max(8, rs.wordCard.screenY - 110),
            }}
            data-testid="word-card"
          >
            <div className="word-card__word">{rs.wordCard.display}</div>
            <div className="word-card__gloss">{rs.wordCard.chip.gloss}</div>
            {rs.wordCard.chip.caution && <div className="word-card__caution">{rs.wordCard.chip.caution}</div>}
            {rs.wordCard.speech && (
              <button
                type="button"
                className="iconbtn"
                aria-label="Hear it again"
                style={{ marginTop: 6 }}
                onClick={() => {
                  if (rs.wordCard?.chip.conceptId)
                    speakConcept(rs.wordCard.chip.conceptId, { plural: rs.wordCard.chip.plural, slow: true });
                }}
              >
                🔊
              </button>
            )}
          </div>
        )}

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

        {/* New-tier intro cards */}
        {rs.status === 'intro' && rs.introQueue.length > 0 && (
          <IntroCards
            queue={rs.introQueue}
            onDone={() => useRound.getState().setAll({ status: 'searching', introQueue: [] })}
          />
        )}

        {/* evidence close-up */}
        {clue && (
          <div className="search-overlay" role="dialog" aria-label={clue.name}>
            <div className="paper evidence-card" data-testid="evidence-card">
              <div className="evidence-card__icon" aria-hidden="true">
                {clue.icon}
              </div>
              <div className="evidence-card__name">{clue.name}</div>
              {clueCaption(clue) && <div className="margin-note">{clueCaption(clue)}</div>}
              <div className="evidence-card__note margin-note">{clue.note}</div>
              <button type="button" className="btn btn--primary" data-testid="btn-pin-clue" onClick={pinPendingClue}>
                📌 {ui('clue.pin')}
              </button>
            </div>
          </div>
        )}

        {/* hint picker */}
        {hintOpen && (
          <div className="search-overlay" role="dialog" aria-label={ui('hintPick')}>
            <div className="paper hint-picker">
              <h3>{ui('hintPick')}</h3>
              <div className="hint-picker__chips">
                {rs.chips
                  .filter((c) => !state.progress[c.targetId]?.done)
                  .map((c) => (
                    <button
                      key={c.targetId}
                      type="button"
                      className="btn btn--ghost"
                      style={{ color: 'var(--ink)', borderColor: 'var(--paper-edge)' }}
                      onClick={() => applyHint(c.targetId)}
                    >
                      {c.kind === 'silhouette' ? c.icon : c.kind === 'audio' ? '🔊' : c.display}
                      {(state.hintStages[c.targetId] ?? 0) > 0 ? ` (${state.hintStages[c.targetId]}/3)` : ''}
                    </button>
                  ))}
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--ghost" style={{ color: 'var(--ink)' }} onClick={() => setHintOpen(false)}>
                  Never mind
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="tray">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 6px 4px',
            fontSize: '0.82rem',
            color: 'rgba(242,232,212,0.7)',
          }}
        >
          <span data-testid="found-counter">
            {ui('found')} {foundCount}/{state.targets.length}
          </span>
          <span>{scene.name}</span>
        </div>
        <div
          className="tray__chips"
          style={{ flexDirection: settings.leftHandedTray ? 'row-reverse' : 'row' }}
          role="list"
          aria-label="Find list"
        >
          {rs.chips.map((chip) => {
            const pr = state.progress[chip.targetId];
            return (
              <WordChip
                key={chip.targetId}
                chip={chip}
                found={pr?.found ?? 0}
                done={pr?.done ?? false}
                flipped={rs.flippedTargetId === chip.targetId && nowTick - rs.flipAt < 2600}
                onSpeak={speakChip}
                onFlip={onFlip}
              />
            );
          })}
        </div>
      </div>

      {row && <span className="sr-only">{`Language: ${db().packs[row.lang].name}`}</span>}
    </main>
  );
}

function IntroCards({ queue, onDone }: { queue: string[]; onDone(): void }): JSX.Element {
  const [i, setI] = useState(0);
  const row = useCase((s) => s.row);
  const conceptId = queue[i];
  useEffect(() => {
    if (conceptId) speakConcept(conceptId, {});
  }, [conceptId]);
  if (!conceptId || !row) {
    onDone();
    return <></>;
  }
  const concept = db().concepts.get(conceptId);
  const lx = db().lexemes[row.lang].get(conceptId);
  return (
    <div className="search-overlay" role="dialog" aria-label="New words">
      <div className="paper intro-card" data-testid="intro-card">
        <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
          New word {i + 1} of {queue.length}
        </div>
        <div className="intro-card__icon" aria-hidden="true">
          {concept?.icon}
        </div>
        <div className="intro-card__word">
          {lx ? `${lx.article} ${lx.word}` : conceptId}
        </div>
        <div className="intro-card__gloss">{lx?.gloss ?? concept?.gloss}</div>
        {lx?.caution && <div className="word-card__caution">{lx.caution}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            type="button"
            className="iconbtn"
            aria-label="Hear it again, slowly"
            onClick={() => speakConcept(conceptId, { slow: true })}
          >
            🔊
          </button>
          <button
            type="button"
            className="btn btn--primary"
            data-testid="btn-intro-next"
            onClick={() => {
              if (i + 1 >= queue.length) onDone();
              else setI(i + 1);
            }}
          >
            {i + 1 >= queue.length ? 'Start searching' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
