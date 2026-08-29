/**
 * The invisible vocabulary scheduler (LANG §8, §13).
 * Pure functions over WordRecords: strength events, spacing stages S0–S5
 * (rounds-elapsed), lazy exponential decay, band/pip projection, review-slot
 * selection, and Debrief item selection. This is the pedagogy — regressions
 * here are release blockers.
 */
import type { ConceptId } from '../types';
import { mulberry32, deriveSeed, shuffle } from '../rand';

export type Difficulty = 'cognate' | 'transparent' | 'opaque' | 'false-friend';

export interface WordRecord {
  conceptId: ConceptId;
  timesSeen: number;
  timesServedAsTarget: number;
  timesFound: number;
  timesFoundUnaided: number;
  timesTranslated: number;
  timesSearchHinted: number;
  stage3Finds: number;
  timesHeard: number;
  timesHeardSlow: number;
  debriefHits: number;
  debriefMisses: number;
  articleHits: number;
  articleMisses: number;
  audioProven: boolean;
  pluralSeen: boolean;
  pluralFound: boolean;
  firstSeenAt: number;
  lastSeenAt: number;
  lastProofAt: number;
  lastPassiveAt: number;
  firstFoundRound: string | null;
  strength: number; // 0..5, decayed lazily on read
  strengthAt: number; // timestamp strength was last written
  spacingStage: 0 | 1 | 2 | 3 | 4 | 5;
  dueAtRound: number; // player round counter
  lapses: number;
  assistStreak: number; // consecutive assisted finds (2 => regress)
}

export type ExposureEvent =
  | 'unaided-find'
  | 'assisted-find'
  | 'revealed-find'
  | 'debrief-hit'
  | 'debrief-miss'
  | 'article-hit'
  | 'article-miss'
  | 'curiosity'
  | 'passive';

const DAY = 24 * 60 * 60 * 1000;

export function newRecord(conceptId: ConceptId, now: number, difficulty: Difficulty = 'opaque'): WordRecord {
  return {
    conceptId,
    timesSeen: 0,
    timesServedAsTarget: 0,
    timesFound: 0,
    timesFoundUnaided: 0,
    timesTranslated: 0,
    timesSearchHinted: 0,
    stage3Finds: 0,
    timesHeard: 0,
    timesHeardSlow: 0,
    debriefHits: 0,
    debriefMisses: 0,
    articleHits: 0,
    articleMisses: 0,
    audioProven: false,
    pluralSeen: false,
    pluralFound: false,
    firstSeenAt: now,
    lastSeenAt: now,
    lastProofAt: 0,
    lastPassiveAt: 0,
    firstFoundRound: null,
    strength: 0,
    strengthAt: now,
    spacingStage: difficulty === 'cognate' ? 1 : 0,
    dueAtRound: 0,
    lapses: 0,
    assistStreak: 0,
  };
}

/** Half-life (ms) by spacing stage — LANG §8.4. */
export function halfLifeMs(stage: number): number {
  if (stage <= 1) return 4 * DAY;
  if (stage <= 3) return 10 * DAY;
  if (stage === 4) return 30 * DAY;
  return 90 * DAY;
}

/** Strength read with lazy exponential decay. Never negative. */
export function decayedStrength(rec: WordRecord, now: number): number {
  const dt = Math.max(0, now - rec.strengthAt);
  if (dt === 0 || rec.strength <= 0) return rec.strength;
  const hl = halfLifeMs(rec.spacingStage);
  return rec.strength * Math.pow(0.5, dt / hl);
}

/** Rounds until due again, per stage — LANG §8.3, with difficulty modifiers. */
export function dueGap(stage: number, difficulty: Difficulty): number {
  const base = [0, 2, 5, 9, 16, Infinity] as const;
  if (difficulty === 'cognate') {
    const cog = [0, 2, 6, Infinity, Infinity, Infinity] as const;
    return cog[Math.min(stage, 5)]!;
  }
  if (difficulty === 'false-friend') {
    const ff = [0, 2, 3, 5, 9, Infinity] as const;
    return ff[Math.min(stage, 5)]!;
  }
  return base[Math.min(stage, 5)]!;
}

const STRENGTH_DELTA: Record<ExposureEvent, number> = {
  'unaided-find': 1.0,
  'assisted-find': 0.3,
  'revealed-find': 0.2,
  'debrief-hit': 0.75,
  'debrief-miss': -0.5,
  'article-hit': 0.75,
  'article-miss': -0.25,
  curiosity: 0.1,
  passive: 0.05,
};

