/**
 * Round builder (GDD §19.3, LANG §9): 1 evidence slot + review slots
 * (urgency-ordered due words with a depicting prop in this pool) + fresh
 * slots from the authored template. Deterministic per (seed, roundId).
 */
import type { ConceptId, RoundId } from '../types';
import type { PropPlacement, RoundTemplate } from '../content/schemas';
import { deriveSeed, mulberry32, shuffle } from '../rand';
import { selectReviewConcepts, type WordRecord } from '../vocab/scheduler';

export interface ResolvedTarget {
  targetId: string; // "t00".. stable within the round
  kind: 'vocab' | 'evidence';
  conceptId?: ConceptId;
  clueId?: string;
  propIds: string[]; // one per required find (plural targets carry N)
  count: number; // 1 for singles, N for plural slots
  isReview: boolean;
  isPlural: boolean;
}

export interface RoundPlan {
  roundId: RoundId;
  seed: number;
  targets: ResolvedTarget[];
}

export interface BuildInput {
  template: RoundTemplate;
  sceneProps: PropPlacement[];
  records: ReadonlyMap<ConceptId, WordRecord>;
  saveSeed: number;
  roundIndex: number; // player round counter
  recentTargetConcepts: ReadonlySet<ConceptId>; // previous two rounds (no-stale-repeat)
  now: number;
  /** cold-open review boost: raise share cap to 0.40 for one round (LANG §8.6) */
  reviewBoost?: boolean;
}

/** Props depicting each concept in this scene (excluding evidence-only props). */
export function conceptPropIndex(props: PropPlacement[]): Map<ConceptId, PropPlacement[]> {
  const idx = new Map<ConceptId, PropPlacement[]>();
  for (const p of props) {
    if (p.concept === 'untagged:ambience') continue;
    if (p.clue) continue;
    const list = idx.get(p.concept) ?? [];
    list.push(p);
    idx.set(p.concept, list);
  }
  for (const list of idx.values()) list.sort((a, b) => (a.id < b.id ? -1 : 1));
  return idx;
}

export function buildRound(input: BuildInput): RoundPlan {
  const { template, sceneProps, records, saveSeed, roundIndex } = input;
  const seed = deriveSeed(saveSeed, template.id);
  const rng = mulberry32(seed);
  const propIndex = conceptPropIndex(sceneProps);
  const usedProps = new Set<string>();
  const targets: ResolvedTarget[] = [];
  let tid = 0;
  const nextId = () => `t${String(tid++).padStart(2, '0')}`;

  const takeProp = (concept: ConceptId): string | null => {
    const avail = (propIndex.get(concept) ?? []).filter((p) => !usedProps.has(p.id));
    if (avail.length === 0) return null;
    const p = avail[Math.floor(rng() * avail.length)]!;
    usedProps.add(p.id);
    return p.id;
  };

  // --- evidence sweep mode: every target is a story object ---
  if (template.mode === 'evidence-sweep' && template.sweepClues) {
    for (const clueId of template.sweepClues) {
      const prop = sceneProps.find((p) => p.clue === clueId);
      if (!prop) throw new Error(`sweep clue ${clueId} has no prop in scene for ${template.id}`);
      targets.push({
        targetId: nextId(),
        kind: 'evidence',
        clueId,
        conceptId: prop.concept !== 'untagged:ambience' ? prop.concept : undefined,
        propIds: [prop.id],
        count: 1,
        isReview: true,
        isPlural: false,
      });
    }
    return { roundId: template.id, seed, targets };
  }

  const vocabSlots = template.targetCount - 1; // one slot is evidence
  const share = input.reviewBoost ? Math.min(0.4, template.reviewShare + 0.1) : template.reviewShare;
  const reviewWanted = Math.round(vocabSlots * share);

  // plural slots come from the authored template and consume their concept
  const pluralTargets: ResolvedTarget[] = [];
  const pluralConcepts = new Set<string>();
  for (const slot of template.pluralSlots) {
    const propIds: string[] = [];
    for (let i = 0; i < slot.count; i++) {
      const pid = takeProp(slot.concept);
      if (pid) propIds.push(pid);
    }
    if (propIds.length >= 2) {
      pluralConcepts.add(slot.concept);
      pluralTargets.push({
        targetId: nextId(),
        kind: 'vocab',
        conceptId: slot.concept,
        propIds,
        count: propIds.length,
        isReview: records.get(slot.concept) !== undefined && records.get(slot.concept)!.timesServedAsTarget > 0,
        isPlural: true,
      });
    }
  }

  // review slots
  const poolConcepts = new Set<ConceptId>(
    [...propIndex.keys()].filter((c) => (propIndex.get(c) ?? []).some((p) => !usedProps.has(p.id))),
  );
  const exclude = new Set<ConceptId>([...input.recentTargetConcepts, ...template.freshConcepts, ...pluralConcepts]);
  const reviewIds = selectReviewConcepts(records, poolConcepts, roundIndex, reviewWanted, exclude, input.now);
  const reviewTargets: ResolvedTarget[] = [];
  for (const conceptId of reviewIds) {
    const pid = takeProp(conceptId);
    if (!pid) continue;
    reviewTargets.push({
      targetId: nextId(),
      kind: 'vocab',
      conceptId,
      propIds: [pid],
      count: 1,
      isReview: true,
      isPlural: false,
    });
  }

  // fresh slots fill the remainder from the authored order
  const freshTargets: ResolvedTarget[] = [];
  const freshNeeded = vocabSlots - pluralTargets.length - reviewTargets.length;
  for (const conceptId of template.freshConcepts) {
    if (freshTargets.length >= freshNeeded) break;
    if (pluralConcepts.has(conceptId)) continue;
    const pid = takeProp(conceptId);
    if (!pid) continue;
    freshTargets.push({
      targetId: nextId(),
      kind: 'vocab',
      conceptId,
      propIds: [pid],
      count: 1,
      isReview: false,
      isPlural: false,
    });
  }

  // evidence find
  const evProp = sceneProps.find((p) => p.id === template.evidence.propId);
  if (!evProp) throw new Error(`evidence prop ${template.evidence.propId} missing in scene for ${template.id}`);
  const evidence: ResolvedTarget = {
    targetId: nextId(),
    kind: 'evidence',
    clueId: template.evidence.clueId,
    propIds: [evProp.id],
    count: 1,
    isReview: false,
    isPlural: false,
  };

  // interleave: fresh order preserved, review + plural woven in deterministically
  const vocab = shuffle([...reviewTargets, ...pluralTargets], rng);
  const merged: ResolvedTarget[] = [];
  const freshQ = freshTargets.slice();
  const wovenQ = vocab.slice();
  const total = freshQ.length + wovenQ.length;
  for (let i = 0; i < total; i++) {
    const pickWoven = wovenQ.length > 0 && (freshQ.length === 0 || rng() < wovenQ.length / (freshQ.length + wovenQ.length));
    merged.push(pickWoven ? wovenQ.shift()! : freshQ.shift()!);
  }
  // evidence position: last or second-to-last
  if (template.evidence.position === 'second-to-last' && merged.length >= 1) {
    const lastVocab = merged.pop()!;
    merged.push(evidence, lastVocab);
  } else {
    merged.push(evidence);
  }

  return { roundId: template.id, seed, targets: merged };
}
