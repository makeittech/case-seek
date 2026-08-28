/**
 * Content validator CLI. Loads every JSON under /content from disk, runs the
 * same Zod schemas as the runtime loader, then cross-checks references and
 * design rules. Exits non-zero on any failure — wired into `npm run build`.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildContentDB, resolveSceneDef } from '../src/engine/content/loader';
import { conceptPropIndex } from '../src/engine/rounds/buildRound';
import type { Lang } from '../src/engine/types';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');

function collect(dir: string, acc: Record<string, unknown>): void {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) collect(p, acc);
    else if (name.endsWith('.json')) {
      acc[`/${relative(ROOT, p).replace(/\\/g, '/')}`] = JSON.parse(readFileSync(p, 'utf8'));
    }
  }
}

const errors: string[] = [];
const warnings: string[] = [];
const err = (msg: string) => errors.push(msg);
const warn = (msg: string) => warnings.push(msg);

const raw: Record<string, unknown> = {};
collect(CONTENT, raw);

let db: ReturnType<typeof buildContentDB>;
try {
  db = buildContentDB(raw);
} catch (e) {
  console.error(String(e instanceof Error ? e.message : e));
  process.exit(1);
}

const LANGS: Lang[] = ['de', 'es', 'it'];

// ---- lexeme coverage: every concept must exist in all three packs ----
for (const id of db.concepts.keys()) {
  for (const lang of LANGS) {
    if (!db.lexemes[lang].has(id)) err(`concept ${id} missing ${lang} lexeme`);
  }
}
for (const lang of LANGS) {
  for (const lx of db.packs[lang].lexemes) {
    if (!db.concepts.has(lx.concept)) err(`${lang} lexeme references unknown concept ${lx.concept}`);
    const sets = db.packs[lang].articleOptionSets;
    if (!sets.some((s) => s.includes(lx.article))) {
      err(`${lang}/${lx.concept}: article "${lx.article}" not in any articleOptionSet`);
    }
  }
}

// ---- scenes: prop concepts + clue refs ----
for (const scene of db.scenes.values()) {
  const ids = new Set<string>();
  for (const p of scene.props) {
    if (ids.has(p.id)) err(`scene ${scene.id}: duplicate prop id ${p.id}`);
    ids.add(p.id);
    if (p.concept !== 'untagged:ambience' && !db.concepts.has(p.concept)) {
      err(`scene ${scene.id}: prop ${p.id} references unknown concept ${p.concept}`);
    }
    if (p.clue && !db.clues.has(p.clue)) err(`scene ${scene.id}: prop ${p.id} references unknown clue ${p.clue}`);
    if (p.x < 0 || p.x > scene.size.w || p.y < 0 || p.y > scene.size.h) {
      err(`scene ${scene.id}: prop ${p.id} out of bounds (${p.x},${p.y})`);
    }
  }
}
for (const v of db.variants.values()) {
  if (!db.scenes.has(v.parent)) err(`variant ${v.id}: unknown parent ${v.parent}`);
  try {
    resolveSceneDef(db, v.id);
  } catch (e) {
    err(`variant ${v.id}: ${String(e instanceof Error ? e.message : e)}`);
  }
}

// ---- rounds ----
for (const round of db.rounds.values()) {
  let scene;
  try {
    scene = resolveSceneDef(db, round.sceneId);
  } catch {
    err(`round ${round.id}: unknown scene ${round.sceneId}`);
    continue;
  }
  const index = conceptPropIndex(scene.props);
  for (const c of round.freshConcepts) {
    if (!db.concepts.has(c)) err(`round ${round.id}: unknown fresh concept ${c}`);
    else if (!index.has(c)) err(`round ${round.id}: fresh concept ${c} has no prop in ${round.sceneId}`);
  }
  for (const slot of round.pluralSlots) {
    if (!db.concepts.has(slot.concept)) err(`round ${round.id}: unknown plural concept ${slot.concept}`);
    const props = index.get(slot.concept) ?? [];
    if (props.length < slot.count) {
      err(`round ${round.id}: plural ${slot.concept} needs ${slot.count} props, scene has ${props.length}`);
    }
    for (const lang of LANGS) {
      if (!db.lexemes[lang].get(slot.concept)?.plural) {
        err(`round ${round.id}: plural ${slot.concept} missing ${lang} plural form`);
      }
    }
  }
  if (round.mode === 'evidence-sweep') {
    if (!round.sweepClues?.length) err(`round ${round.id}: evidence-sweep without sweepClues`);
    for (const clueId of round.sweepClues ?? []) {
      if (!db.clues.has(clueId)) err(`round ${round.id}: sweep clue ${clueId} unknown`);
      if (!scene.props.some((p) => p.clue === clueId)) {
        err(`round ${round.id}: sweep clue ${clueId} has no prop in ${round.sceneId}`);
      }
    }
  } else {
    const ev = scene.props.find((p) => p.id === round.evidence.propId);
    if (!ev) err(`round ${round.id}: evidence prop ${round.evidence.propId} missing in ${round.sceneId}`);
    else if (ev.clue !== round.evidence.clueId) {
      err(`round ${round.id}: evidence prop clue ${ev.clue} != ${round.evidence.clueId}`);
    }
    if (!db.clues.has(round.evidence.clueId)) err(`round ${round.id}: unknown clue ${round.evidence.clueId}`);
    // capacity: fresh + plurals + evidence must be able to fill the target count
    const pluralCount = round.pluralSlots.length;
    const fillable = round.freshConcepts.filter((c) => index.has(c)).length;
    if (1 + pluralCount + fillable < round.targetCount) {
      warn(`round ${round.id}: only ${1 + pluralCount + fillable} fillable targets of ${round.targetCount} without review pool`);
    }
  }
  if (round.objective.length > 48) warn(`round ${round.id}: objective breadcrumb over 48 chars`);
}

// ---- season flow ----
db.season.flow.forEach((node, i) => {
  if (node.type === 'beat' && !db.beats.has(node.id)) err(`flow[${i}]: unknown beat ${node.id}`);
  if (node.type === 'round' && !db.rounds.has(node.id)) err(`flow[${i}]: unknown round ${node.id}`);
  if (node.type === 'puzzle' && !db.puzzles.has(node.id)) err(`flow[${i}]: unknown puzzle ${node.id}`);
  if (node.type === 'board-review' && !db.boardReviews.has(node.id)) err(`flow[${i}]: unknown board review ${node.id}`);
});
const flowRounds = new Set(db.season.flow.filter((n) => n.type === 'round').map((n) => (n as { id: string }).id));
for (const id of db.rounds.keys()) {
  if (!flowRounds.has(id)) warn(`round ${id} never appears in season flow`);
}

// ---- beats ----
const castIds = new Set([...db.castById.keys(), 'narration', 'letter']);
for (const beat of db.beats.values()) {
  if (beat.caseLine.split(/\s+/).length > 14) warn(`beat ${beat.id}: caseLine over 14 words`);
  for (const line of beat.lines) {
    if (!castIds.has(line.speaker)) err(`beat ${beat.id}: unknown speaker ${line.speaker}`);
    if (line.garnish) {
      for (const lang of LANGS) {
        if (!db.packs[lang].tokens.some((t) => t.key === line.garnish!.key)) {
          err(`beat ${beat.id}: garnish token ${line.garnish.key} missing in ${lang} pack`);
        }
      }
    }
    if (line.echo && !line.en.includes('{echo}') && !line.garnish) {
      // echo lines without a slot just get the weakest-noun token attached; fine
    }
  }
  for (const pf of beat.peopleFacts) {
    if (!db.castById.has(pf.characterId)) err(`beat ${beat.id}: unknown character ${pf.characterId}`);
  }
}

// ---- board reviews ----
for (const br of db.boardReviews.values()) {
  for (const pin of br.pins) if (!db.clues.has(pin)) err(`board review ${br.id}: unknown pin ${pin}`);
  if (!br.pins.includes(br.pair[0]) || !br.pins.includes(br.pair[1])) {
    err(`board review ${br.id}: pair not contained in pins`);
  }
}

// ---- puzzles ----
for (const p of db.puzzles.values()) {
  if (p.clueId && !db.clues.has(p.clueId)) err(`puzzle ${p.id}: unknown clue ${p.clueId}`);
  const concepts = (p.params as { concepts?: string[] }).concepts;
  for (const c of concepts ?? []) {
    if (!db.concepts.has(c)) err(`puzzle ${p.id}: unknown concept ${c}`);
  }
}

// ---- finale / epilogue ----
if (!db.finale.suspects.some((s) => s.id === db.finale.culprit)) err('finale: culprit not among suspects');
for (const ex of db.finale.exhibits) if (!db.clues.has(ex)) err(`finale: unknown exhibit ${ex}`);
for (const line of [...db.finale.confrontation, ...db.finale.resolution]) {
  if (!castIds.has(line.speaker)) err(`finale: unknown speaker ${line.speaker}`);
}
if (db.epilogue.panels.length < 4) err('epilogue: fewer than 4 panels');

// ---- report ----
for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length > 0) {
  for (const e of errors) console.error(`✖ ${e}`);
  console.error(`\nContent validation FAILED: ${errors.length} error(s), ${warnings.length} warning(s).`);
  process.exit(1);
}
console.log(
  `Content OK: ${db.concepts.size} concepts, ${db.packs.de.lexemes.length}/${db.packs.es.lexemes.length}/${db.packs.it.lexemes.length} lexemes, ` +
    `${db.scenes.size} scenes + ${db.variants.size} variants, ${db.rounds.size} rounds, ${db.beats.size} beats, ` +
    `${db.puzzles.size} puzzles, ${db.clues.size} clues, ${db.boardReviews.size} board reviews. ${warnings.length} warning(s).`,
);
