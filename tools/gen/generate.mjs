/**
 * Content generator: emits content/vocabulary/concepts.json,
 * content/languages/{de,es,it}/pack.json and content/scenes/*.json
 * from the authoring tables. Deterministic (seeded) prop layout.
 * Run: node tools/gen/generate.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROWS, CAUTIONS, LANG_META, TOKENS } from './vocab-data.mjs';
import { SCENES, VARIANTS, SCENE_SIZE } from './scene-data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = (rel, data) => {
  const p = join(ROOT, 'content', rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(data, null, 1) + '\n');
  console.log('wrote', rel);
};

// ---------- deterministic rng ----------
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

// ---------- vocabulary ----------
const DIFF = { c: 'cognate', t: 'transparent', o: 'opaque', f: 'false-friend' };
const startsVowel = (w) => /^[aeiouàèéìòù]/i.test(w);
const itMascSpecial = (w) => /^(s[bcdfghjklmnpqrstvwxz]|z|gn|ps|x|y)/i.test(w);

function article(lang, gender, word, override) {
  if (override) return override;
  if (lang === 'de') return gender === 'm' ? 'der' : gender === 'f' ? 'die' : 'das';
  if (lang === 'es') return gender === 'm' ? 'el' : 'la';
  if (startsVowel(word)) return "l'";
  if (gender === 'm') return itMascSpecial(word) ? 'lo' : 'il';
  return 'la';
}
function pluralArticle(lang, gender, plural) {
  if (lang === 'de') return 'die';
  if (lang === 'es') return gender === 'm' ? 'los' : 'las';
  if (gender === 'f') return 'le';
  return startsVowel(plural) || itMascSpecial(plural) ? 'gli' : 'i';
}
const joinArt = (art, word) => (art.endsWith("'") ? art + word : `${art} ${word}`);

const concepts = [];
const packs = { de: [], es: [], it: [] };
for (const [id, gloss, domain, freq, icon, de, es, it] of ROWS) {
  const conceptId = `object:${id}`;
  concepts.push({ id: conceptId, gloss, domain, tags: [], freq, icon, multiFindOk: false });
  for (const [lang, tuple] of [['de', de], ['es', es], ['it', it]]) {
    const [gender, word, plural = '', diff = 'o', phrase = '', artOverride = ''] = tuple;
    const art = article(lang, gender, word, artOverride);
    const lex = {
      concept: conceptId,
      article: art,
      word,
      glyph: gender === 'm' ? '▲' : gender === 'f' ? '●' : '■',
      difficulty: DIFF[diff] ?? 'opaque',
      trapFlags: [],
    };
    if (plural) {
      lex.plural = joinArt(pluralArticle(lang, gender, plural), plural);
    }
    if (phrase) lex.phrase = phrase;
    const caution = CAUTIONS[`${id}:${lang}`];
    if (caution) {
      lex.caution = caution;
      lex.trapFlags = ['trap'];
    }
    packs[lang].push(lex);
  }
}
out('vocabulary/concepts.json', concepts);
for (const lang of ['de', 'es', 'it']) {
  const meta = LANG_META[lang];
  out(`languages/${lang}/pack.json`, {
    lang,
    name: meta.name,
    nameEn: meta.nameEn,
    locale: meta.locale,
    greeting: meta.greeting,
    slowRate: meta.slowRate,
    articles: meta.articles,
    articleOptionSets: meta.articleOptionSets,
    articlePickWeight: meta.articlePickWeight,
    lexemes: packs[lang],
    tokens: TOKENS.map(([key, level, text, glossTok]) => ({ key, level, text: text[lang], gloss: glossTok })),
    vendorCalls: meta.vendorCalls,
    signage: meta.signage,
  });
}

// ---------- scenes ----------
const { w: W, h: H } = SCENE_SIZE;
const BANDS = [
  { name: 'bg', y0: 0.36, y1: 0.55, s0: 0.5, s1: 0.66 },
  { name: 'mg', y0: 0.52, y1: 0.74, s0: 0.66, s1: 0.86 },
  { name: 'fg', y0: 0.7, y1: 0.92, s0: 0.86, s1: 1.08 },
];

function layoutScene(scene) {
  const rng = mulberry32(hash(scene.id));
  const entries = [];
  for (const [cid, count] of scene.concepts) {
    for (let i = 0; i < count; i++) entries.push({ kind: 'concept', cid, n: i + 1 });
  }
  for (let i = 0; i < scene.ambience; i++) entries.push({ kind: 'amb', n: i + 1 });
  // deterministic shuffle for band variety
  for (let i = entries.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [entries[i], entries[j]] = [entries[j], entries[i]];
  }
  const cols = Math.ceil(Math.sqrt(entries.length * (W / H)));
  const rows = Math.ceil(entries.length / cols);
  const marginX = 110;
  const props = [];
  entries.forEach((e, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const band = BANDS[Math.min(2, Math.floor((row / Math.max(1, rows)) * 3))];
    const cellW = (W - marginX * 2) / cols;
    const x = Math.round(marginX + cellW * (col + 0.5) + (rng() - 0.5) * cellW * 0.6);
    const yFrac = band.y0 + (band.y1 - band.y0) * rng();
    const y = Math.round(H * yFrac);
    const scale = +(band.s0 + (band.s1 - band.s0) * rng()).toFixed(2);
    const rotation = rng() < 0.3 ? Math.round((rng() - 0.5) * 16) : 0;
    const z = Math.round(y) + (band.name === 'fg' ? 2000 : band.name === 'mg' ? 1000 : 0);
    if (e.kind === 'concept') {
      props.push({
        id: `p-${scene.id.slice(4)}-${e.cid}-${e.n}`,
        concept: `object:${e.cid}`,
        sprite: `prop-${e.cid}`,
        x, y, scale, rotation, z,
        band: band.name,
        flipX: rng() < 0.25,
      });
    } else {
      props.push({
        id: `amb-${scene.id.slice(4)}-${e.n}`,
        concept: 'untagged:ambience',
        sprite: `amb-${1 + (e.n % 4)}`,
        x, y, scale, rotation, z,
        band: band.name,
        flipX: false,
      });
    }
  });
  for (const [propId, clueId, xf, yf] of scene.evidence) {
    props.push({
      id: propId,
      concept: 'untagged:ambience',
      clue: clueId,
      sprite: `evid-${clueId.toLowerCase()}`,
      x: Math.round(W * xf),
      y: Math.round(H * yf),
      scale: 0.72,
      rotation: 0,
      z: Math.round(H * yf) + 1500,
      band: 'mg',
      flipX: false,
    });
  }
  return props;
}

function autoPools(props, light) {
  if (['day', 'dawn'].includes(light)) return [];
  const targets = props.filter((p) => p.concept !== 'untagged:ambience' || p.clue);
  const pools = [];
  for (let i = 0; i < targets.length; i += 4) {
    const p = targets[i];
    pools.push({ x: p.x, y: p.y, r: 300 });
    if (pools.length >= 8) break;
  }
  return pools;
}

const propsByScene = {};
for (const scene of SCENES) {
  const props = layoutScene(scene);
  propsByScene[scene.id] = props;
  out(`scenes/${scene.id}.json`, {
    id: scene.id,
    name: scene.name,
    locationId: scene.locationId,
    lightState: scene.light,
    size: SCENE_SIZE,
    palette: scene.palette,
    lightPools: autoPools(props, scene.light),
    props,
  });
}

for (const v of VARIANTS) {
  const rng = mulberry32(hash(v.id));
  const parentProps = propsByScene[v.parent];
  const removeProps = parentProps
    .filter((p) => p.concept === 'untagged:ambience' && !p.clue)
    .slice(0, v.removeAmbience)
    .map((p) => p.id);
  const addProps = [];
  let i = 0;
  for (const [cid, count] of v.addConcepts) {
    for (let n = 1; n <= count; n++) {
      const band = BANDS[1 + (i % 2)];
      const x = Math.round(140 + ((W - 280) * ((i * 0.618) % 1)) + (rng() - 0.5) * 90);
      const y = Math.round(H * (band.y0 + (band.y1 - band.y0) * rng()));
      addProps.push({
        id: `p-${v.id.slice(4)}-${cid}-${n}`,
        concept: `object:${cid}`,
        sprite: `prop-${cid}`,
        x, y,
        scale: +(band.s0 + (band.s1 - band.s0) * rng()).toFixed(2),
        rotation: rng() < 0.3 ? Math.round((rng() - 0.5) * 14) : 0,
        z: y + (band.name === 'fg' ? 2000 : 1000) + 7,
        band: band.name,
        flipX: rng() < 0.25,
      });
      i++;
    }
  }
  for (const [propId, clueId, xf, yf] of v.addEvidence) {
    addProps.push({
      id: propId,
      concept: 'untagged:ambience',
      clue: clueId,
      sprite: `evid-${clueId.toLowerCase()}`,
      x: Math.round(W * xf),
      y: Math.round(H * yf),
      scale: 0.72,
      rotation: 0,
      z: Math.round(H * yf) + 1500,
      band: 'mg',
      flipX: false,
    });
  }
  const merged = parentProps.filter((p) => !removeProps.includes(p.id)).concat(addProps);
  out(`scenes/${v.id}.json`, {
    id: v.id,
    name: v.name,
    parent: v.parent,
    lightState: v.light,
    palette: v.palette,
    lightPools: autoPools(merged, v.light),
    removeProps,
    addProps,
    moveProps: [],
  });
}

console.log(`concepts: ${concepts.length}, lexemes/lang: ${packs.de.length}`);