export interface EventCtx {
  now: number;
  roundIndex: number; // player round counter
  roundId?: string;
  difficulty?: Difficulty;
}

/** Apply an exposure event (returns a NEW record — records are immutable value objects). */
export function applyEvent(rec: WordRecord, event: ExposureEvent, ctx: EventCtx): WordRecord {
  const difficulty = ctx.difficulty ?? 'opaque';
  const r: WordRecord = { ...rec };
  // settle decay before writing
  r.strength = decayedStrength(rec, ctx.now);
  r.strengthAt = ctx.now;
  r.lastSeenAt = ctx.now;
  r.timesSeen += 1;

  let delta = STRENGTH_DELTA[event];
  if (event === 'passive') {
    // capped once/day/word
    if (ctx.now - rec.lastPassiveAt < DAY) delta = 0;
    else r.lastPassiveAt = ctx.now;
  }
  r.strength = Math.min(5, Math.max(0, r.strength + delta));

  const advance = () => {
    if (r.spacingStage < 5) r.spacingStage = (r.spacingStage + 1) as WordRecord['spacingStage'];
    const gap = dueGap(r.spacingStage, difficulty);
    r.dueAtRound = gap === Infinity ? Number.MAX_SAFE_INTEGER : ctx.roundIndex + gap;
    if (difficulty === 'cognate' && r.spacingStage >= 3) {
      r.spacingStage = 5;
      r.dueAtRound = Number.MAX_SAFE_INTEGER;
    }
    r.lastProofAt = ctx.now;
    r.assistStreak = 0;
  };
  const regress = (toStage: WordRecord['spacingStage']) => {
    r.spacingStage = toStage;
    r.dueAtRound = ctx.roundIndex + 1; // next eligible round
    r.lapses += 1;
  };

  switch (event) {
    case 'unaided-find':
      r.timesFound += 1;
      r.timesFoundUnaided += 1;
      if (!r.firstFoundRound && ctx.roundId) r.firstFoundRound = ctx.roundId;
      advance();
      break;
    case 'assisted-find':
      r.timesFound += 1;
      if (!r.firstFoundRound && ctx.roundId) r.firstFoundRound = ctx.roundId;
      r.assistStreak += 1;
      if (r.assistStreak >= 2) {
        regress(Math.max(0, r.spacingStage - 1) as WordRecord['spacingStage']);
        r.assistStreak = 0;
      }
      break;
    case 'revealed-find':
      r.timesFound += 1;
      r.stage3Finds += 1;
      if (!r.firstFoundRound && ctx.roundId) r.firstFoundRound = ctx.roundId;
      break;
    case 'debrief-hit':
      r.debriefHits += 1;
      advance();
      break;
    case 'article-hit':
      r.debriefHits += 1;
      r.articleHits += 1;
      advance();
      break;
    case 'debrief-miss':
      r.debriefMisses += 1;
      regress(0);
      break;
    case 'article-miss':
      r.articleMisses += 1;
      break;
    case 'curiosity':
    case 'passive':
      break;
  }
  return r;
}

// ---------- bands & pips ----------

export type Band = 'unserved' | 'new' | 'seen' | 'known';

export function band(rec: WordRecord, now: number): Band {
  if (rec.timesServedAsTarget === 0) return 'unserved';
  const s = decayedStrength(rec, now);
  const proofs = rec.timesFoundUnaided + rec.debriefHits;
  if (s >= 3.5 && proofs >= 2) return 'known';
  if (s >= 1.5) return 'seen';
  return 'new';
}

export function pips(rec: WordRecord, now: number): 0 | 1 | 2 | 3 {
  switch (band(rec, now)) {
    case 'unserved':
      return 0;
    case 'new':
      return 1;
    case 'seen':
      return 2;
    case 'known':
      return 3;
  }
}

// ---------- review selection ----------

export interface ReviewCandidate {
  conceptId: ConceptId;
  urgency: number;
}

/**
 * Fill a round's review slots: due words with a depicting prop in this pool,
 * urgency = (3.5 − strength) × roundsOverdue, excluding recent-round targets.
 * Deterministic (sort with stable tiebreak on conceptId).
 */
