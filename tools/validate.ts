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

function buildOrDie(): ReturnType<typeof buildContentDB> {
  try {
    return buildContentDB(raw);
  } catch (e) {
    console.error(String(e instanceof Error ? e.message : e));
    process.exit(1);
  }
}
const db = buildOrDie();

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

// ---- language QA (LANGUAGE_DESIGN rules) ----
const startsVowel = (w: string): boolean => /^[aeiouàèéìòù]/i.test(w);
const itMascSpecial = (w: string): boolean => /^(s[bcdfghjklmnpqrstvwxz]|z|gn|ps|x|y)/i.test(w);
const ART: Record<Lang, string[]> = {
  de: ['der', 'die', 'das'],
  es: ['el', 'la', 'los', 'las'],
  it: ['il', 'lo', 'la', "l'", 'i', 'gli', 'le'],
};
for (const lang of LANGS) {
  const seenForms = new Map<string, string>();
  for (const lx of db.packs[lang].lexemes) {
    const where = `${lang}/${lx.concept}`;
    // articles must belong to the language
    if (!ART[lang].includes(lx.article)) err(`${where}: "${lx.article}" is not a ${lang} article`);
    // gender glyph vs article agreement (▲ m / ● f / ■ n)
    if (lang === 'de') {
      const want = lx.glyph === '▲' ? 'der' : lx.glyph === '●' ? 'die' : 'das';
      if (lx.article !== want) err(`${where}: der/die/das mismatch (glyph ${lx.glyph}, article ${lx.article})`);
      if (lx.plural && !lx.plural.startsWith('die ')) err(`${where}: German plural must take "die"`);
    }
    if (lang === 'es') {
      if (lx.glyph === '▲' && !['el', 'los'].includes(lx.article)) err(`${where}: masculine needs el/los`);
      if (lx.glyph === '●' && lx.article === 'el' && !lx.trapFlags.includes('el-agua-class')) {
        err(`${where}: feminine with "el" must be flagged el-agua-class`);
      }
      if (lx.plural && !/^l[oa]s /.test(lx.plural)) err(`${where}: Spanish plural must take los/las`);
    }
    if (lang === 'it') {
      const w = lx.word;
      if (lx.article === "l'" && !startsVowel(w)) err(`${where}: l' before consonant "${w}"`);
      if (lx.article === 'lo' && !itMascSpecial(w)) err(`${where}: "lo" needs s+cons/z/gn/ps "${w}"`);
      if (lx.article === 'il' && (startsVowel(w) || itMascSpecial(w))) err(`${where}: "il ${w}" is not phonological`);
      if (lx.article === 'la' && startsVowel(w)) err(`${where}: "la ${w}" must elide to l'`);
      if (lx.plural) {
        const [pArt = '', pWord = ''] = lx.plural.split(' ');
        if (lx.glyph === '●' && pArt !== 'le') err(`${where}: feminine plural needs "le"`);
        if (lx.glyph === '▲' && pArt !== (startsVowel(pWord) || itMascSpecial(pWord) ? 'gli' : 'i')) {
          err(`${where}: plural article "${pArt}" wrong for "${pWord}"`);
        }
      }
    }
    // description phrase: required, ≤6 words, never contains the target word
    if (!lx.phrase) err(`${where}: missing description phrase`);
    else {
      if (lx.phrase.trim().split(/\s+/).length > 6) err(`${where}: phrase over 6 words "${lx.phrase}"`);
      const stem = lx.word.toLowerCase().split(' ')[0]!;
      if (stem.length > 3 && lx.phrase.toLowerCase().includes(stem)) {
        err(`${where}: phrase leaks the target word "${lx.phrase}"`);
      }
    }
    // trap register consistency
    if (lx.trapFlags.length > 0 && !lx.caution) err(`${where}: trapFlags without caution note`);
    // audio rounds need distinct forms: article+word must be unique per pack
    const form = `${lx.article} ${lx.word}`.toLowerCase();
    const prev = seenForms.get(form);
    if (prev) err(`${where}: duplicate form "${form}" (also ${prev})`);
    seenForms.set(form, lx.concept);
  }
  // token bank: L2 ≤5 words (idioms), L1 short markers
  for (const tok of db.packs[lang].tokens) {
    const wc = tok.text.trim().split(/\s+/).length;
    if (tok.level === 'L2' && wc > 5) err(`${lang} token ${tok.key}: L2 over 5 words "${tok.text}"`);
    if (tok.level === 'L1' && wc > 3) warn(`${lang} token ${tok.key}: L1 over 3 words "${tok.text}"`);
  }
}
// token banks must share one key set across languages
{
  const keySet = (lang: Lang): string => db.packs[lang].tokens.map((t) => t.key).sort().join(',');
  if (keySet('de') !== keySet('es') || keySet('de') !== keySet('it')) {
    err('token bank keys differ between language packs');
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
    else if (!db.concepts.get(slot.concept)!.multiFindOk) {
      err(`round ${round.id}: plural slot ${slot.concept} lacks multiFindOk`);
    }
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
function lintLine(where: string, line: { en: string; garnish?: { level: string; key: string } | undefined }): void {
  // only known placeholders may appear in line text
  for (const m of line.en.matchAll(/\{([a-z]+)\}/g)) {
    if (m[1] !== 'echo' && m[1] !== 'gran') err(`${where}: unknown placeholder {${m[1]}}`);
  }
  if (!line.garnish) return;
  for (const lang of LANGS) {
    const tok = db.packs[lang].tokens.find((t) => t.key === line.garnish!.key);
    if (!tok) err(`${where}: garnish token ${line.garnish.key} missing in ${lang} pack`);
    else if (tok.level !== line.garnish.level) {
      err(`${where}: garnish ${line.garnish.key} declared ${line.garnish.level}, bank says ${tok.level}`);
    }
  }
}
for (const beat of db.beats.values()) {
  if (beat.caseLine.split(/\s+/).length > 14) warn(`beat ${beat.id}: caseLine over 14 words`);
  for (const line of beat.lines) {
    if (!castIds.has(line.speaker)) err(`beat ${beat.id}: unknown speaker ${line.speaker}`);
    lintLine(`beat ${beat.id}`, line);
  }
  for (const pf of beat.peopleFacts) {
    if (!db.castById.has(pf.characterId)) err(`beat ${beat.id}: unknown character ${pf.characterId}`);
  }
}

// ---- clues: study-language captions resolve in every pack ----
for (const clue of db.clues.values()) {
  if (clue.captionKey) {
    for (const lang of LANGS) {
      if (!db.packs[lang].tokens.some((t) => t.key === clue.captionKey)) {
        err(`clue ${clue.id}: captionKey ${clue.captionKey} missing in ${lang} pack`);
      }
    }
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
  lintLine('finale', line);
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
