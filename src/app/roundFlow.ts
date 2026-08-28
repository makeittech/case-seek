/**
 * Round orchestration: start/resume rounds, tap outcomes, flips, hints,
 * completion, debrief building. The SearchScreen renders; this module decides.
 */
import { db } from './content';
import { resolveSceneDef } from '../engine/content/loader';
import { buildRound, type ResolvedTarget, type RoundPlan } from '../engine/rounds/buildRound';
import {
  applyFind,
  applyFlip,
  applyHintStage,
  applyMistap,
  computeStamps,
  initRoundState,
  targetForProp,
  type RoundState,
} from '../engine/rounds/runtime';
import { presentRound, introConcepts, type ChipModel } from '../engine/rounds/present';
import { dueUnservable, selectDebriefItems, pickDistractors, type DebriefItem } from '../engine/vocab/scheduler';
import { deriveSeed } from '../engine/rand';
import { conceptPropIndex } from '../engine/rounds/buildRound';
import { useCase, requireCase } from '../state/caseStore';
import { useVocab, wordRecordMap } from '../state/vocabStore';
import { useRound } from '../state/roundStore';
import { useNotebook } from '../state/notebookStore';
import { useUi } from '../state/uiStore';
import { getServices } from '../services';
import { speakConcept, speakText } from './speak';
import { markCaseDirty, markNotebookDirty, markRoundDirty, markWordsDirty } from './persist';
import { advanceFlow } from './flow';
import type { ConceptId, Tier } from '../engine/types';
import type { HitResult } from '../engine/hit/HitTester';

function difficultyOf(conceptId: ConceptId): 'cognate' | 'transparent' | 'opaque' | 'false-friend' {
  const row = useCase.getState().row;
  if (!row) return 'opaque';
  return db().lexemes[row.lang].get(conceptId)?.difficulty ?? 'opaque';
}

export function chipsFor(plan: RoundPlan, tier: Tier, mode: string): ChipModel[] {
  const d = db();
  const row = requireCase();
  return presentRound({
    targets: plan.targets,
    tier,
    mode: mode as 'word-list',
    lexeme: (id) => {
      const lx = d.lexemes[row.lang].get(id);
      if (!lx) throw new Error(`missing lexeme ${row.lang}/${id}`);
      return lx;
    },
    concept: (id) => {
      const c = d.concepts.get(id);
      if (!c) throw new Error(`missing concept ${id}`);
      return c;
    },
    clue: (id) => {
      const c = d.clues.get(id);
      if (!c) throw new Error(`missing clue ${id}`);
      return c;
    },
    seed: plan.seed,
  });
}

export async function startRound(roundId: string): Promise<void> {
  const d = db();
  const row = requireCase();
  const template = d.rounds.get(roundId);
  if (!template) throw new Error(`unknown round ${roundId}`);
  const scene = resolveSceneDef(d, template.sceneId);

  // resume?
  const saved = (await getServices().storage.getRoundState(row.caseId)) as {
    state?: RoundState;
    roundId?: string;
  } | null;
  let state: RoundState;
  let plan: RoundPlan;
  let resumed = false;
  if (saved?.state && saved.roundId === roundId) {
    state = saved.state as RoundState;
    plan = { roundId, seed: state.seed, targets: state.targets };
    resumed = true;
  } else {
    const recent = new Set<ConceptId>(row.recentTargets.flat());
    plan = buildRound({
      template,
      sceneProps: scene.props,
      records: wordRecordMap(),
      saveSeed: row.seed,
      roundIndex: row.roundCounter,
      recentTargetConcepts: recent,
      now: Date.now(),
    });
    state = initRoundState(plan, Date.now());
    // serve bookkeeping
    const served: ConceptId[] = [];
    const diffs: Record<string, 'cognate' | 'transparent' | 'opaque' | 'false-friend'> = {};
    for (const t of plan.targets) {
      if (t.kind === 'vocab' && t.conceptId) {
        served.push(t.conceptId);
        diffs[t.conceptId] = difficultyOf(t.conceptId);
        if (t.isPlural) useVocab.getState().markPluralSeen(t.conceptId);
      }
    }
    useVocab.getState().markServed(served, Date.now(), diffs);
    markWordsDirty();
  }

  const chips = chipsFor(plan, row.tier, template.mode);
  const intro = resumed ? [] : introConcepts(plan.targets, row.tier);
  useRound.getState().setAll({
    roundId,
    sceneId: template.sceneId,
    mode: template.mode,
    plan,
    state,
    chips,
    status: intro.length > 0 ? 'intro' : 'searching',
    introQueue: intro,
    wordCard: null,
    flippedTargetId: null,
    curiositySlip: null,
    hintPickerOpen: false,
    pendingClue: null,
  });
  markRoundDirty();
}