export function selectReviewConcepts(
  records: ReadonlyMap<ConceptId, WordRecord>,
  poolConcepts: ReadonlySet<ConceptId>,
  roundIndex: number,
  count: number,
  excludeConcepts: ReadonlySet<ConceptId>,
  now: number,
): ConceptId[] {
  const candidates: ReviewCandidate[] = [];
  for (const rec of records.values()) {
    if (rec.timesServedAsTarget === 0) continue;
    if (!poolConcepts.has(rec.conceptId)) continue;
    if (excludeConcepts.has(rec.conceptId)) continue;
    if (rec.spacingStage >= 5) continue;
    if (rec.dueAtRound > roundIndex) continue;
    const overdue = Math.max(1, roundIndex - rec.dueAtRound + 1);
    const urgency = (3.5 - decayedStrength(rec, now)) * overdue;
    if (urgency <= 0) continue;
    candidates.push({ conceptId: rec.conceptId, urgency });
  }
  candidates.sort((a, b) => b.urgency - a.urgency || (a.conceptId < b.conceptId ? -1 : 1));
  return candidates.slice(0, count).map((c) => c.conceptId);
}

/** Due words with no depicting prop nearby → Debrief candidates (the overflow valve). */
export function dueUnservable(
  records: ReadonlyMap<ConceptId, WordRecord>,
  poolConcepts: ReadonlySet<ConceptId>,
  roundIndex: number,
  now: number,
): ConceptId[] {
  const out: { id: ConceptId; u: number }[] = [];
  for (const rec of records.values()) {
    if (rec.timesServedAsTarget === 0) continue;
    if (poolConcepts.has(rec.conceptId)) continue;
    if (rec.spacingStage >= 5 || rec.dueAtRound > roundIndex) continue;
    out.push({ id: rec.conceptId, u: (3.5 - decayedStrength(rec, now)) * Math.max(1, roundIndex - rec.dueAtRound + 1) });
  }
  out.sort((a, b) => b.u - a.u || (a.id < b.id ? -1 : 1));
  return out.map((o) => o.id);
}

// ---------- debrief selection ----------

export type DebriefItemType = 'word-image' | 'article-pick' | 'audio-image';

export interface DebriefItem {
  conceptId: ConceptId;
  type: DebriefItemType;
}

export interface DebriefSelectInput {
  records: ReadonlyMap<ConceptId, WordRecord>;
  foundConcepts: ConceptId[]; // this round's found vocabulary
  missedLastDebrief: ConceptId[];
  overflow: ConceptId[]; // due-but-unservable
  articlePickWeight: number; // per language pack (de .4, es .2, it .3)
  count: number; // 3..5
  seed: number;
  now: number;
  tier: 'new' | 'basics' | 'conversational' | 'advanced';
  /** concepts eligible for article picks must have a real article (all do) */
}

/** Priority: missed-last → overflow → weakest found → trap articles. Item type = weakest channel. */
export function selectDebriefItems(input: DebriefSelectInput): DebriefItem[] {
  const rng = mulberry32(deriveSeed(input.seed, 'debrief'));
  const chosen: ConceptId[] = [];
  const seen = new Set<ConceptId>();
  const push = (id: ConceptId) => {
    if (!seen.has(id) && chosen.length < input.count) {
      chosen.push(id);
      seen.add(id);
    }
  };
  for (const id of input.missedLastDebrief) push(id);
  for (const id of input.overflow) push(id);
  const foundSorted = input.foundConcepts
    .slice()
    .sort((a, b) => {
      const ra = input.records.get(a);
      const rb = input.records.get(b);
      const sa = ra ? decayedStrength(ra, input.now) : 0;
      const sb = rb ? decayedStrength(rb, input.now) : 0;
      return sa - sb || (a < b ? -1 : 1);
    });
  for (const id of foundSorted) push(id);

  return chosen.map((conceptId) => {
    const rec = input.records.get(conceptId);
    let type: DebriefItemType = 'word-image';
    if (rec) {
      if (rec.articleMisses > rec.articleHits) type = 'article-pick';
      else if (!rec.audioProven && input.tier !== 'new' && rec.timesHeard > 0) type = 'audio-image';
      else if (rec.timesTranslated > rec.timesFoundUnaided) type = 'word-image';
      else if (rng() < input.articlePickWeight) type = 'article-pick';
      else type = rng() < 0.5 && input.tier !== 'new' ? 'audio-image' : 'word-image';
    }
    if (input.tier === 'new' && type === 'audio-image') type = 'word-image';
    return { conceptId, type };
  });
}

/** Pick distractor concepts for a debrief thumbnail row (same domain preferred). */
export function pickDistractors(
  correct: ConceptId,
  pool: ConceptId[],
  n: number,
  seed: number,
): ConceptId[] {
  const rng = mulberry32(deriveSeed(seed, `distract:${correct}`));
  const others = pool.filter((c) => c !== correct);
  return shuffle(others, rng).slice(0, n);
}