export interface TapFeedback {
  kind: 'found' | 'shimmer' | 'miss' | 'cooldown';
  propId?: string;
  target?: ResolvedTarget;
  targetDone?: boolean;
  roundDone?: boolean;
  isFinalOfPlural?: boolean;
}

export function handleSceneTap(hit: HitResult, screenPt: { x: number; y: number }, now: number): TapFeedback {
  const rs = useRound.getState();
  const state = rs.state;
  if (!state || rs.status !== 'searching') return { kind: 'miss' };
  if (now < state.cooldownUntil) return { kind: 'cooldown' };
  const row = requireCase();
  const d = db();

  if (hit.kind === 'target-hit' && hit.propId) {
    const outcome = applyFind(state, hit.propId, now);
    if (!outcome) return { kind: 'miss' };
    const { target } = outcome;
    useRound.getState().setState(outcome.state);

    if (target.kind === 'vocab' && target.conceptId) {
      const assist = outcome.assist;
      const usedHint = (state.hintStages[target.targetId] ?? 0) > 0;
      if (usedHint) useVocab.getState().markSearchHinted(target.conceptId);
      const event = assist === 'reveal' ? 'revealed-find' : assist === 'flip' ? 'assisted-find' : 'unaided-find';
      // silhouette-mode finds always score unaided (shape→word reveal, LANG §9.3)
      const finalEvent = rs.mode === 'silhouette' ? 'unaided-find' : event;
      useVocab.getState().exposure(target.conceptId, finalEvent, {
        now,
        roundIndex: row.roundCounter,
        roundId: rs.roundId ?? undefined,
        difficulty: difficultyOf(target.conceptId),
      });
      if (rs.mode === 'audio' && finalEvent === 'unaided-find') useVocab.getState().markAudioProven(target.conceptId);
      if (outcome.isFinalOfPlural) useVocab.getState().markPluralFound(target.conceptId);
      markWordsDirty();

      const chip = rs.chips.find((c) => c.targetId === target.targetId);
      if (chip) {
        const usePlural = target.isPlural && outcome.targetDone;
        const lx = d.lexemes[row.lang].get(target.conceptId)!;
        const display = usePlural && lx.plural ? lx.plural : `${lx.article} ${lx.word}`;
        useRound.getState().setAll({
          wordCard: {
            chip,
            display,
            speech: display,
            screenX: screenPt.x,
            screenY: screenPt.y,
            shownAt: now,
          },
        });
        speakConcept(target.conceptId, { plural: usePlural, slow: false });
      }
    } else if (target.kind === 'evidence' && target.clueId) {
      // evidence: pin ritual (close-up overlay) — heartbeat handled by UI
      if (rs.mode === 'evidence-sweep') {
        const clue = d.clues.get(target.clueId);
        if (clue) {
          useNotebook.getState().pinClue(target.clueId);
          markNotebookDirty();
          useRound.getState().setAll({
            wordCard: {
              chip: rs.chips.find((c) => c.targetId === target.targetId)!,
              display: clue.name,
              speech: '',
              screenX: screenPt.x,
              screenY: screenPt.y,
              shownAt: now,
            },
          });
        }
      } else {
        useRound.getState().setAll({ pendingClue: target.clueId });
      }
    }

    getServices().audio.sfx('find');
    markRoundDirty();
    if (outcome.roundDone && rs.mode === 'evidence-sweep') {
      // sweep completes without a pin overlay
      window.setTimeout(() => completeRound(), 900);
    } else if (outcome.roundDone && target.kind !== 'evidence') {
      window.setTimeout(() => completeRound(), 700);
    }
    return {
      kind: 'found',
      propId: hit.propId,
      target,
      targetDone: outcome.targetDone,
      roundDone: outcome.roundDone,
      isFinalOfPlural: outcome.isFinalOfPlural,
    };
  }

  // non-target taps
  const mist = applyMistap(state, now);
  useRound.getState().setState(mist.state);
  if (mist.cooldownTriggered) {
    useRound.getState().setAll({ steadyUntil: now + 800 });
    getServices().audio.sfx('steady');
  }
  markRoundDirty();

  if (hit.kind === 'tagged-non-target' && hit.propId) {
    // curiosity reveal at New/Basics
    if (row.tier === 'new' || row.tier === 'basics') {
      const scene = resolveSceneDef(d, rs.sceneId!);
      const prop = scene.props.find((p) => p.id === hit.propId);
      if (prop && prop.concept !== 'untagged:ambience' && !prop.clue) {
        const lx = d.lexemes[row.lang].get(prop.concept);
        if (lx) {
          useRound.getState().setAll({
            curiositySlip: { text: `${lx.article} ${lx.word}`, x: screenPt.x, y: screenPt.y, until: now + 1500 },
          });
          useVocab.getState().ensure(prop.concept, lx.difficulty, now);
          useVocab.getState().exposure(prop.concept, 'curiosity', { now, roundIndex: row.roundCounter });
          markWordsDirty();
        }
      }
    }
    return { kind: 'shimmer', propId: hit.propId };
  }
  getServices().audio.sfx('miss');
  return { kind: 'miss' };
}

export function flipChip(targetId: string, now: number): void {
  const rs = useRound.getState();
  if (!rs.state) return;
  const target = rs.plan?.targets.find((t) => t.targetId === targetId);
  if (!target || target.kind !== 'vocab' || !target.conceptId) return;
  useRound.getState().setState(applyFlip(rs.state, target.conceptId));
  useRound.getState().setAll({ flippedTargetId: targetId, flipAt: now });
  useVocab.getState().markTranslated(target.conceptId);
  getServices().audio.sfx('flip');
  markWordsDirty();
  markRoundDirty();
}

export function spendHint(targetId: string): boolean {
  const rs = useRound.getState();
  if (!rs.state) return false;
  const next = applyHintStage(rs.state, targetId);
  if (!next) return false;
  useRound.getState().setState(next);
  useRound.getState().setAll({ hintPickerOpen: false });
  getServices().audio.sfx('chime');
  markRoundDirty();
  return true;
}

export function pinPendingClue(): void {
  const rs = useRound.getState();
  if (!rs.pendingClue || !rs.state) return;
  useNotebook.getState().pinClue(rs.pendingClue);
  useUi.getState().setNotebookPeek(true);
  getServices().audio.sfx('pin');
  markNotebookDirty();
  const roundDone = rs.state.targets.every((t) => rs.state!.progress[t.targetId]!.done);
  useRound.getState().setAll({ pendingClue: null });
  if (roundDone) completeRound();
}

export function completeRound(): void {
  const rs = useRound.getState();
  const row = requireCase();
  if (!rs.state || !rs.roundId) return;
  const stamps = computeStamps(rs.state);
  const foundConcepts: ConceptId[] = [];
  let clueId: string | null = null;
  for (const t of rs.state.targets) {
    if (t.kind === 'vocab' && t.conceptId) foundConcepts.push(t.conceptId);
    if (t.kind === 'evidence' && t.clueId && rs.mode !== 'evidence-sweep') clueId = t.clueId;
  }
  const vocabConcepts = rs.state.targets.filter((t) => t.kind === 'vocab' && t.conceptId).map((t) => t.conceptId!);
  const recent = [...row.recentTargets, vocabConcepts].slice(-2);
  useCase.getState().patch({
    roundCounter: row.roundCounter + 1,
    recentTargets: recent,
    pendingDebrief: { roundId: rs.roundId, foundConcepts, stamps, clueId, debriefDone: false },
  });
  useRound.getState().setAll({ status: 'complete' });
  markCaseDirty();
  markRoundDirty(); // clears saved round state (status complete → null)
  useUi.getState().goto({ kind: 'results', roundId: rs.roundId });
}

// ---------- debrief ----------

export interface DebriefItemView {
  item: DebriefItem;
  display: string; // bare noun for article picks, "der Schlüssel" otherwise
  gloss: string;
  glyph?: '▲' | '●' | '■';
  correctIcon: string;
  options: { conceptId?: ConceptId; icon?: string; article?: string; correct: boolean }[];
}

export function buildDebriefItems(roundId: string): DebriefItemView[] {
  const d = db();
  const row = requireCase();
  const pending = row.pendingDebrief;
  if (!pending || pending.roundId !== roundId) return [];
  const template = d.rounds.get(roundId);
  const scene = template ? resolveSceneDef(d, template.sceneId) : null;
  const poolConcepts = scene ? new Set([...conceptPropIndex(scene.props).keys()]) : new Set<ConceptId>();
  const records = wordRecordMap();
  const overflow = dueUnservable(records, poolConcepts, row.roundCounter, Date.now()).slice(0, 2);
  const count = Math.min(5, Math.max(3, Math.round(pending.foundConcepts.length / 3)));
  const items = selectDebriefItems({
    records,
    foundConcepts: pending.foundConcepts,
    missedLastDebrief: row.missedLastDebrief,
    overflow,
    articlePickWeight: d.packs[row.lang].articlePickWeight,
    count,
    seed: deriveSeed(row.seed, `debrief:${roundId}`),
    now: Date.now(),
    tier: row.tier,
  });

  const distractorPool = [...(scene ? conceptPropIndex(scene.props).keys() : pending.foundConcepts)].filter((c) =>
    d.lexemes[row.lang].has(c),
  );

  return items.map((item, i) => {
    const lx = d.lexemes[row.lang].get(item.conceptId)!;
    const concept = d.concepts.get(item.conceptId)!;
    if (item.type === 'article-pick') {
      const sets = d.packs[row.lang].articleOptionSets;
      const set = sets.find((s) => s.includes(lx.article)) ?? sets[0]!;
      return {
        item,
        display: lx.word,
        gloss: lx.gloss ?? concept.gloss,
        glyph: undefined,
        correctIcon: concept.icon,
        options: set.map((a) => ({ article: a, correct: a === lx.article })),
      };
    }
    const distractors = pickDistractors(item.conceptId, distractorPool, 2, deriveSeed(row.seed, `${roundId}:${i}`));
    const opts = [item.conceptId, ...distractors]
      .map((c) => ({
        conceptId: c,
        icon: d.concepts.get(c)?.icon ?? '❓',
        correct: c === item.conceptId,
      }))
      .sort((a, b) => (a.conceptId! < b.conceptId! ? -1 : 1));
    return {
      item,
      display: `${lx.article} ${lx.word}`,
      gloss: lx.gloss ?? concept.gloss,
      glyph: lx.glyph,
      correctIcon: concept.icon,
      options: opts,
    };
  });
}

export function answerDebrief(item: DebriefItem, correct: boolean): void {
  const row = requireCase();
  const now = Date.now();
  const ctx = { now, roundIndex: row.roundCounter, difficulty: difficultyOf(item.conceptId) };
  const vocab = useVocab.getState();
  if (item.type === 'article-pick') {
    vocab.exposure(item.conceptId, correct ? 'article-hit' : 'article-miss', ctx);
  } else {
    vocab.exposure(item.conceptId, correct ? 'debrief-hit' : 'debrief-miss', ctx);
    if (correct && item.type === 'audio-image') vocab.markAudioProven(item.conceptId);
  }
  const missed = row.missedLastDebrief.filter((c) => c !== item.conceptId);
  if (!correct) missed.push(item.conceptId);
  useCase.getState().patch({
    missedLastDebrief: missed.slice(-6),
    bankedInsight: correct ? Math.min(3, row.bankedInsight + 1) : row.bankedInsight,
  });
  getServices().audio.sfx(correct ? 'stamp' : 'page');
  if (!correct) speakConcept(item.conceptId, {});
  markWordsDirty();
  markCaseDirty();
}

export function finishDebrief(): void {
  const row = requireCase();
  if (row.pendingDebrief) {
    useCase.getState().patch({ pendingDebrief: { ...row.pendingDebrief, debriefDone: true } });
    markCaseDirty();
  }
  useRound.getState().reset();
  markRoundDirty();
  advanceFlow();
}

/** Skip forfeits banked charges; exposures were already recorded (GDD §8.4). */
export function skipDebrief(): void {
  const row = requireCase();
  useCase.getState().patch({ bankedInsight: Math.min(3, Math.max(0, row.bankedInsight)) });
  finishDebrief();
}

// ---------- recap ----------

export interface RecapWord {
  conceptId: ConceptId;
  display: string;
  gloss: string;
  icon: string;
  glyph: '▲' | '●' | '■';
}

/** Chapter recap montage: the chapter's 8 lowest-strength found words. */
export function recapWords(): RecapWord[] {
  const d = db();
  const row = requireCase();
  const records = wordRecordMap();
  const now = Date.now();
  const found = [...records.values()].filter((r) => r.timesFound > 0);
  found.sort((a, b) => {
    const sa = a.strength;
    const sb = b.strength;
    return sa - sb || (a.conceptId < b.conceptId ? -1 : 1);
  });
  void now;
  return found
    .slice(0, 8)
    .map((r) => {
      const lx = d.lexemes[row.lang].get(r.conceptId);
      const c = d.concepts.get(r.conceptId);
      if (!lx || !c) return null;
      return {
        conceptId: r.conceptId,
        display: `${lx.article} ${lx.word}`,
        gloss: lx.gloss ?? c.gloss,
        icon: c.icon,
        glyph: lx.glyph,
      };
    })
    .filter((x): x is RecapWord => x !== null);
}
