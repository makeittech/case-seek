/**
 * Case & Seek — Season One (*The Hollow Frame*) asset-production manifest generator.
 *
 * Emits /workspace/content/assets-manifest.json — the complete, machine-readable
 * production plan for SOL MAX FAST one-asset-per-generation image production.
 *
 * Sources of truth:
 *   docs/ART_BIBLE.md          — style, palette, lighting states, camera bands, token blocks
 *   docs/SCENE_COMPOSITION.md  — per-scene composition, target/decoy pools, close-up register
 *   docs/GAME_DESIGN.md        — densities, fairness charter, mode placements
 *   docs/STORY_BIBLE.md        — clue ledger C01–C35, cast, continuity register
 *   docs/UX_SPEC.md            — UI surfaces, art-is-the-UI material rules
 *   tools/gen/{vocab,scene}-data.mjs — the runtime's concept & scene inventory
 *     (sprite-key contract: /assets/props/<sprite>.webp, /assets/scenes/<sceneId>.webp)
 *
 * Run: node tools/generate-assets-manifest.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROWS } from './gen/vocab-data.mjs';
import { SCENES, VARIANTS } from './gen/scene-data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'content', 'assets-manifest.json');

// ---------------------------------------------------------------------------
// Global prompt blocks (ART_BIBLE §13.2 / §13.5 — verbatim)
// ---------------------------------------------------------------------------
const GLOBAL_STYLE =
  'painterly realistic oil-and-gouache illustration, 1927 fictional European port city, ' +
  'warm cinematic lighting, visible brushwork, crisp readable object silhouettes, ' +
  'cozy-noir mood, muted heritage palette with amber key light and cool teal shadows, ' +
  'aged and well-used materials, no readable text, illegible painterly lettering only, ' +
  'no watermark, no border, no photograph, no cartoon, no outlines';

const NEGATIVE_STANDARD =
  'text, letters, words, numbers, captions, watermarks, signatures, borders, frames around image, ' +
  'sprite sheet, grid, collage, multiple views, multiple objects, duplicated subject, cropped subject, ' +
  'photorealism, lens flare, bokeh, chromatic aberration, neon, modern objects, plastic, ' +
  'anime, cartoon, cel shading, line art, oversaturation, pure black, pure white';

const NEG_PROP = NEGATIVE_STANDARD + ', scene background, floor, cast shadow, human hands';
const NEG_PORTRAIT = NEGATIVE_STANDARD + ', full body, second person, props unless specified';

// ART_BIBLE §5 lighting states, keyed by the runtime scene light values.
const LIGHT = {
  day: 'DAY-WARM: warm ivory daylight key #F2E3C2, low autumn sun, cool bounce, Shadow Teal #2E4048 shadows; highest global contrast',
  lamplit: 'LAMPLIT: Lamp Amber #E8A84C pools from practicals, deep Ink Umber #3B2F2A falloff between pools; every target inside an authored pool',
  evening: 'EVENING-HEARTH: firelight + candle clusters, amber-orange key, Oxblood #8A3B2E warm shadows; glints on glass and brass',
  'fog-dusk': 'FOG-DUSK: diffused lavender-slate skylight + lantern pools, Fog Silver #9AA3A8 swallows distance; targets inside lantern pools',
  night: 'NIGHT-LANTERN: gas-arc and lantern pools of saturated Lamp Amber #E8A84C on blue-black #1E2A33 night, Shadow Teal midground; no target in raw dark',
  'night-lantern': 'NIGHT-LANTERN: paper-lantern pools of saturated Lamp Amber #E8A84C on blue-black #1E2A33 night, Shadow Teal midground; no target in raw dark',
  dawn: 'DAWN-ROSE: rose-gold skylight wash #E8C2A0 top-down, cool clean shadows, dust motes in the shaft',
  storm: 'STORM-NIGHT: warm lamp cores + intermittent cool lightning key #C8D4E0, rain-wet speculars; warm pools carry all targets, lightning never required to find anything',
  'night-storm': 'STORM-NIGHT: warm lamp cores + intermittent cool lightning key #C8D4E0, rain-wet speculars; warm pools carry all targets, lightning never required to find anything',
};

// Universal prop camera (ART_BIBLE §6.2) + sprite contract (§7.1–7.2)
const PROP_CAMERA =
  'single object, isolated, centered, full object visible, no crop; three-quarter front view from 15 degrees above horizontal, ' +
  '85mm-equivalent near-orthographic long lens; neutral warm studio key upper-left, soft fill, NO baked cast shadow, NO scene background, ' +
  'plain warm-grey background for clean alpha cutout; painterly finished-still-life rendering; ' +
  'silhouette must be identifiable from alpha alone at 10% scale; worn, used, period-correct 1927 materials';

const CLOSEUP_DOC_CAMERA =
  'evidence close-up, 60–75 degree top-down macro framing on a desk or table surface, soft edge falloff outside the evidence, ' +
  'single warm key light, macro fidelity (paper fibers, ink bleed, stamp impressions); documentary sub-style: aged paper stocks ' +
  '(cream, buff, telegraph-yellow), period print suggestion GREEKED ONLY; quiet flat evenly-lit rectangle reserved for typography overlay';

const CLOSEUP_OBJ_CAMERA =
  'evidence close-up, 15 degree hero angle on fabric or wood ground, single warm key light, macro fidelity ' +
  '(brass wear, chalk ghosts, worn patina), shallow depth suggestion at edges only; quiet flat zone reserved for typography overlay where flagged';

const PORTRAIT_CAMERA =
  'bust portrait, mid-chest up, 85mm-equivalent, eye-level, three-quarter turn facing LEFT, ' +
  'plain painterly backdrop in the character accent color family at least 2 value steps darker than the face; ' +
  'painterly skin and cloth, sharp eyes and hands, calm brushwork around eyes and mouth';

const PLATE_RULES =
  'wide establishing view, 35mm-equivalent perspective, 160cm eye height, no more than 5 degrees downward tilt, one-point or gentle two-point perspective; ' +
  'EMPTY of small findable objects (all findables are separate prop sprites); bottom 18% of frame is tray-safe (nothing story-critical); ' +
  'no dutch angles, no fisheye; light pools partition the scene into search neighborhoods; greeked signage only';

// Character token blocks (ART_BIBLE §9 — paste verbatim, never paraphrase)
const TOKEN = {
  halloway: 'weathered ink-stained hands of indeterminate gender, dark wool coat cuff, no face visible, grey felt hat as object',
  margo: 'young East Asian-European woman, late 20s, black windblown 1920s bob, quick dark eyes, rust check jacket, red scarf, leather satchel, pencil behind ear',
  adele: 'pale precise woman, mid 30s, dark blonde severe chignon, rimless spectacles on chain, slate-blue tailored 1920s suit, high collar, guarded composure',
  holt: 'heavy weathered police inspector, early 50s, grey walrus mustache, brick complexion, ash-brown belted overcoat, bowler hat, patient deep-set eyes',
  casal: 'urbane art dealer, mid 40s, silver-templed pomaded hair, groomed short beard, olive complexion, peacock silk waistcoat, cravat pin, theatrical poise',
  finch: 'gentle stooped night guard, late 50s, white water-combed hair, soft jowls, kind anxious eyes, faded navy uniform with bright brass buttons',
  ottilie: 'upright exact woman, early 40s, silver-streaked dark hair pinned, grey-green appraising eyes, dove-grey high-collar 1920s dress, grey kid gloves, conservator\u2019s poise',
  vane: 'gentle weathered gardener, late 40s, cropped grey beard, deep crow\u2019s-feet, collarless shirt, ochre canvas apron, paint-stained left hand holding tools',
};

// ---------------------------------------------------------------------------
// Scene table: runtime scene id → rounds served + composition brief
// (SCENE_COMPOSITION.md §2/§3, keyed to the runtime ids in content/scenes/)
// ---------------------------------------------------------------------------
const SCENE_INFO = {
  'scn-office': {
    rounds: ['S00'],
    title: "Detective's Office (hub) — \u201cKit Before Dawn\u201d",
    comp: 'snug one-point interior toward the window wall; desk lower-left third, coat rack on right golden-section vertical (generously lit — first-find anchor); horizon 55%; window shows rooftops, harbor and the North Mole breakwater on the skyline; shelf wall of 41 numbered notebooks, labeled jars, filing cabinets, frosted-glass door, wall map of Marlowe Bay as painted plate feature; pools: desk lamp amber, cool grey window first-light on coat rack, warm dim shelf fill',
  },
  'scn-gallery-day': {
    rounds: ['S01'],
    title: 'Museum Gallery, day — \u201cThe Hole in the Wall\u201d',
    comp: 'wide one-point down the Beaux-Arts gallery axis; the hollow gilt frame ON its patent mounting cradle on the far wall at the left golden-section vertical (the emptiness is the subject); horizon 54%; marble floor, pilasters, coffered ceiling, tall windows raking warm ivory shafts; service-stair door behind a dust sheet at right edge (visible, unremarked); roped-off exhibit bays, unveiling crates; pools: 3 window shafts, warmer frame-wall wash, crate-cluster bounce',
  },
  'scn-gallery-storm': {
    rounds: ['S27'],
    title: 'Museum Gallery, night-storm, ransacked — \u201cTwice a Crime Scene\u201d',
    comp: 'same camera as the day gallery (variant law); dust sheets torn down exposing the service-stair door, display case shattered (glass field), storm rain on tall windows, wet even-paced footprint track toward the stair painted as plate feature; hollow frame untouched and level; 3 constable-lamp warm pools (frame wall, center wreckage, stair door) + intermittent lightning through windows (reduced-flash variant authored separately)',
  },
  'scn-curators-office': {
    rounds: ['S02', 'S03'],
    title: 'Curator\u2019s Office — \u201cThe Paper Coup\u201d / \u201cWhat the Blotter Kept\u201d',
    comp: 'gentle two-point; desk dominant lower-right, bookcase wall left, window behind desk chair; horizon 53%; panelled office, glass-front cabinet, framed exhibition posters (greeked), paper drifts painted on horizontals, radiator, coat stand; framed 1919 photograph on the window sill; pools: green-shaded desk lamp (lit even by day), window wash, cabinet corner',
  },
  'scn-archives': {
    rounds: ['S04', 'S21'],
    title: 'Museum Archives, lamplit — \u201cDeep Shelves\u201d / \u201cSeal Not Recovered\u201d',
    comp: 'one-point down a deep oak shelf canyon; workroom table foreground-right; the map wall terminates the view (the 1904 harbor chart pinned among others — NO North Mole on it); horizon 50%; flat map-drawer cabinets, rolling ladder on rail, card-index bank, pipes overhead; 4 authored amber pools (table, map wall, ladder bay, card-index) in deep Ink Umber shelf-dark, dust in every shaft',
  },
  'scn-docks-day': {
    rounds: ['S05'],
    title: 'Harbor Docks, day — \u201cTicket No. 77\u201d',
    comp: 'wide two-point exterior; quay running lower-left to right, Brassbound Pawn shopfront with three-ball sign (pictographic) at the right golden section; berth 9 / SS Vesper across the water left-distant; crane diagonals cross the sky; horizon 47%; Oxblood brick warehouses, moored barge with a Lantern-Quarter lantern hung on it, distant North Mole on the horizon (continuity law), painted gulls in the sky; pools: shopfront awning warmth, crate-stack sun patch, bollard-line rake on wet cobbles',
  },
  'scn-docks-fog': {
    rounds: ['S07'],
    title: 'Harbor Docks, fog-dusk — \u201cBerth 9\u201d',
    comp: 'same camera re-weighted right into the lit freight shed interior (primary search field: shelving, paper spike, weighing beam); harbor dissolves into fog cards left, Vesper masthead lights a ghost; freight-tram rails glint inland (deliberate light line); horizon 47%; 5 authored lantern pools (shed table, gangplank, bollard line, crane base, shed shelves); lavender-slate ambient, Fog Silver distance',
  },
  'scn-tavern': {
    rounds: ['S06', 'S08'],
    title: 'The Rusty Anchor, evening — \u201cThe Shape of a Debt\u201d / \u201cA Bird\u2019s Name\u201d',
    comp: 'cozy two-point from the door; dark wood bar sweeping left, hearth and Finch\u2019s corner table right golden section, the bookmaker\u2019s chalkboard centered over the bar on the back wall (quiet flat slate zone for overlay); horizon 55%; low beams with netting and glass floats, bottle shelves, dartboard alcove, back-room doorway; pools: hearth glow, candle clusters on tables, oil lamps over the bar; Oxblood-warm shadows',
  },
  'scn-warehouse': {
    rounds: ['S09'],
    title: 'Customs Warehouse, lamplit — \u201cNine Kilograms\u201d',
    comp: 'deep one-point down the bonded-goods rack canyon; the held crate open on the weighing platform at center-right golden section (destination object), clerk\u2019s wire cage left; horizon 51%; cathedral-height racks, gantry, beam scale, lost-property shelving, roller door; 5 green-shaded gantry-lamp pools (scale platform brightest, clerk cage, lost-property shelf, stamp desk, tea-chest stack), theatrical shafts through rafters',
  },
  'scn-hotel-lobby': {
    rounds: ['S10', 'S12'],
    title: 'Grand Hotel Lobby — \u201cThe Register\u201d / \u201cThe Veiled Woman\u201d',
    comp: 'grand two-point from the entrance steps; front desk right with key-rack behind it (empty hook 412 must read at 1\u00d7), palm court and brass-railed stair sweep left; horizon 52%; Beaux-Arts marble, glass canopy daylight, revolving door, lift cage, mezzanine rail, luggage bay; pools: desk, palm court table, luggage bay (evening-service variant re-lights same pool positions warmer)',
  },
  'scn-shop-day': {
    rounds: ['S11'],
    title: 'Casal\u2019s Antique Shop, day — \u201cThe Nicked Serif\u201d',
    comp: 'dense two-point from the shop door; counter right (stamp-die and ledger territory), curio wall left, gilt-frame wall with ONE recent square gap center-back (must read as a gap at 1\u00d7); horizon 54%; glass cabinets, curio shelving to the ceiling, dressing-screen corner, chandelier cluster overhead (stock, not fixture), mirror bouncing the window light honestly into the back-shop; pools: window display, counter green lamp, frame wall, cabinet corner',
  },
  'scn-shop-night': {
    rounds: ['S23'],
    title: 'Casal\u2019s Antique Shop, shuttered-night — \u201cThe Floor Safe\u201d',
    comp: 'same camera; rolled-back rug and open floor-safe hatch replace the counter as focal (center-right); shutter-slat moonlight bars rake the floor toward it (cool graphic structure); dust sheets on half the stock, ONE drawer pulled and empty (the only violence), frame-wall gap now shadow-dramatic; 3 warm pools (hand lamp at safe, counter candelabrum, cabinet lane)',
  },
  'scn-suite-412': {
    rounds: ['S13'],
    title: 'Hotel Suite 412, day — \u201cAlready Searched\u201d (Silhouette round)',
    comp: 'intimate one-point from the suite door, tighter 40mm feel; brass bed left, writing bureau right golden section (the sticking false drawer\u2019s home), harbor window center-back WITH the North Mole present; horizon 56%; wardrobe with mirror, valet stand, marble washstand, armchair; blinds half-drawn, one soft window key through sheers + amber table lamp; high shape-readability (silhouette mode floors edge contrast); bed coverlet pressed almost-right, one corner wrong',
  },
  'scn-night-market': {
    rounds: ['S14', 'S15'],
    title: 'Night Market (Lantern Quarter) — \u201cFollow the Vendors\u2019 Calls\u201d / \u201cThe Pigment Seller\u201d',
    comp: 'immersive two-point down the market lane; stall rows converge toward the Lattice Stall (pierced-diamond screen, right of center-back, present and unremarked); strings of paper lanterns overhead (connecting-line motif); horizon 50%; timber-and-plaster facades, hanging signage ALL GREEKED (localized signage is a separate typography overlay layer, never baked), teahouse glow, laundry lines above; 6 authored lantern pools (produce, fish, textile, craft bench, lattice screen — warm but soft, teahouse corner); blue-black sky between awnings',
  },
  'scn-tram-depot': {
    rounds: ['S16'],
    title: 'Tram Depot, night — \u201cRails Go Two Directions\u201d',
    comp: 'two-point along the shed rail axis; dark tramcar bulks left as midground occluder, glazed dispatch booth right golden section, chalk dispatch board legible beside it (quiet slate zone for overlay); rails lead out the shed mouth toward the Clocktower silhouette on the hill; horizon 49%; iron trusses, inspection pit safety-railed, timetable wall (greeked), workbench row, coal stove; 4 greenish-warm gas-arc pools (dispatch booth, workbench, tram step, timetable wall), small red-green signal accents',
  },
  'scn-loft': {
    rounds: ['S17', 'S18'],
    title: 'Artist\u2019s Loft, 6 Kestrel Lane, dawn — \u201cPinholes\u201d / \u201cVane Green\u201d',
    comp: 'one-point under the sloped skylight; easel position center-left in the rose-gold light shaft, EMPTY of canvas (absence composed as presence), pounce-dust ghost on the plank floor beneath it; workbench right; laundry line crosses the upper third (string motif, smock on it); horizon 57% attic intimacy; bare plaster walls with pin-shadows and NO signatures anywhere; stove, cot corner, shelf wall, drying rack with two washed teacups (uncommented); pools: skylight shaft hero, stove ember warmth, bench bounce',
  },
  'scn-auction-house': {
    rounds: ['S19', 'S20'],
    title: 'Auction House, evening — \u201cLot 9\u201d / \u201cThe Consignor\u201d',
    comp: 'elegant one-point down the preview salon; Lot 9 on its display easel at the right golden section under its own picture lamp (destination); rostrum with gavel rail left; horizon 53%; paneled walls hung with gilt-framed lots (greeked plaques), velvet-roped viewing lane, chandeliers, back rooms beyond (lot racks, packing bench, ledger desk, telegraph corner); every lot gets its own warm candelabra/picture-lamp pool, Lot 9\u2019s warmest; Velvet Plum #5C3A4D shadow',
  },
  'scn-conservatory': {
    rounds: ['S22'],
    title: 'The Conservatory, day — \u201cThe Orchid Keeper\u201d',
    comp: 'luminous one-point down the glasshouse nave; wrought-iron ribs converge; potting bench right (sketchbook home), orchid stand left; horizon 55%; Victorian cast-iron-and-glass, central path, raised beds, palm canopy, hanging occupied birdcage (a canary — uncommented), water tank; bright diffuse canopy light with 4 leaf-dappled pools (potting bench, orchid stand, birdcage corner, path); Bottle Green #3E5C4B world, Candle Cream sky through panes — the kindest light of the season',
  },
  'scn-clocktower': {
    rounds: ['S24'],
    title: 'Clocktower Workshop, 9 Clocktower Lane, lamplit — \u201cThe Chart Rooms\u201d',
    comp: 'intimate two-point under the clock machinery; great gear train and weights overhead in the upper third; wall-to-wall 1904-era harbor charts (NO North Mole anywhere in this room — continuity law) converging on the trunk and stretcher bar by the stair door (right golden section); crate-shaped dust void center floor (negative-space plant); doorframe with child\u2019s height-marks, uncommented; horizon 56%; pools: oil lamp on drafting table (hero), trunk corner, burn barrel; moonlit clockface glazing as cool disc on back wall; pigeon sill with open shutter',
  },
  'scn-station': {
    rounds: ['S25'],
    title: 'Central Station, night — \u201cThe Counterfoil\u201d',
    comp: 'grand two-point under the iron-and-glass vault; concourse sweeps to the platform gates with standing backlit steam; two disagreeing clock faces flank the departures board high-center (greeked); telegraph counter right, left-luggage mountain left; horizon 48% (vault height); ticket kiosk, benches, mailbag trolley, wet-footed marble, storm-dark glazing overhead; 5 globe-electrolier pools (left-luggage, kiosk, benches, telegraph counter, platform gate)',
  },
  'scn-pier': {
    rounds: ['S26'],
    title: 'Boathouse & Ferry Pier, storm — \u201cFor the Wren\u201d',
    comp: 'two-point from inside the boathouse mouth looking along the pier; lamplit interior shelter right (primary search field), storm-lashed pierhead left through the open door; abandoned travel crate on the sorting bench right golden section (destination); the Belmont\u2019s hill far off in storm-grey; horizon 46%; timber boathouse, slipway, hull on trestles, tackle wall, stove; through the door: pier planks, bollards, rails into rain, held Selene\u2019s lights far off; 3 swinging-lantern shelter pools (sorting bench, tackle wall, stove corner), one small flare-box red accent',
  },
  'scn-rooftop': {
    rounds: ['S28'],
    title: 'Belmont Rooftop conservation studio, night-storm — \u201cWhat the Frame Holds\u201d (finale)',
    comp: 'the season\u2019s hero plate: one-point across the glazed rooftop studio; the worktable inventory spans the midground (14 exhibits laid in conservator\u2019s order — placed as sprites, table painted empty); the original unrolled in lamplight on the raking table beyond; crated copy against the wall right; vanishing point composed for Ottilie standing beyond the table (figure is a separate overlay); storm glass above, city lights far below through rain; horizon 55%; ONE great warm conservation-lamp pool holds table and painting; rain-traced cool glass everywhere else; lightning rims the glazing bars only; service-stair door as arrival point; shelf remains dust-ghosted from her 1907–21 tenure',
  },
};

// ---------------------------------------------------------------------------
// Concept metadata: TXT-flagged (greeked text zones) + hero/continuity overrides
// ---------------------------------------------------------------------------
const TXT_CONCEPTS = new Set([
  'ledger', 'envelope', 'calendar', 'label', 'newspaper', 'blueprint', 'register', 'gazette',
  'manifest', 'logbook', 'timetable', 'ticket', 'waybill', 'letter', 'telegram-form', 'catalogue',
  'file', 'blotter', 'folder', 'card-index', 'luggage-tag', 'stencil', 'map',
]);

const CONCEPT_DESC = {
  key: 'Small brass office key on a plain ring — the season\u2019s first-taught word; unmistakably a key (Charter #7 typicality); reused season-wide with material variants',
  notebook: 'Worn oxblood leather notebook with rubber band — Halloway\u2019s numbered-notebook family; thumb-worn page edges',
  magnifier: 'Brass-handled magnifying lens, honest wear at the grip — the detective\u2019s instrument family',
  coat: 'Dark Ink-Umber wool overcoat on a hook — Halloway\u2019s; mended, loved, never new',
  hat: 'Soft-brimmed grey felt hat, slightly loved-to-death — Halloway\u2019s hat, lost once per chapter; a continuity hero prop',
  lamp: 'Green-shaded brass desk lamp, lit warm amber — the practical that anchors LAMPLIT pools',
  cup: 'Sturdy white teacup, tea stained strong enough to stand a spoon in',
  umbrella: 'Black umbrella with one bent rib, rain-darkened ferrule',
  frame: 'Gilt picture frame, empty — hollow-rectangle motif; period gilt profile, honest corner wear',
  rope: 'Coiled rope — authored to read as the typical exemplar; museum velvet variant and hemp harbor variant share the silhouette law',
  crate: 'Pine packing crate with straw spill — highest-reuse prop (7 scenes); stencil zones GREEKED except overlay digit zones',
  sextant: 'Brass sextant, obsessively polished — Finch\u2019s pawned treasure; hero prop of the debt thread',
  seal: 'Red wax seal on a ribboned document tail — impression crisp, teaches stamp/seal semantics for the C13/C15/C31 chain',
  'stamp-die': 'Brass-and-hardwood dealer\u2019s stamp die — Casal\u2019s genuine die; the nicked serif on the matrix edge must be visible at 3\u00d7 zoom (clue C15)',
  'rubber-stamp': 'Wooden-handled rubber date stamp, ink-stained — customs stamping family; teaches impression literacy',
  blotter: 'Desk blotter in a leather corner frame, ink ghosts on the pad — quiet flat zone reserved for the C03 mirror-writing overlay',
  photograph: 'Small framed sepia photograph, in-world documentary rendering, faces soft — 1919 conservation-studio photo family',
  spectacles: 'Rimless spectacles on a fine chain — Adele\u2019s desk pair',
  sketchbook: 'Dog-eared sketchbook, charcoal-smudged cloth cover — the studio/paper family; greeked marginalia',
  shears: 'Garden shears authored for a LEFT hand (worn left grip) — Vane continuity law, no-mirror flag',
  smock: 'Painter\u2019s smock on a hanger — buttons re-sewn right-over-left for a left-handed man (S17 plant); Linseed Ochre canvas',
  palette: 'Wooden painter\u2019s palette with LEFT-thumb wear and dried paint moons — Vane continuity law, no-mirror flag',
  easel: 'Wooden studio easel, paint-freckled, tall silhouette readable at 10%',
  jar: 'Stoneware jar with greeked hand-lettered label — jar/bottle spectrum family (green-glass, amber, stoneware variants)',
  lantern: 'Hand lantern, warm-glassed, brass-and-tin — the season\u2019s most-reused light prop (9 scenes); no baked glow (glow is an FX overlay)',
  birdcage: 'Wire birdcage, dome-topped — empty in the warehouse, canary-occupied in the conservatory (variant)',
  'key-rack': 'Hotel key-rack board with brass hooks and greeked tags — the empty 412 hook must read at 1\u00d7 (plate/prop continuity)',
  glove: 'Work gloves, canvas-and-leather, one atop the other — NOT grey kid (Nachtigall Grey is reserved for Ottilie evidence art)',
  clock: 'Round-faced clock, brass bezel, pictographic dial glyphs only — clocks/watches family (5 scenes)',
  map: 'Rolled-and-pinned harbor map, hand-inked coastline, greeked labels — flat-paper family; NO North Mole on any 1904-era chart (continuity)',
  telephone: 'Candlestick telephone, brass and black japanned finish — period technology ceiling exemplar',
  typewriter: 'Black period typewriter with round keys, greeked keytops',
  scale: 'Brass beam scale with pans — weights & measures family; customs hero variant is a platform beam scale',
  brooch: 'Silver folded-wing songbird brooch, worn patina — reserved for the nightingale evidence family',
  violin: 'Violin on its side, scroll and waist as recognizable feature zones',
  gavel: 'Auctioneer\u2019s hardwood gavel, strike-worn head',
  trunk: 'Steamer trunk, ribbed, travel-scarred, brass corners',
  orchid: 'Potted orchid, pale bloom on a cane stake — the Conservatory\u2019s tender thread',
  pigeon: 'Grey city pigeon, standing pose — clocktower sill family',
  seagull: 'Harbor gull, standing pose — plural multi-find concept, pose variants ship separately',
  bottle: 'Green-glass bottle, one honest window highlight, never fully transparent — plural multi-find concept',
  stove: 'Small cast-iron stove with ember glow gap (glow is an FX overlay, not baked)',
  cat: 'Harbor dock cat, black-and-white, curled on watch — distinct from Witness the brindled tabby (who is a character overlay)',
  barometer: 'Brass ship\u2019s barometer, pictographic dial',
  'travel-case': 'Gentleman\u2019s open travel-case, silk-lined lid — P5 silhouette-board host',
  'signal-lamp': 'Railway signal hand-lamp with red/green lenses — depot kit',
  chandelier: 'Crystal-and-brass chandelier, unlit facets catching window light',
  'letter-opener': 'Bone-handled letter opener held like a scalpel in the curator\u2019s world',
  'pocket-watch': 'Silver pocket watch on a chain, lid open, pictographic dial',
  candlestick: 'Brass candlestick, drip-waxed — plural multi-find concept in the shop\u2019s lighting stock',
  mirror: 'Silvered hand mirror, honest single window highlight — reflective family',
  telescope: 'Brass draw-tube telescope, leather grip wear',
  anchor: 'Iron stocked anchor, rust-bloomed, harbor-scaled but sprite-isolated',
  'chart-tube': 'Leather chart tube with strap — cartography family',
  compass: 'Brass drafting compass (dividers-style) — cartographer\u2019s kit',
  stencil: 'Zinc marking stencil plate, greeked cutouts with quiet digit-overlay zones',
  'tea-chest': 'Plywood tea-chest with metal edge strapping, greeked shipping marks',
};

// Concepts whose sprite carries a wear/material variant note (shared library, ART §7.4)
const PLURAL_VARIANTS = {
  // concept: number of EXTRA pose/wear sprites beyond the base (multi-find rule, ART §7.4)
  seagull: 2, bottle: 2, orange: 2, ticket: 2, folder: 2, label: 2, flowerpot: 2, jar: 2,
  key: 1, lantern: 1, suitcase: 1, candlestick: 1, brush: 1, oar: 1, gear: 1, clock: 1, 'rubber-stamp': 1,
};

// ---------------------------------------------------------------------------
// Evidence sprites (in-scene placeable clue props; sprite key contract: evid-cNN)
// ---------------------------------------------------------------------------
const EVIDENCE_SPRITES = {
  C00: ['Gallery One dawn pass: small brass token clipped to a folded cream letter (Pettibone\u2019s) — warm local key, cleaner edge than neighbors', 'scn-office'],
  C01: ['Mounting screw with a fresh burr and wrong slot pattern, lying on marble dust beneath the frame wall', 'scn-gallery-day'],
  C02: ['1926 acquisition file: buff folder with a sepia catalog photograph tipped in, greeked type, quiet text zones', 'scn-curators-office'],
  C03: ['Desk blotter sheet lifted at a corner, faint reversed ink impressions (greeked; mirror-writing overlay zone)', 'scn-curators-office'],
  C04: ['Rolled patent blueprint, cyanotype blue, tied with faded tape — signature block zone kept quiet for the O. Marsh overlay', 'scn-archives'],
  C07: ['Pawn ticket No. 77, reassembled from torn fragments, tape-jointed — buff card, greeked print, number zone for overlay', 'scn-rooftop'],
  C08: ['Pawnbroker\u2019s ledger lying open, greeked columns, one line-zone kept flat for the item-77 overlay', 'scn-docks-day'],
  C09: ['Small slate with wiped-but-readable chalk ghost lines — chalk ghosting rendered, wording zones quiet for overlay', 'scn-tavern'],
  C11: ['Lading slip on a spike, telegraph-yellow stock, a too-crisp stamp impression in one corner', 'scn-docks-fog'],
  C12: ['Finch\u2019s duplicate log book: cheap marbled boards, cramped rewritten page visible, carbon-leaf gap', 'scn-tavern'],
  C13: ['Forged customs stamp impression on a manifest sheet — impression suspiciously clean; greeked print with quiet weight-line zone', 'scn-warehouse'],
  C14: ['Grand Hotel register, open on its stand, greeked lines with two quiet entry zones (Casal 412 / Lorentz Oct 20 overlays)', 'scn-hotel-lobby'],
  C15: ['Casal\u2019s genuine brass stamp die, nicked serif visible on the matrix — 15-degree hero angle prop', 'scn-shop-day'],
  C17: ['Folded drop note bearing the pierced lattice-diamond sigil (pictographic, sanctioned), resting on a single grey kid glove (Nachtigall Grey #B8B2AD)', 'scn-hotel-lobby'],
  C18: ['Telegram flimsy taped behind a drawer panel — telegraph-yellow, greeked strips, signature zone quiet for NACHTIGALL overlay', 'scn-suite-412'],
  C19: ['Hollow dead-drop paper lantern, side panel open showing a rolled slip inside', 'scn-night-market'],
  C20: ['Pigment seller\u2019s order book, pigment-smudged cover, open to a standing-order page (greeked, quiet name-line zone)', 'scn-night-market'],
  C21: ['Freight waybill, buff stock with punched corner, greeked routing boxes and one quiet route-line zone', 'scn-tram-depot'],
  C22: ['Pounced cartoon fragment: tracing paper with pricked pinhole outlines of a pair of painted hands, pounce dust in the holes', 'scn-loft'],
  C23: ['Squat stoneware pigment pot of Vane Green #5E7C3F (RESERVED color, sanctioned here), hand-lettered greeked label, beeswax ring at the lip', 'scn-loft'],
  C24: ['Lot 9: small 1904 preparatory study in a plain frame — younger sitter, crisp nightingale brooch, sketched harbor map WITHOUT the North Mole; DERIVE from pnt-study, do not regenerate', 'scn-auction-house'],
  C25: ['Auctioneer\u2019s consignment ledger, open, greeked columns, one quiet consignor-line zone and a tiny nightingale initial-mark (pictographic)', 'scn-auction-house'],
  C26: ['1919/21 board file: grey flap folder with a wax-sealed 1918 letter showing a faint nightingale watermark (pictographic), minute page greeked with quiet margin zone', 'scn-archives'],
  C28: ['Sketchbook open on a potting bench: recent charcoal sketch of an older woman wearing the folded-wing brooch; caption band kept flat and quiet (study-language overlay)', 'scn-conservatory'],
  C29: ['Floor-safe dossier: dossier band, Aurelia Trust letterhead suggestion (greeked), pencil margin-note zone quiet', 'scn-shop-night'],
  C30: ['Oak stretcher bar with keyed corners, fresh tack holes, stamped zone kept quiet for the E.V. 1904 overlay — DERIVE from painting-suite stretcher bar', 'scn-clocktower'],
  C31: ['Grand transfer papers, ribbon-bound, bearing a wax seal with the nightingale matrix impression (pictographic); greeked engrossing, quiet seal-adjacent text zone', 'scn-station'],
  C32: ['Telegraph counterfoil on a spike, torn edge, greeked strips with one quiet hold-line zone', 'scn-station'],
  C33: ['Canvas-lined crate interior: silver nightingale brooch pinned to the lining above an unused ferry ticket and a small hand-written card (both greeked, overlay zones quiet)', 'scn-pier'],
  C34: ['The retired conservator\u2019s seal: brass handle, nightingale matrix face up, discarded on marble at the foot of a frame', 'scn-gallery-storm'],
};

// ---------------------------------------------------------------------------
// Clue close-ups (CLUES-tab hero register, SCENE_COMPOSITION §4.2 — ~46 assets)
// doc = document camera; obj = object camera
// ---------------------------------------------------------------------------
const CLOSEUPS = [
  ['clue-c00-dawn-pass-letter', 'S00', 'scn-office', 'doc', 'Dawn pass close-up: brass Gallery One token clipped to Mr. Pettibone\u2019s letter on the desk blotter; letter fully greeked, number and letterhead zones quiet for overlay'],
  ['clue-c01-screw-cradle', 'S01', 'scn-gallery-day', 'obj', 'Composed close-up: the wrong-pattern mounting screw with fresh burr beside the patent cradle\u2019s re-tensioned clamp — \u201cswapped, not forced\u201d must read visually'],
  ['clue-c01b-lining-fragments', 'S01', 'scn-gallery-day', 'doc', 'Split frame lining with torn paper fragments peeking out (feeds puzzle P1) — raw gilt edge, canvas dust'],
  ['clue-c02-acquisition-file', 'S02', 'scn-curators-office', 'doc', 'The 1926 acquisition file open: catalog photograph of the painting (sepia, DERIVED from pnt-photo) + Vane\u2019s 1904 materials note tucked in the jacket; the North Mole visible-but-unremarkable in the photo\u2019s background map (ART \u00a710 law)'],
  ['clue-c03-blotter-mirror', 'S03', 'scn-curators-office', 'doc', 'Blotter close-up: reversed ink impressions of a telegram draft, held toward a window — greeked reversed strokes, quiet zone for reversed-type overlay'],
  ['clue-c03b-photo-1919', 'S02', 'scn-curators-office', 'doc', 'Hero rendering of the framed 1919 photograph: young Adele (28) and an unnamed upright woman (Ottilie, 35, conservator\u2019s apron, sleeves rolled, the same grey-green eyes) in the conservation studio; sepia in-world photographic rendering; doubles as PEOPLE-tab asset'],
  ['clue-c04-blueprint', 'S04', 'scn-archives', 'doc', 'Patent mounting-cradle blueprint unrolled under lamplight: cyanotype linework of the 1905 cradle, signature block quiet for the \u201cO. Marsh, 1905\u201d overlay'],
  ['clue-c05-clipping', 'S04', 'scn-archives', 'doc', '1907 newspaper clipping, foxed: column suggestion greeked, headline zone quiet (\u201cthe Belmont\u2019s nightingale\u201d overlay); small engraved-portrait suggestion, face soft'],
  ['clue-c06-chart-1904', 'S21', 'scn-archives', 'doc', 'The 1904 harbor chart retrieved and unrolled beside a 1921 construction gazette: the chart shows NO North Mole; the gazette\u2019s engraving shows the breakwater under construction (canonical Mole shape from ref-north-mole)'],
  ['clue-c07-pawn-ticket', 'S04', 'scn-archives', 'doc', 'Pawn ticket No. 77 reassembled on table felt: torn buff card pieced together, tape joints, greeked print, quiet zones for ticket number and item line (P1 output)'],
  ['clue-c08-pawn-ledger', 'S05', 'scn-docks-day', 'doc', 'Brassbound Pawn ledger open to item 77: columned page greeked, one entry-line zone quiet; pawnbroker\u2019s pencil stub beside'],
  ['clue-c09-chalk-slate', 'S06', 'scn-tavern', 'doc', 'The Chalk\u2019s slate: wiped-but-readable chalk ghost of a debt line — chalk dust texture rendered, wording zone quiet for the \u201cT.F. \u2014 40 \u2014 PAID 12 OCT\u201d overlay'],
  ['clue-c10-berth-ledger', 'S07', 'scn-docks-fog', 'doc', 'Harbor master\u2019s berth ledger from the lockbox (P2 output): open page greeked, quiet zone for the SS Vesper / berth 9 line'],
  ['clue-c11-lading-slip', 'S07', 'scn-docks-fog', 'doc', 'The lading slip close-up: telegraph-yellow slip, crate dimensions zone quiet, the customs stamp impression rendered TOO CRISP (pays off against C15\u2019s nicked serif)'],
  ['clue-c12-duplicate-log', 'S08', 'scn-tavern', 'doc', 'Finch\u2019s duplicate log book open: rewritten 22:00\u201323:00 entries in a cramped hand (greeked), the carbon-leaf gap visible'],
  ['clue-c12b-watermark-scrap', 'S08', 'scn-tavern', 'doc', 'Torn envelope corner held to candlelight: partial bird watermark (folded-wing nightingale, pictographic) glowing through the paper — the motif\u2019s first physical trace'],
  ['clue-c13-stamp-manifest', 'S09', 'scn-warehouse', 'doc', 'Composed close-up: the forged customs stamp impression (clean, no nick) beside the manifest line reading a 9 kg gross weight (zone quiet for overlay) — the emptiness of the crate in paper form'],
  ['clue-c13b-crate-interior', 'S09', 'scn-warehouse', 'obj', 'The held crate\u2019s interior: raw cotton batting, NO canvas dust, NO rub-marks — an emptiness that was always empty'],
  ['clue-c14-hotel-register', 'S10', 'scn-hotel-lobby', 'doc', 'Hotel register close-up: greeked guest lines with two quiet entry zones (Casal, Suite 412 / Dr. E. Lorentz arriving Oct 20)'],
  ['clue-c15-die-comparison', 'S11', 'scn-shop-day', 'obj', 'THE forensic teaching image, composed as ONE close-up: Casal\u2019s genuine die (nicked serif) beside the C13 customs impression (clean) — the nick present in brass, absent in ink; single warm key, macro brass wear'],
  ['clue-c16-cipher-ledger', 'S11', 'scn-shop-day', 'doc', 'Casal\u2019s cipher ledger: columns of greeked substitution glyphs, one keyed entry-line zone quiet; peacock-marbled boards'],
  ['clue-c17-drop-note-glove', 'S12', 'scn-hotel-lobby', 'doc', 'Composed close-up: the folded drop note with the pierced lattice-diamond sigil (pictographic) laid on the single grey kid glove (Nachtigall Grey #B8B2AD); day-word zone quiet for FRIDAY overlay'],
  ['clue-c18-telegram', 'S13', 'scn-suite-412', 'doc', 'The Nachtigall telegram close-up: telegraph flimsy with greeked strips, lattice sigil mark, signature zone quiet for the NACHTIGALL overlay; tape shadows from the drawer back'],
  ['clue-c19-dead-drop-lantern', 'S14', 'scn-night-market', 'obj', 'Composed close-up: the hollow dead-drop lantern opened, the rolled slip beside it (greeked, quiet line zone for \u201cthe wren flies too close\u201d overlay); lantern paper glowing warm'],
  ['clue-c20-order-book', 'S15', 'scn-night-market', 'doc', 'The pigment seller\u2019s order book: standing-order page for 1904-era pigments, cold-pressed linseed, beeswax (all greeked), quiet zone for the \u201cE. SARTO, 6 Kestrel Lane\u201d overlay; NO modern white anywhere in the order (absence as detail)'],
  ['clue-c21-waybill-dispatch', 'S16', 'scn-tram-depot', 'doc', 'Composed close-up: the freight waybill beside the chalk dispatch-board line — waybill greeked with quiet route zone; chalk line zone quiet for the \u201c23:15 museum spur \u2192 Clocktower Lane \u2014 pass No. 7\u201d overlay'],
  ['clue-c22-pounced-cartoon', 'S17', 'scn-loft', 'doc', 'HERO close-up: the pounced cartoon fragment held against lamplight — pricked pinhole lines of the Daughter\u2019s hands glowing, matching the catalog photograph\u2019s hands (composed echo of C02)'],
  ['clue-c22b-varnish-kitchen', 'S17', 'scn-loft', 'obj', 'The varnish-aging setup: low oven tray, amber jars, thermometer, kitchen patience — a forger\u2019s craft rendered domestic'],
  ['clue-c22c-smock-buttons', 'S17', 'scn-loft', 'obj', 'Detail close-up: the smock\u2019s buttons re-sewn right-over-left for a left-handed man; thread wear honest'],
  ['clue-c23-pigment-pot', 'S18', 'scn-loft', 'obj', 'HERO close-up: the Vane Green pigment pot (reserved #5E7C3F, sanctioned) with greeked hand-lettering (quiet zone for GR\u00dcN \u2014 E.V. overlay), beside the left-worn palette and left-set shears'],
  ['clue-c24-study-comparison', 'S19', 'scn-auction-house', 'doc', 'THE maps-differ image, composed as ONE close-up: Lot 9 (the 1904 study, DERIVED from pnt-study, no Mole) beside the S02 catalog photograph (DERIVED from pnt-photo, Mole present) — the breakwater\u2019s presence/absence legible at a glance'],
  ['clue-c25-consignment-ledger', 'S20', 'scn-auction-house', 'doc', 'Consignment ledger close-up: Aurelia Trust line zone quiet, tiny nightingale initial-mark (pictographic), liquidation instruction zone quiet (bearer bonds)'],
  ['clue-c26-board-file', 'S21', 'scn-archives', 'doc', 'Composed close-up: the 1921 dismissal minute (quiet margin zone for \u201cseal not recovered\u201d) + the 1918 letter with its nightingale-watermark seal impression (pictographic exemplar) — the KEY CONTRADICTION\u2019s older half'],
  ['clue-c27-aurelia-manifest', 'S21', 'scn-archives', 'doc', 'The Aurelia\u2019s recovered manifest: water-stained page, greeked passenger lines, one quiet zone (E. Vane \u2014 boarded) WITHOUT the purser\u2019s countermark beside it — the drowning that wasn\u2019t'],
  ['clue-c28-sketchbook', 'S22', 'scn-conservatory', 'doc', 'HERO close-up: Sarto\u2019s sketchbook open on the potting bench — a tender recent sketch of an older woman wearing the nightingale brooch; caption band flat and quiet (the season\u2019s one sanctioned study-language overlay, tap-glossed)'],
  ['clue-c29-dossier', 'S23', 'scn-shop-night', 'doc', 'The floor-safe dossier: duplicate 1926 sale papers, Aurelia Trust letterhead suggestion (greeked), quiet zones for the 9 Clocktower Lane address and Casal\u2019s dated margin doubt'],
  ['clue-c30-stretcher-timetable', 'S24', 'scn-clocktower', 'obj', 'Composed close-up: the original\u2019s oak stretcher bar (fresh tack holes; stamp zone quiet for E.V. 1904 overlay) beside the ferry timetable with one circled sailing (Selene, quiet zone)'],
  ['clue-c30b-burn-barrel', 'S24', 'scn-clocktower', 'obj', 'Burn-barrel forensics: charred gilt frame slivers and swept frame-nails among ash — METHOD evidence, warm ember underlight'],
  ['clue-c31-transfer-papers', 'S25', 'scn-station', 'doc', 'HERO composed close-up: Finch\u2019s kept transfer papers, grand and ribbon-bound, the retired nightingale-watermark seal impression rendered clearly (pictographic) — the KEY CONTRADICTION\u2019s closing half; engrossing greeked'],
  ['clue-c32-counterfoil', 'S25', 'scn-station', 'doc', 'Telegraph counterfoil close-up: torn-edge flimsy, greeked strips, quiet zone for \u201cHOLD CABIN SELENE PIER 4 \u2014 O.M.\u201d overlay'],
  ['clue-c33-brooch-ticket-card', 'S26', 'scn-pier', 'obj', 'HERO composed close-up: the silver nightingale brooch (canonical folded-wing design, worn patina) pinned inside the canvas-lined crate above the unused ferry ticket and the small card (both greeked, quiet zones for \u201cFor the wren. I\u2019m going home.\u201d overlay)'],
  ['clue-c34-seal-hero', 'S27', 'scn-gallery-storm', 'obj', 'HERO close-up: the retired conservator\u2019s seal — brass handle, nightingale matrix — discarded on wet marble at the foot of the hollow frame, constable-lamp warm key, storm-cool rim'],
  ['clue-c34b-footprints-stair', 'S27', 'scn-gallery-storm', 'obj', 'Beat-frame close-up: small, even-paced wet footprints crossing marble toward the open service-stair door — she arrived calm; the trail goes UP'],
  ['clue-c35a-the-signing', 'S28', 'scn-rooftop', 'obj', 'Finale close-up: Vane\u2019s LEFT hand (paint-stained cuticles, token block hands) signing the copy\u2019s corner with a fine brush — \u201ca Vane, after Vane\u201d; no face; no-mirror flag'],
  ['clue-c35b-brooch-to-collar', 'S28', 'scn-rooftop', 'obj', 'Finale close-up: Ottilie\u2019s BARE hands (the season\u2019s only bare-handed Ottilie image — gloves folded beside) pinning the nightingale brooch to her own collar; conservator\u2019s hands, short nails'],
  ['clue-c35c-two-paintings', 'S28', 'scn-rooftop', 'obj', 'Finale close-up: the two canvases together in lamplight — the unrolled 1904 original and the crated 1926 copy, identical except the background map\u2019s North Mole; DERIVE both from the painting suite, never regenerate'],
];

// ---------------------------------------------------------------------------
// Painting suite (ART_BIBLE §10 — paint ONE master, derive the rest)
// ---------------------------------------------------------------------------
const PAINTING_SUITE = [
  ['pnt-master', 'The Cartographer\u2019s Daughter, 1904 original (MASTER — generate FIRST, everything derives from this file): oil portrait of Ottilie Marsh at 20, three-quarter length, seated in the clocktower chart room; dark hair down; silver nightingale brooch at her collar; behind her, her father\u2019s 1904 harbor map on the wall showing NO North Mole; Vane\u2019s palette — warm umbers, Candle Cream skin light, Vane Green #5E7C3F foliage/map-land tones (reserved color, sanctioned); painterly-within-painterly: visible period brushwork, craquelure, warm old varnish', false, { w: 2048, h: 2560 }],
  ['pnt-copy', 'The 1926 copy (DERIVE from pnt-master by edit pass — NEVER regenerate independently): IDENTICAL except the background map includes the North Mole breakwater arm — small, correct, visible-but-unremarkable; varnish very slightly cooler in sheen (subliminal only, never a player tell)', false, { w: 2048, h: 2560 }],
  ['pnt-study', 'Lot 9, the 1904 preparatory study (DERIVE from pnt-master): smaller, drier, sketchier handling; the sitter younger-looser, brooch crisp, map background sketched, NO North Mole; raw canvas edges', false, { w: 1536, h: 1920 }],
  ['pnt-photo', 'The catalog photograph (DERIVE from pnt-copy): in-world sepia photograph OF the copy, tipped into the acquisition file; documentary photographic rendering; the Mole legible at close-up zoom', false, { w: 1280, h: 1600 }],
  ['pnt-rooftop-unrolled', 'Finale state (DERIVE from pnt-master): the original unrolled in lamplight on the raking table, gentle roll distortions at the edges, STORM-NIGHT grade, warm conservation-lamp key', true, { w: 1600, h: 1200 }],
  ['pnt-copy-crated', 'Finale state (DERIVE from pnt-copy): the copy resting in an open slatted crate against the studio wall, canvas edge and one painted corner visible, storm-night grade', true, { w: 1200, h: 1400 }],
  ['prop-frame-gilt-original', 'The painting\u2019s gilt frame (pre-theft state, on the copy): period gilt profile, honest corner wear — prop-camera sprite', true, { w: 1200, h: 1400 }],
  ['prop-frame-hollow-duplicate', 'The duplicate hollow frame — Ottilie\u2019s joinery: clean, true, level; \u201ca promise, not a decoy\u201d; empty rectangle motif; prop-camera sprite', true, { w: 1200, h: 1400 }],
  ['prop-cradle-patent', 'The patent mounting cradle: brass, 1905 design, matches blueprint C04; adjustment clamps and tension screws readable — prop-camera sprite', true, { w: 1200, h: 900 }],
  ['prop-stretcher-bar-1904', 'The original\u2019s oak stretcher bar: keyed corners, fresh tack holes, quiet stamp zone (E.V. 1904 overlay) — prop-camera sprite; source for evid-c30', true, { w: 1400, h: 700 }],
  ['ref-north-mole', 'REFERENCE SHEET (production-internal): the canonical North Mole breakwater shape, one drawing, three uses labeled pictographically — present in pnt-copy\u2019s map, present-day harbor skylines, 1921 gazette engraving; ABSENT from pnt-master, pnt-study, the 1904 chart. The season\u2019s forensic spine', false, { w: 1600, h: 900 }],
];

const MOTIF_REFS = [
  ['ref-nightingale', 'REFERENCE SHEET: the canonical folded-wing songbird (nightingale) design — one bird, three material renderings side by side: silver brooch, brass seal matrix, tiny ink initial-mark; pictographic, sanctioned in-paint'],
  ['ref-wren', 'REFERENCE SHEET: the wren mark — small round-bodied bird, tail up; Halloway\u2019s quiet mark; appears only in notebook marginalia and the Season Two coda; never shares a frame with the nightingale until the finale'],
  ['ref-lattice-sigil', 'REFERENCE SHEET: the lattice-diamond stall sigil — a pierced diamond grid, pictographic; used on the matchbook, the drop note, the telegram and the Lattice Stall screen'],
];

// ---------------------------------------------------------------------------
// Character portraits (ART_BIBLE §9) + in-scene overlays
// ---------------------------------------------------------------------------
const PORTRAITS = [
  // [id, character, tokenKey, accent, expression/variant description, extraFlags]
  ['margo-ref', 'Margo Lin', 'margo', 'Press Red #C25B4E', 'CANONICAL REFERENCE portrait — approve first, all other Margo art matches this face; wry resting half-smile. Pencil behind the RIGHT ear: NO-MIRROR flag', 'no-mirror'],
  ['margo-wry', 'Margo Lin', 'margo', 'Press Red #C25B4E', 'Expression: wry default — fast half-smile, one brow up', 'no-mirror'],
  ['margo-delighted-scoop', 'Margo Lin', 'margo', 'Press Red #C25B4E', 'Expression: delighted scoop — eyes bright, notebook half-raised', 'no-mirror'],
  ['margo-conspiratorial', 'Margo Lin', 'margo', 'Press Red #C25B4E', 'Expression: conspiratorial whisper — leaned in, hand bracketing the mouth', 'no-mirror'],
  ['margo-velocity', 'Margo Lin', 'margo', 'Press Red #C25B4E', 'Expression: velocity — mid-stride talk, bob wind-undone, satchel swinging', 'no-mirror'],
  ['margo-wobble', 'Margo Lin', 'margo', 'Press Red #C25B4E', 'Expression: the wobble (Ch. 4) — torn, jaw set; the editor\u2019s story she sits on', 'no-mirror'],
  ['margo-grave', 'Margo Lin', 'margo', 'Press Red #C25B4E', 'Expression: no-joke grave (B4.6) — still, level, the jokes set down', 'no-mirror'],
  ['margo-glamorous-m2', 'Margo Lin', 'margo', 'Press Red #C25B4E', 'Variant M-2 \u201cthe one good dress\u201d (S19\u2013S20 auction night): dark green satin, scarf tone in the wrap; expression operationally glamorous. Wardrobe clause swapped; face/token identical', 'no-mirror'],
  ['margo-quiet-pride', 'Margo Lin', 'margo', 'Press Red #C25B4E', 'Expression: quiet pride (finale) — notebook out, not writing', 'no-mirror'],
  ['margo-storm-m3', 'Margo Lin', 'margo', 'Press Red #C25B4E', 'Variant M-3 storm (S26): oversized borrowed oilskin over canonical wardrobe, holding Halloway\u2019s grey hat down against the wind', 'no-mirror'],
  ['adele-ref', 'Adele Voss', 'adele', 'Slate Blue #5B6E8C', 'CANONICAL REFERENCE portrait — approve first; precise composure; curator\u2019s white cotton gloves folded in the breast pocket (NEVER grey)', ''],
  ['adele-composure', 'Adele Voss', 'adele', 'Slate Blue #5B6E8C', 'Expression: precise composure', ''],
  ['adele-brittle-smile', 'Adele Voss', 'adele', 'Slate Blue #5B6E8C', 'Expression: brittle smile', ''],
  ['adele-flash-of-fear', 'Adele Voss', 'adele', 'Slate Blue #5B6E8C', 'Expression: flash of fear — face held, hands only betraying', ''],
  ['adele-defensive-ice', 'Adele Voss', 'adele', 'Slate Blue #5B6E8C', 'Expression: defensive ice', ''],
  ['adele-confession', 'Adele Voss', 'adele', 'Slate Blue #5B6E8C', 'Expression: the confession (S21) — chignon loosened (the only time), undone, honest, older', ''],
  ['adele-cleared-gratitude', 'Adele Voss', 'adele', 'Slate Blue #5B6E8C', 'Expression: cleared / quiet gratitude', ''],
  ['adele-podium-warmth', 'Adele Voss', 'adele', 'Slate Blue #5B6E8C', 'Expression: epilogue podium warmth — first honest applause of her life', ''],
  ['holt-ref', 'Inspector Bram Holt', 'holt', 'Ash Brown #6B5B4A', 'CANONICAL REFERENCE portrait — approve first; police whistle chain at the waistcoat', ''],
  ['holt-territorial-flint', 'Inspector Bram Holt', 'holt', 'Ash Brown #6B5B4A', 'Expression: territorial flint', ''],
  ['holt-weary-fairness', 'Inspector Bram Holt', 'holt', 'Ash Brown #6B5B4A', 'Expression: weary fairness', ''],
  ['holt-maxim', 'Inspector Bram Holt', 'holt', 'Ash Brown #6B5B4A', 'Expression: the maxim delivery — dry, eyes half-closed', ''],
  ['holt-grudging-respect', 'Inspector Bram Holt', 'holt', 'Ash Brown #6B5B4A', 'Expression: grudging respect', ''],
  ['holt-command', 'Inspector Bram Holt', 'holt', 'Ash Brown #6B5B4A', 'Expression: command (finale arrests)', ''],
  ['holt-apology-file', 'Inspector Bram Holt', 'holt', 'Ash Brown #6B5B4A', 'Expression: the apology shaped like a case file (B6.1) — folder held out, eyes elsewhere', ''],
  ['casal-ref', 'Victor Casal', 'casal', 'Peacock #2F6B6B', 'CANONICAL REFERENCE portrait — approve first; moonstone cravat pin, signet ring', ''],
  ['casal-salesman', 'Victor Casal', 'casal', 'Peacock #2F6B6B', 'Expression: salesman\u2019s delight', ''],
  ['casal-performed-outrage', 'Victor Casal', 'casal', 'Peacock #2F6B6B', 'Expression: PERFORMED outrage — theatrical, big', ''],
  ['casal-real-outrage', 'Victor Casal', 'casal', 'Peacock #2F6B6B', 'Expression: REAL outrage — quieter, stiller than the performed version; the design difference is the point', ''],
  ['casal-calculating', 'Victor Casal', 'casal', 'Peacock #2F6B6B', 'Expression: calculating pause', ''],
  ['casal-framed-fury', 'Victor Casal', 'casal', 'Peacock #2F6B6B', 'Expression: framed-man fury — wearing variant C-3 (subdued suit, no cravat pin: he stops performing)', ''],
  ['casal-grudging-alliance', 'Victor Casal', 'casal', 'Peacock #2F6B6B', 'Expression: grudging alliance (Ch. 5) — variant C-3 wardrobe', ''],
  ['casal-epilogue-flourish', 'Victor Casal', 'casal', 'Peacock #2F6B6B', 'Expression: epilogue flourish — selling Margo a hat, pin restored', ''],
  ['casal-dressing-gown-c2', 'Victor Casal', 'casal', 'Peacock #2F6B6B', 'Variant C-2 (S23 beat panel): the dressing gown of operatic magnificence — peacock silk, quilted shawl collar; midnight indignation', ''],
  ['finch-ref', 'Tobias Finch', 'finch', 'Faded Navy #3D4A63', 'CANONICAL REFERENCE portrait — approve first; brass buttons kept bright (his one vanity)', ''],
  ['finch-anxious-kindness', 'Tobias Finch', 'finch', 'Faded Navy #3D4A63', 'Expression: anxious kindness', ''],
  ['finch-bad-lie', 'Tobias Finch', 'finch', 'Faded Navy #3D4A63', 'Expression: the bad lie — eyes down-left, hands busy', ''],
  ['finch-half-crack-fear', 'Tobias Finch', 'finch', 'Faded Navy #3D4A63', 'Expression: half-crack fear (B2.6)', ''],
  ['finch-shame', 'Tobias Finch', 'finch', 'Faded Navy #3D4A63', 'Expression: shame', ''],
  ['finch-redemption', 'Tobias Finch', 'finch', 'Faded Navy #3D4A63', 'Expression: the redemption resolve (S25, station doors) — variant F-2 wardrobe (brown civilian coat, soft cap), papers held out', ''],
  ['finch-daylight-ease-f2', 'Tobias Finch', 'finch', 'Faded Navy #3D4A63', 'Variant F-2 daylight redemption (epilogue): brown civilian coat and soft cap, sextant case under his arm, a pint in daylight', ''],
  ['ottilie-ref', 'Ottilie Marsh / \u201cNachtigall\u201d', 'ottilie', 'Nachtigall Grey #B8B2AD (reserved)', 'CANONICAL FACE REFERENCE — approve FIRST, all four guises derive from this face: strong-boned, upright, exact; silver-streaked dark hair pinned precisely; steady appraising grey-green eyes; conservator\u2019s hands. Guise (a) present-day widow-plain dove wardrobe, grey kid gloves ON (glove law: bare hands ONLY in clue-c35b)', ''],
  ['ottilie-courteous-appraisal', 'Ottilie Marsh', 'ottilie', 'Nachtigall Grey #B8B2AD', 'Expression: courteous appraisal (guise a) — a museum case containing a person', ''],
  ['ottilie-true-lie-serenity', 'Ottilie Marsh', 'ottilie', 'Nachtigall Grey #B8B2AD', 'Expression: the true-lie serenity (B5.5 tea beat) — every sentence technically true', ''],
  ['ottilie-professional-correction', 'Ottilie Marsh', 'ottilie', 'Nachtigall Grey #B8B2AD', 'Expression: professional correction — cannot help it; conservator to the last', ''],
  ['ottilie-rooftop-calm', 'Ottilie Marsh', 'ottilie', 'Nachtigall Grey #B8B2AD', 'Expression: rooftop calm — \u201cholding the truth level\u201d; standing beyond the worktable, hands folded, lit by her own lamp', ''],
  ['ottilie-the-question', 'Ottilie Marsh', 'ottilie', 'Nachtigall Grey #B8B2AD', 'Expression: the question — \u201creal, or true?\u201d', ''],
  ['ottilie-veiled-back', 'Ottilie Marsh (guise b)', 'ottilie', 'Nachtigall Grey #B8B2AD', 'The veiled woman (Ch. 3 sighting): same silhouette + grey traveling veil, grey gloves; FACE NEVER RENDERED — distance/back-view composition only; posture and gloves ARE the identification', ''],
  ['vane-ref', 'Elias Vane / \u201cEmil Sarto\u201d', 'vane', 'Linseed Ochre #C9A96A', 'CANONICAL REFERENCE portrait — approve first. LEFT-HANDED continuity law: any tool in the LEFT hand; NO-MIRROR flag on all Vane art', 'no-mirror'],
  ['vane-absorbed-tending', 'Elias Vane', 'vane', 'Linseed Ochre #C9A96A', 'Expression: absorbed tending — orchid and left-handed shears', 'no-mirror'],
  ['vane-watching-light', 'Elias Vane', 'vane', 'Linseed Ochre #C9A96A', 'Expression: watching-light stillness — the way others listen to music', 'no-mirror'],
  ['vane-unpressed-denial', 'Elias Vane', 'vane', 'Linseed Ochre #C9A96A', 'Expression: the unpressed denial (\u201cI never met the man\u201d) — mild, unreadable', 'no-mirror'],
  ['vane-rooftop-arrival', 'Elias Vane', 'vane', 'Linseed Ochre #C9A96A', 'Expression: rooftop arrival — rain-wet, soft brown coat and scarf, resolved', 'no-mirror'],
  ['vane-the-signing', 'Elias Vane', 'vane', 'Linseed Ochre #C9A96A', 'Expression: the signing — \u201ca Vane, after Vane\u201d; grief and mischief at once', 'no-mirror'],
];

const HALLOWAY_HANDS = [
  ['halloway-hand-pen', 'Canonical hand rig: Halloway\u2019s hand holding a pen over the notebook — the most-seen character art in the game; reuse this exact hand design in every close-up'],
  ['halloway-hand-magnifier', 'Canonical hand rig: hand holding the brass magnifier'],
  ['halloway-hand-pinning', 'Canonical hand rig: hand pinning evidence to the cork board, red string taut'],
  ['halloway-hand-teacup', 'Canonical hand rig: hand lifting the strong-tea cup'],
  ['halloway-coat-back-distant', 'Halloway from behind at distance, silhouette scale only: worn Ink-Umber overcoat, grey hat — no face, no gender cues, ever'],
];

const OVERLAYS = [
  // [id, sceneId, desc]
  ['overlay-witness-cat', 'scn-office', 'Witness — a sturdy brindled harbor tabby, torn left ear, proprietary expression, curled on the cat basket; ambience overlay, softer edge than props; affiliation unresolved by design'],
  ['overlay-pawnbroker', 'scn-docks-day', 'The pawnbroker: shawl-wrapped, lumbago posture, mid-shrug at the stall table; non-speaker, soft-edged scene overlay'],
  ['overlay-finch-seated', 'scn-tavern', 'Finch seated at his corner table, beat state, non-searchable: stooped over a half-pint, uniform coat over the chair; token block wardrobe, soft-edged'],
  ['overlay-customs-clerk', 'scn-warehouse', 'Customs clerk drowning in forms behind the wire cage, gesturing with a rubber stamp; non-speaker, soft-edged'],
  ['overlay-vendor-produce', 'scn-night-market', 'Produce stall vendor, mid-call, lantern-lit; non-speaker, soft-edged, angled protectively toward the lattice stall'],
  ['overlay-vendor-fish', 'scn-night-market', 'Fish stall vendor over ice, sleeves rolled, lantern-lit; non-speaker, soft-edged'],
  ['overlay-vendor-textile', 'scn-night-market', 'Textile stall keeper among bolts and scarves; non-speaker, soft-edged'],
  ['overlay-pigment-seller', 'scn-night-market', 'The pigment seller at the craft-row bench, jars and mortars, appraising look; non-speaker, soft-edged'],
  ['overlay-landlady', 'scn-loft', 'The landlady in the loft doorway, pantomiming rent with weary dignity; non-speaker, soft-edged'],
  ['overlay-dispatcher', 'scn-tram-depot', 'The night dispatcher: thermos in one hand, pointing with the other; non-speaker, soft-edged, gas-arc lit'],
  ['overlay-left-luggage-clerk', 'scn-station', 'The left-luggage clerk buried to the elbows in tags, deputizing gesture; non-speaker, soft-edged'],
  ['overlay-boathouse-keeper', 'scn-pier', 'The boathouse keeper: an oilskin monolith, weather-gesturing through the doorway rain; non-speaker, soft-edged'],
  ['overlay-corbin-cuffed', 'scn-gallery-storm', 'ONE Corbin brother in handcuffs — large bruiser in a cheap loud check, indignant; author a single figure (one character per image law); the engine composites the mirrored pair (Corbins are mirror-of-each-other by canon, mirroring sanctioned)'],
  ['overlay-sarto-working', 'scn-conservatory', 'Sarto (Vane) working at the raised beds, in-scene overlay: gardener-restorer wardrobe, wooden clogs, shears in the LEFT hand — the exception where a non-focal figure gets portrait-grade face fidelity at distance; NO-MIRROR flag; never centered, never highlighted'],
  ['overlay-ottilie-rooftop', 'scn-rooftop', 'Ottilie standing beyond the worktable at the vanishing point: hands folded, dove-grey, gloves ON, lit by her own lamp — full-figure scene overlay for the finale plate'],
];

// ---------------------------------------------------------------------------
// FX overlay library (SCENE_COMPOSITION §4.3 — authored once, graded per state)
// ---------------------------------------------------------------------------
const FX = [
  ['fx-fog-card-near', 'Fog card, near depth — translucent painterly fog bank, soft edges, Fog Silver #9AA3A8', { w: 3840, h: 2160 }],
  ['fx-fog-card-mid', 'Fog card, mid depth — thinner veil, atmospheric perspective', { w: 3840, h: 2160 }],
  ['fx-fog-card-far', 'Fog card, far depth — distance-swallowing haze', { w: 3840, h: 2160 }],
  ['fx-rain-card-near', 'Rain streak card, near depth — backlit painterly streaks, romantic not miserable', { w: 3840, h: 2160 }],
  ['fx-rain-card-far', 'Rain streak card, far depth — finer veiling streaks', { w: 3840, h: 2160 }],
  ['fx-rain-gust-spray', 'Door-gust rain spray burst — directional spatter sheet for the boathouse doorway', { w: 2048, h: 2048 }],
  ['fx-lightning-frame-a', 'Lightning key frame A — cool #C8D4E0 window/glazing rim-light wash (flash-safety pre-checked; never required to find anything)', { w: 3840, h: 2160 }],
  ['fx-lightning-frame-b', 'Lightning key frame B — alternate strike wash for variation', { w: 3840, h: 2160 }],
  ['fx-lightning-reduced', 'Reduced-motion/photosensitive lightning variant — soft brightness lift, no strobe (GDD §18)', { w: 3840, h: 2160 }],
  ['fx-steam-card', 'Steam card — platform-gate standing steam, backlit, soft translucent', { w: 2048, h: 2048 }],
  ['fx-dust-mote-shaft', 'Dust-mote light shaft — screen-blend shaft with drifting motes', { w: 2048, h: 2048 }],
  ['fx-lantern-glow', 'Lantern glow sprite — warm Lamp Amber #E8A84C radial pool, screen-blend; must stay distinguishable from Hint Gold #F5C86E (QA rule)', { w: 1024, h: 1024 }],
  ['fx-candle-glow', 'Candle glow sprite — smaller, flickery-edged warm pool, screen-blend', { w: 1024, h: 1024 }],
  ['fx-hearth-glow', 'Hearth glow sprite — broad ember-orange wash for the tavern fire corner, screen-blend', { w: 1536, h: 1024 }],
  ['fx-ember-glow', 'Stove/brazier ember glow sprite — small deep-orange breathing core', { w: 1024, h: 1024 }],
  ['fx-breath-fog-wisp', 'Breath-fog wisp — small cold-night exhale puff', { w: 512, h: 512 }],
  ['fx-leaf-dapple', 'Leaf-dapple light card — conservatory canopy light pattern, soft-edged', { w: 2048, h: 2048 }],
  ['fx-water-glint', 'Harbor water glint strip — broken warm speculars on Harbor Slate #4A6B7C water', { w: 2048, h: 512 }],
];

// ---------------------------------------------------------------------------
// UI surfaces (UX_SPEC §19 material rules: paper, pencil/ink, leather, brass, cork, string, chalk, stamp)
// ---------------------------------------------------------------------------
const UI = [
  // [id, desc, transparent, dims]
  ['ui-notebook-cover', 'The Notebook: worn oxblood leather cover with rubber band — the game\u2019s soul object; thumb-worn edges', true, { w: 1024, h: 1280 }],
  ['ui-notebook-spread', 'Notebook open two-page spread: aged cream paper, pencil rules, thumb-wear edge tint — base surface for CASE/Debrief pages (all handwriting is typography overlay)', false, { w: 2560, h: 1600 }],
  ['ui-notebook-page', 'Notebook single page (compact layouts) — same paper family', false, { w: 1280, h: 1600 }],
  ['ui-notebook-tab', 'Paper index tab divider (one asset, reused for CASE/PEOPLE/CLUES/WORDS with typography overlay)', true, { w: 512, h: 256 }],
  ['ui-word-chip', 'Find List word chip: torn-edge notebook paper strip with pencil rule — text is typography overlay, never painted', true, { w: 512, h: 240 }],
  ['ui-gloss-card', 'Translation-hint gloss card back (paper flip face): cool ivory card stock, soft pencil border', true, { w: 512, h: 320 }],
  ['ui-found-folio', 'Found-stack folio: compact folded paper packet with pencil tally corner', true, { w: 512, h: 384 }],
  ['ui-word-card', 'Word card (find moment): paper slip with subtle backing shadow, quiet zones for article + noun + gloss overlays', true, { w: 768, h: 512 }],
  ['ui-paper-slip', 'Generic paper slip (captions, system notes, location slips) — aged cream, one torn edge', true, { w: 768, h: 384 }],
  ['ui-corner-fold', 'Corner fold affordance (skip/back/later) — a lifted page corner with shadow', true, { w: 256, h: 256 }],
  ['ui-results-slip', 'Round results report slip: paper report with rule lines and stamp-landing zones', true, { w: 1024, h: 1280 }],
  ['ui-stamp-accuracy', 'Rubber stamp: ACCURACY — round inked stamp, pictographic target motif, wording zone greeked (label is overlay)', true, { w: 512, h: 512 }],
  ['ui-stamp-unassisted', 'Rubber stamp: UNASSISTED — pictographic unlit-lens motif, wording zone quiet', true, { w: 512, h: 512 }],
  ['ui-stamp-streak', 'Rubber stamp: STREAK — pictographic string-of-pins motif, wording zone quiet', true, { w: 512, h: 512 }],
  ['ui-stamp-ally', 'Dossier status stamp: ALLY — diagonal rubber stamp, wording zone quiet for overlay', true, { w: 512, h: 256 }],
  ['ui-stamp-suspect', 'Dossier status stamp: SUSPECT — diagonal rubber stamp, wording zone quiet', true, { w: 512, h: 256 }],
  ['ui-stamp-cleared', 'Dossier status stamp: CLEARED — diagonal rubber stamp, wording zone quiet', true, { w: 512, h: 256 }],
  ['ui-stamp-unknown', 'Dossier status stamp: UNKNOWN — diagonal rubber stamp, wording zone quiet', true, { w: 512, h: 256 }],
  ['ui-insight-meter', 'The Insight meter: three brass lens segments in a period housing (empty/full states composited in engine from this base + fx glow)', true, { w: 768, h: 256 }],
  ['ui-hint-magnifier', 'Search-hint button: the detective\u2019s brass magnifying glass — the ONLY gold-glow family object in the UI', true, { w: 256, h: 256 }],
  ['ui-edge-arrow', 'Brass edge arrow (off-screen hint indicator)', true, { w: 256, h: 256 }],
  ['ui-reticle', 'Keyboard reticle: brass crosshair', true, { w: 256, h: 256 }],
  ['ui-reset-chip', '1\u00d7 reset chip: small paper chip with pencil \u201c1\u00d7\u201d zone (numeral is overlay)', true, { w: 192, h: 128 }],
  ['ui-minimap-vellum', 'Mini-map vellum rectangle with pencil-line border', true, { w: 360, h: 204 }],
  ['ui-city-map', 'The city map of Marlowe Bay — Halloway\u2019s office wall map, IS the map UI (planted in S00): hand-drawn cartography, Vane-adjacent inkwork, harbor WITH North Mole (continuity), pictographic landmark icons (Belmont dome, clocktower, lighthouse, lantern for the Quarter); all labels greeked (names are typography overlays); fog and unpainted edges where locations are still locked', false, { w: 2560, h: 1600 }],
  ['ui-map-pin', 'Map pin: brass-headed pin with tiny paper label tag (tag text is overlay)', true, { w: 192, h: 256 }],
  ['ui-string-flag', 'Red string objective flag for the current-objective pin', true, { w: 256, h: 256 }],
  ['ui-location-slip', 'Location panel slip: paper slip with pencil rule and a Go stamp zone', true, { w: 768, h: 512 }],
  ['ui-board-cork', 'Evidence board: cork field with wood frame, pin shadows, faded rectangles where old cases hung', false, { w: 2560, h: 1600 }],
  ['ui-board-pin', 'Evidence board pin: red-glass-headed pin', true, { w: 128, h: 160 }],
  ['ui-board-string', 'Evidence board red thread segment (tileable along its length)', true, { w: 512, h: 64 }],
  ['ui-dialogue-panel', 'Dialogue paper caption band: aged paper strip with soft location-color wash edge (text overlay zone quiet)', true, { w: 2048, h: 512 }],
  ['ui-name-plate', 'Speaker name plate: small brass-and-paper label (name is overlay)', true, { w: 512, h: 128 }],
  ['ui-title-desk', 'Title screen: Halloway\u2019s office desk at dusk — painted scene, lamp pool on the blotter, menu objects composed as separate sprites atop it; harbor dusk through the window (North Mole on the skyline)', false, { w: 3840, h: 2160 }],
  ['ui-title-letter', 'Title object: the sealed Aldermere letter with wax seal (NEW CASE) — lamp-lit hero on first run', true, { w: 768, h: 512 }],
  ['ui-title-drawer', 'Title object: the card drawer (CASE FILES) — oak drawer with brass pull, paper folders peeking', true, { w: 768, h: 512 }],
  ['ui-title-lamp', 'Title object: the desk lamp (SETTINGS) — green shade, warm glow OFF (glow via fx-lantern-glow)', true, { w: 512, h: 768 }],
  ['ui-title-label-tag', 'String-tied paper label tag for title desk objects (wording is overlay)', true, { w: 384, h: 192 }],
  ['ui-cover-de', 'Language notebook cover: Deutsch — distinct leather color/material, embossed blind motif, title zone quiet for overlay', true, { w: 768, h: 1024 }],
  ['ui-cover-es', 'Language notebook cover: Espa\u00f1ol — distinct cover material/color, title zone quiet', true, { w: 768, h: 1024 }],
  ['ui-cover-it', 'Language notebook cover: Italiano — distinct cover material/color, title zone quiet', true, { w: 768, h: 1024 }],
  ['ui-proficiency-card', 'Proficiency select paper card in Halloway\u2019s hand (one base card; the four tiers are typography overlays + live chip previews)', true, { w: 768, h: 512 }],
  ['ui-puzzle-bench', 'Puzzle shell backdrop: desk/bench close-up surface (wood, felt corner, lamp pool) shared by P1\u2013P9', false, { w: 2560, h: 1600 }],
  ['ui-pocket-watch-sprint', 'Sprint pocket watch (post-completion opt-in timer): diegetic brass pocket watch, pictographic dial (numerals are overlay); never seen before campaign completion', true, { w: 512, h: 512 }],
];

// ---------------------------------------------------------------------------
// Story / beat illustrations, chapter cards, epilogue (SCENE_COMPOSITION §4.4, STORY_BIBLE §16)
// ---------------------------------------------------------------------------
const STORY_ART = [
  // [id, sceneId, rounds, desc]
  ['story-cold-open-letter', 'global', [], 'Cold open panel: a letter sliding under the office door, dawn-grey hall light, the grey hat on its hook above — atmospheric single panel'],
  ['story-beat-veiled-woman', 'scn-hotel-lobby', ['S12'], 'Beat illustration (B3.4): the veiled woman crossing the lobby at distance, BACK VIEW — grey traveling veil, grey gloves, posture like she owned the marble; face never rendered (Ottilie guise b law)'],
  ['story-beat-masked-meeting', 'scn-night-market', ['S14'], 'Beat illustration: the masked-voice meeting — the pierced lattice screen lantern-lit from behind, grey-gloved fingertips at its edge; NEVER her face (audio carries the voice)'],
  ['story-beat-stakeout-wire', 'scn-conservatory', ['S22'], 'Beat illustration (B5.6, the herring-killer): composed split of the glasshouse alibi — Sarto\u2019s silhouette at the orchid bench while, inset as a pinned wire slip, Nachtigall\u2019s consignment moves elsewhere; paper-and-pin collage styling on the notebook page'],
  ['story-beat-pigeon-feeding', 'scn-clocktower', ['S24'], 'Beat art: Halloway\u2019s hands (canonical hand rig) scattering crumbs to the clocktower pigeons on the sill — hands only, no face, entry beat'],
  ['story-beat-the-turn', 'scn-pier', ['S26'], 'THE season\u2019s turn, one image: through the rain from the boathouse, the keeper\u2019s oilskin arm pointing — and far off, a small upright figure with a long wrapped burden walking TOWARD the Belmont\u2019s hill, not away'],
  ['story-beat-corbins-taken', 'scn-gallery-storm', ['S27'], 'Beat illustration: constables walking ONE handcuffed Corbin past the gallery doors (single-figure law; the pair is composited); Holt\u2019s silhouette in command beyond'],
  ['story-beat-vane-arrival', 'scn-rooftop', ['S28'], 'Beat illustration: Vane arriving slow through the rooftop rain, soft brown coat and scarf, rain-wet, resolved — stair door framing him (frame-within-frame motif); NO-MIRROR'],
  ['story-beat-adele-arrival', 'scn-rooftop', ['S28'], 'Beat illustration: Adele at the stair door with the storm\u2019s last act behind her — single figure, slate-blue, undone composure'],
  ['story-beat-holt-arrival', 'scn-rooftop', ['S28'], 'Beat illustration: Holt filling the stair doorway, bowler streaming, warrant folder dry inside his coat — single figure'],
  ['story-chapter-card-1', 'global', [], 'Chapter card 1 \u201cThe Empty Frame\u201d: the hollow gilt frame on its cradle, DAY-WARM gallery light — hollow-rectangle motif carries every chapter card; title zone quiet for overlay'],
  ['story-chapter-card-2', 'global', [], 'Chapter card 2 \u201cSalt and Smoke\u201d: harbor cranes and the pawnshop\u2019s three-ball sign in low sun through chimney smoke, empty-frame motif as a window mullion; title zone quiet'],
  ['story-chapter-card-3', 'global', [], 'Chapter card 3 \u201cThe Gilded Trail\u201d: the hotel key-rack with one empty hook, framed by the pigeonhole grid (frames-within-frames); title zone quiet'],
  ['story-chapter-card-4', 'global', [], 'Chapter card 4 \u201cNight Market\u201d: lantern strings converging on the dark lattice screen, one lantern unlit (the hollow one); title zone quiet'],
  ['story-chapter-card-5', 'global', [], 'Chapter card 5 \u201cThe Auction\u201d: Lot 9 on its easel in its own warm pool, surrounding lots dark, an empty frame leaning in shadow; title zone quiet'],
  ['story-chapter-card-6', 'global', [], 'Chapter card 6 \u201cThe Broker\u201d: the storm-lit rooftop glass seen from below, one warm window in the dark — the case, lit; the storm, outside; title zone quiet'],
  ['story-title-card-season', 'global', [], 'Season title card \u201cThe Hollow Frame\u201d: the empty gilt rectangle against Marlowe Bay\u2019s dusk skyline (clocktower, Belmont dome, lighthouse, North Mole) — logotype is a typography overlay, never painted'],
  ['story-epilogue-1', 'scn-gallery-day', [], 'Epilogue panel 1 — The Belmont, November: the original hangs in Gallery One in Ottilie\u2019s duplicate frame; Adele mid-speech at the podium, full warm house; caption band quiet'],
  ['story-epilogue-2', 'global', [], 'Epilogue panel 2 — the magistrate\u2019s court, a Tuesday: Ottilie upright at the rail, the courtroom oddly gentle; a letter beginning on a table before her; caption band quiet'],
  ['story-epilogue-3', 'scn-conservatory', [], 'Epilogue panel 3 — the Conservatory, Sunday: an old man renewing orchid labels in a careful LEFT hand; small harbor studies wrapped beside him; caption band quiet; NO-MIRROR'],
  ['story-epilogue-4', 'scn-tavern', [], 'Epilogue panel 4 — the Rusty Anchor in daylight: Finch buying a round with clean money, the sextant on the bar shelf, the slate\u2019s PAID line framed on the wall; caption band quiet'],
  ['story-epilogue-5', 'scn-night-market', [], 'Epilogue panel 5 — the night market: Casal flourishing a \u201cprovenance-flexible\u201d hat toward Margo between stalls; the lattice stall\u2019s shutter half-open behind; caption band quiet'],
  ['story-epilogue-6', 'scn-office', [], 'Epilogue panel 6 — the Detective\u2019s Office: notebook forty-one being filed on the shelf by the canonical hands; Witness mid-demand on the desk; the hat on its hook; caption band quiet'],
  ['story-coda-letter', 'global', [], 'Coda panel: a fresh letter under the door, mirror of the cold open — Aldermere seal, morning light this time; notebook forty-two open to a blank first page (Season Two tease, wren doodle in the margin)'],
];

// ---------------------------------------------------------------------------
// Puzzle art (P1–P9, hosted per SCENE_COMPOSITION; boards live on ui-puzzle-bench)
// ---------------------------------------------------------------------------
const PUZZLES = [
  ['puz-p1-board-felt', 'scn-archives', ['S04'], 'P1 torn-lining reassembly board: green table felt with lamplight pool and scattered-fragment shadows (fragments are sliced from puz-p1-ticket-torn in the pipeline)', false, { w: 2048, h: 1280 }],
  ['puz-p1-ticket-torn', 'scn-archives', ['S04'], 'P1 source art: pawn ticket No. 77 rendered WHOLE at high fidelity (buff card, greeked print, quiet number/item zones) — the pipeline slices it into 6\u20138 torn fragments with alpha edges; also grades into clue-c07', true, { w: 1400, h: 900 }],
  ['puz-p2-lockbox', 'scn-docks-fog', ['S07'], 'P2 harbor master\u2019s lockbox: iron combination lockbox, three brass number wheels (digits pictographic/greeked — real digits overlay), honest wear', true, { w: 1200, h: 900 }],
  ['puz-p3-board', 'scn-warehouse', ['S09'], 'P3 manifest pairs board: customs desk blotter grid with 16 card-landing rectangles chalked on (cards composited in engine)', false, { w: 2048, h: 1280 }],
  ['puz-p4-cipher-wheel', 'scn-shop-day', ['S11'], 'P4 substitution-cipher wheel: two nested brass rings, greeked glyph rings (solution letters are UI-side per language), center pin, thumb-worn edges', true, { w: 1200, h: 1200 }],
  ['puz-p5-case-board', 'scn-suite-412', ['S13'], 'P5 luggage-silhouette board: the open travel case interior, silk lining with 6 empty outline wells (well outlines auto-derived from prop alphas; case interior painted with the wells\u2019 shadow depressions only)', false, { w: 2048, h: 1280 }],
  ['puz-p6-signal-lamp', 'scn-night-market', ['S14'], 'P6 dead-drop signal lamp: the stall-keeper\u2019s lamp with four shutter apertures, unlit state (glow states composited from fx-lantern-glow tints)', true, { w: 1024, h: 1200 }],
  ['puz-p7-bench-board', 'scn-loft', ['S17'], 'P7 pigment mixing bench: recipe cards (greeked, color-word overlay zones), mixing wells, pestle — bench-top staging', false, { w: 2048, h: 1280 }],
  ['puz-p7-test-card', 'scn-loft', ['S17'], 'P7 the wet green test card — a fresh swatch of Vane Green #5E7C3F on rag paper (RESERVED color, sanctioned appearance)', true, { w: 768, h: 512 }],
  ['puz-p8-grid-board', 'scn-auction-house', ['S20'], 'P8 lot logic grid: auction house slate/paper 3\u00d73 grid with chalk rules (statements are UI typography from PEOPLE-tab facts)', false, { w: 2048, h: 1280 }],
  ['puz-p9-clock-dial', 'scn-station', ['S25'], 'P9 station clock face: large interactive dial, pictographic hour marks (no numerals), brass bezel, storm-night grade', true, { w: 1200, h: 1200 }],
  ['puz-p9-hand-hour', 'scn-station', ['S25'], 'P9 clock hour hand: brass spade hand, separate sprite pivoted at base', true, { w: 512, h: 512 }],
  ['puz-p9-hand-minute', 'scn-station', ['S25'], 'P9 clock minute hand: longer brass hand, separate sprite pivoted at base', true, { w: 512, h: 512 }],
];
// P3 cargo cards derive from existing prop sprites
const P3_CARGO = ['crate', 'barrel', 'sack', 'anchor', 'net', 'rope', 'bell', 'lantern'];

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------
const assets = [];
const ids = new Set();

function add(rec) {
  if (ids.has(rec.assetId)) throw new Error(`duplicate assetId: ${rec.assetId}`);
  for (const k of ['assetId', 'type', 'sceneId', 'semanticConcept', 'description', 'artRequirements', 'generatedPath', 'status', 'qaStatus']) {
    if (rec[k] === undefined || rec[k] === null || rec[k] === '') throw new Error(`missing ${k} on ${rec.assetId}`);
  }
  if (!rec.targetDimensions?.width || !rec.targetDimensions?.height) throw new Error(`missing dims on ${rec.assetId}`);
  ids.add(rec.assetId);
  assets.push(rec);
}

const base = (over) => ({
  status: 'pending',
  qaStatus: 'pending',
  rounds: [],
  priority: 'P1',
  batch: '99-misc',
  negativePrompt: 'standard',
  ...over,
});

// --- concept → scenes map from the runtime authoring tables --------------------
const conceptScenes = new Map(); // conceptId -> [sceneId,...] in authored order
for (const s of SCENES) for (const [cid] of s.concepts) {
  if (!conceptScenes.has(cid)) conceptScenes.set(cid, []);
  conceptScenes.get(cid).push(s.id);
}
for (const v of VARIANTS) for (const [cid] of v.addConcepts) {
  if (!conceptScenes.has(cid)) conceptScenes.set(cid, []);
  if (!conceptScenes.get(cid).includes(v.id)) conceptScenes.get(cid).push(v.id);
}

const roundsOf = (sceneIds) => {
  const r = new Set();
  for (const sid of sceneIds) for (const rd of SCENE_INFO[sid]?.rounds ?? []) r.add(rd);
  return [...r].sort();
};

// --- 1) references & painting suite -------------------------------------------
for (const [id, desc] of MOTIF_REFS) {
  add(base({
    assetId: id,
    type: 'reference-sheet',
    sceneId: 'global',
    semanticConcept: `motif:${id.replace('ref-', '')}`,
    description: desc,
    artRequirements: `${GLOBAL_STYLE}; production reference sheet — pictographic motif study, single motif, three material treatments allowed on ONE sheet (reference exception to the one-subject law); no readable text`,
    transparentBackground: false,
    targetDimensions: { width: 1536, height: 1024 },
    generatedPath: `public/assets/paintings/${id}.webp`,
    priority: 'P0',
    batch: '01-references',
  }));
}
for (const [id, desc, transparent, dims] of PAINTING_SUITE) {
  add(base({
    assetId: id,
    type: id.startsWith('pnt') ? 'painting-suite' : id.startsWith('ref') ? 'reference-sheet' : 'prop-sprite',
    sceneId: 'global',
    semanticConcept: `painting:${id}`,
    description: desc,
    artRequirements: id.startsWith('prop')
      ? `${GLOBAL_STYLE}; ${PROP_CAMERA}`
      : `${GLOBAL_STYLE}; hero painting-suite asset; master-derives-copies law (ART_BIBLE \u00a710): generate pnt-master first, derive pnt-copy/study/photo/rooftop states by edit passes, NEVER independent generation; North Mole rule enforced per ref-north-mole`,
    transparentBackground: transparent,
    targetDimensions: { width: dims.w, height: dims.h },
    generatedPath: `public/assets/paintings/${id}.webp`,
    priority: 'P0',
    batch: '02-painting-suite',
    negativePrompt: id.startsWith('prop') ? 'prop' : 'standard',
  }));
}

// --- 2) scene plates ------------------------------------------------------------
const allScenes = [...SCENES.map((s) => ({ id: s.id, name: s.name, light: s.light })), ...VARIANTS.map((v) => ({ id: v.id, name: v.name, light: v.light }))];
for (const s of allScenes) {
  const info = SCENE_INFO[s.id];
  if (!info) throw new Error(`no SCENE_INFO for ${s.id}`);
  add(base({
    assetId: `plate-${s.id}`,
    type: 'scene-plate',
    sceneId: s.id,
    rounds: info.rounds,
    semanticConcept: `scene:${s.id}`,
    description: `Background plate — ${info.title}. ${info.comp}`,
    artRequirements: `${GLOBAL_STYLE}; ${PLATE_RULES}; LIGHTING ${LIGHT[s.light]}; loose confident background brushwork, soft edges, atmospheric perspective; detail dissolves gracefully at distance`,
    transparentBackground: false,
    targetDimensions: { width: 3840, height: 2160 },
    generatedPath: `public/assets/scenes/${s.id}.webp`,
    priority: 'P0',
    batch: '03-scene-plates',
  }));
}

// --- 3) clue close-ups -----------------------------------------------------------
for (const [id, round, sceneId, cam, desc] of CLOSEUPS) {
  add(base({
    assetId: id,
    type: 'clue-closeup',
    sceneId,
    rounds: [round],
    semanticConcept: `clue:${id.split('-')[1].toUpperCase()}`,
    description: desc,
    artRequirements: `${GLOBAL_STYLE}; ${cam === 'doc' ? CLOSEUP_DOC_CAMERA : CLOSEUP_OBJ_CAMERA}; the most-rendered image class in the game — evidence deserves macro fidelity; all real text is typography overlay (ART_BIBLE \u00a78)`,
    transparentBackground: false,
    targetDimensions: { width: 1920, height: 1440 },
    generatedPath: `public/assets/clues/${id}.webp`,
    priority: 'P0',
    batch: '04-clue-closeups',
  }));
}

// --- 4) prop sprites (runtime contract: /assets/props/prop-<concept>.webp) ------
const conceptGloss = new Map(ROWS.map((r) => [r[0], { gloss: r[1], domain: r[2] }]));
for (const [cid, meta] of conceptGloss) {
  const scenes = conceptScenes.get(cid) ?? [];
  const sceneId = scenes[0] ?? 'global';
  const txt = TXT_CONCEPTS.has(cid)
    ? ' TEXT-BEARING prop: any lettering GREEKED (illegible painterly letterforms); declare a quiet, flat, evenly-lit text zone for the typography overlay.'
    : '';
  const desc = CONCEPT_DESC[cid]
    ?? `Prop sprite: ${meta.gloss} — the most-typical 1927 visual exemplar of the concept (Fairness Charter #7); used and worn, never new; domain: ${meta.domain}.`;
  add(base({
    assetId: `prop-${cid}`,
    type: 'prop-sprite',
    sceneId,
    scenes,
    rounds: roundsOf(scenes),
    semanticConcept: `object:${cid}`,
    description: desc + txt,
    artRequirements: `${GLOBAL_STYLE}; ${PROP_CAMERA}`,
    transparentBackground: true,
    targetDimensions: { width: 1024, height: 1024 },
    generatedPath: `public/assets/props/prop-${cid}.webp`,
    priority: 'P0',
    batch: '05-prop-sprites',
    negativePrompt: 'prop',
  }));
}
// plural pose/wear variants (ART §7.4 — instances must read as individuals, not stamps)
for (const [cid, extra] of Object.entries(PLURAL_VARIANTS)) {
  if (!conceptGloss.has(cid)) throw new Error(`plural variant for unknown concept ${cid}`);
  const scenes = conceptScenes.get(cid) ?? [];
  for (let i = 0; i < extra; i++) {
    const suffix = ['b', 'c'][i];
    add(base({
      assetId: `prop-${cid}-${suffix}`,
      type: 'prop-sprite',
      sceneId: scenes[0] ?? 'global',
      scenes,
      rounds: roundsOf(scenes),
      semanticConcept: `object:${cid}`,
      description: `Pose/wear variant ${suffix.toUpperCase()} of prop-${cid} for multi-find plural rounds — distinctly different pose, wear and dressing, IDENTICAL concept-typical silhouette family (never a different object). Wire into scene JSON via the per-prop "sprite" field.`,
      artRequirements: `${GLOBAL_STYLE}; ${PROP_CAMERA}; variant discipline: change dressing and pose, never the concept\u2019s typical silhouette`,
      transparentBackground: true,
      targetDimensions: { width: 1024, height: 1024 },
      generatedPath: `public/assets/props/prop-${cid}-${suffix}.webp`,
      priority: 'P2',
      batch: '05-prop-sprites',
      negativePrompt: 'prop',
    }));
  }
}
// ambience sprites (runtime keys amb-1..4)
const AMB = [
  'Ambience sprite 1: a soft drift of packing straw — untagged dressing, one edge-step softer than tagged props, never mimicking a taught silhouette',
  'Ambience sprite 2: a stack of weathered folded burlap — untagged dressing, soft-edged',
  'Ambience sprite 3: scattered brown autumn leaves, a small drift — untagged dressing, soft-edged',
  'Ambience sprite 4: a loose coil of old twine and paper scraps — untagged dressing, soft-edged, non-teasing',
];
AMB.forEach((desc, i) => {
  add(base({
    assetId: `amb-${i + 1}`,
    type: 'prop-sprite',
    sceneId: 'global',
    semanticConcept: 'untagged:ambience',
    description: desc,
    artRequirements: `${GLOBAL_STYLE}; ${PROP_CAMERA}; ambience discipline (ART \u00a77.5): read \u2265 1 edge-step softer than tagged props`,
    transparentBackground: true,
    targetDimensions: { width: 1024, height: 1024 },
    generatedPath: `public/assets/props/amb-${i + 1}.webp`,
    priority: 'P0',
    batch: '05-prop-sprites',
    negativePrompt: 'prop',
  }));
});
// evidence sprites (runtime keys evid-cNN)
for (const [clueId, [desc, sceneId]] of Object.entries(EVIDENCE_SPRITES)) {
  const key = `evid-${clueId.toLowerCase()}`;
  add(base({
    assetId: key,
    type: 'evidence-sprite',
    sceneId,
    rounds: SCENE_INFO[sceneId].rounds,
    clueId,
    semanticConcept: `clue:${clueId}`,
    description: `In-scene evidence prop (visually distinct + narratively cued per GDD \u00a77.2: slightly warmer local key feel, cleaner edge than neighbors — but still NO baked scene light): ${desc}`,
    artRequirements: `${GLOBAL_STYLE}; ${PROP_CAMERA}; evidence prop: crisp, findable with zero language knowledge; text zones greeked + quiet for overlay`,
    transparentBackground: true,
    targetDimensions: { width: 1024, height: 1024 },
    generatedPath: `public/assets/props/${key}.webp`,
    priority: 'P0',
    batch: '05-prop-sprites',
    negativePrompt: 'prop',
  }));
}

// --- 5) character portraits -----------------------------------------------------
for (const [id, character, tokenKey, accent, desc, flags] of PORTRAITS) {
  add(base({
    assetId: `portrait-${id}`,
    type: 'character-portrait',
    sceneId: 'global',
    semanticConcept: `character:${tokenKey}`,
    character,
    description: `${character} — ${desc}`,
    artRequirements: `${GLOBAL_STYLE}; ${PORTRAIT_CAMERA}; accent backdrop family: ${accent}; TOKEN BLOCK (paste verbatim, never paraphrase): "${TOKEN[tokenKey]}"; one character per image, always; generate the character\u2019s REF portrait first and match the approved face${flags.includes('no-mirror') ? '; NO-MIRROR flag: engine must never flip this art' : ''}`,
    transparentBackground: false,
    targetDimensions: { width: 1024, height: 1280 },
    generatedPath: `public/assets/characters/${tokenKey}/${id}.webp`,
    priority: 'P1',
    batch: '06-character-portraits',
    negativePrompt: 'portrait',
  }));
}
for (const [id, desc] of HALLOWAY_HANDS) {
  add(base({
    assetId: id,
    type: 'character-portrait',
    sceneId: 'global',
    semanticConcept: 'character:halloway',
    character: 'Wren Halloway',
    description: desc,
    artRequirements: `${GLOBAL_STYLE}; close framing on hands/back only; TOKEN BLOCK (verbatim): "${TOKEN.halloway}"; PRESENTATION LAW: never show Halloway\u2019s face, never imply gender; bare hands (no gloves — distinguishes Halloway from Ottilie); no rings, no polish`,
    transparentBackground: false,
    targetDimensions: { width: 1280, height: 960 },
    generatedPath: `public/assets/characters/halloway/${id}.webp`,
    priority: 'P1',
    batch: '06-character-portraits',
    negativePrompt: 'portrait',
  }));
}
// in-scene overlays
for (const [id, sceneId, desc] of OVERLAYS) {
  add(base({
    assetId: id,
    type: 'character-overlay',
    sceneId,
    rounds: SCENE_INFO[sceneId]?.rounds ?? [],
    semanticConcept: `character:${id.replace('overlay-', '')}`,
    description: desc,
    artRequirements: `${GLOBAL_STYLE}; full or three-quarter figure, in-scene overlay sprite; soft-edged (rendered softer than findable props — non-speakers are scene dressing with faces); single figure only; clean alpha, no baked scene light; grade into the scene\u2019s light state happens in the light pass`,
    transparentBackground: true,
    targetDimensions: { width: 1024, height: 1536 },
    generatedPath: `public/assets/characters/overlays/${id}.webp`,
    priority: 'P1',
    batch: '07-character-overlays',
    negativePrompt: 'standard',
  }));
}

// --- 6) FX overlays ---------------------------------------------------------------
for (const [id, desc, dims] of FX) {
  add(base({
    assetId: id,
    type: 'fx-overlay',
    sceneId: 'global',
    semanticConcept: `fx:${id.replace('fx-', '')}`,
    description: desc,
    artRequirements: `${GLOBAL_STYLE}; translucent soft painterly FX element on plain dark background for screen/add blend; never crunchy or particle-flat; tileable edges where the element repeats; must remain distinguishable from Hint Gold #F5C86E (QA rule)`,
    transparentBackground: true,
    targetDimensions: { width: dims.w, height: dims.h },
    generatedPath: `public/assets/fx/${id}.webp`,
    priority: 'P1',
    batch: '08-fx-overlays',
  }));
}

// --- 7) UI surfaces ----------------------------------------------------------------
for (const [id, desc, transparent, dims] of UI) {
  add(base({
    assetId: id,
    type: 'ui-element',
    sceneId: 'global',
    semanticConcept: `ui:${id.replace('ui-', '')}`,
    description: desc,
    artRequirements: `${GLOBAL_STYLE}; art-is-the-UI material rules (UX \u00a719): closed material palette — paper/vellum, pencil/ink, leather, brass, cork, string, chalk, rubber stamp; NO dashboard cards, NO filled-pill buttons; all meaningful wording is typography overlay; gold glow reserved exclusively for the lens family`,
    transparentBackground: transparent,
    targetDimensions: { width: dims.w, height: dims.h },
    generatedPath: `public/assets/ui/${id}.webp`,
    priority: 'P1',
    batch: '09-ui-surfaces',
  }));
}

// --- 8) story / beat illustrations ---------------------------------------------------
for (const [id, sceneId, rounds, desc] of STORY_ART) {
  add(base({
    assetId: id,
    type: 'beat-illustration',
    sceneId,
    rounds,
    semanticConcept: `story:${id.replace('story-', '')}`,
    description: desc,
    artRequirements: `${GLOBAL_STYLE}; illustrated story panel; single character maximum per image (hard law); respect character token blocks, glove/no-glove law, left-hand law and no-mirror flags; caption/title zones kept quiet and flat for typography overlay; scene lighting state of the host location applies`,
    transparentBackground: false,
    targetDimensions: { width: 1920, height: 1080 },
    generatedPath: `public/assets/story/${id}.webp`,
    priority: 'P1',
    batch: '10-story-beats',
  }));
}

// --- 9) puzzle art --------------------------------------------------------------------
for (const [id, sceneId, rounds, desc, transparent, dims] of PUZZLES) {
  add(base({
    assetId: id,
    type: 'puzzle-art',
    sceneId,
    rounds,
    semanticConcept: `puzzle:${id.split('-')[1]}`,
    description: desc,
    artRequirements: `${GLOBAL_STYLE}; puzzle-shell framing (UX \u00a714.3): the puzzle object on a desk/bench close-up; all digits/letters pictographic or greeked — real glyphs are UI overlays; no timers, no move counters painted`,
    transparentBackground: transparent,
    targetDimensions: { width: dims.w, height: dims.h },
    generatedPath: `public/assets/puzzles/${id}.webp`,
    priority: 'P1',
    batch: '11-puzzle-art',
  }));
}
for (const cid of P3_CARGO) {
  add(base({
    assetId: `puz-p3-cargo-${cid}`,
    type: 'puzzle-art',
    sceneId: 'scn-warehouse',
    rounds: ['S09'],
    semanticConcept: `object:${cid}`,
    description: `P3 pairs-board cargo image card: ${cid} — DERIVE from prop-${cid} (crop onto a paper card backing); do not regenerate the object`,
    artRequirements: 'DERIVED ASSET: composite prop sprite onto ui-word-chip-style paper card; no new generation of the object itself',
    transparentBackground: true,
    targetDimensions: { width: 512, height: 512 },
    generatedPath: `public/assets/puzzles/puz-p3-cargo-${cid}.webp`,
    priority: 'P2',
    batch: '11-puzzle-art',
    derivedFrom: `prop-${cid}`,
  }));
}

// --- 10) generic concept thumbnails (WORDS tab / gloss cards, GDD §9.1: never the scene prop) ---
for (const [cid, meta] of conceptGloss) {
  add(base({
    assetId: `thumb-${cid}`,
    type: 'ui-thumbnail',
    sceneId: 'global',
    semanticConcept: `object:${cid}`,
    description: `Generic concept thumbnail for \u201c${meta.gloss}\u201d — a drawn \u201cany ${meta.gloss}\u201d icon for the WORDS tab and gloss cards; deliberately GENERIC, never the scene\u2019s actual prop sprite (GDD \u00a79.1); naturalist\u2019s-journal ink-and-wash miniature on paper tone`,
    artRequirements: `${GLOBAL_STYLE}; small ink-and-wash naturalist\u2019s-journal study, single object, centered, generic exemplar, paper-tone background, no scene context`,
    transparentBackground: true,
    targetDimensions: { width: 512, height: 512 },
    generatedPath: `public/assets/ui/thumbs/${cid}.webp`,
    priority: 'P2',
    batch: '12-concept-thumbnails',
  }));
}

// ---------------------------------------------------------------------------
// Verification & write
// ---------------------------------------------------------------------------
const ALL_ROUNDS = Array.from({ length: 29 }, (_, i) => `S${String(i).padStart(2, '0')}`);
const covered = new Set(assets.flatMap((a) => a.rounds ?? []));
const missingRounds = ALL_ROUNDS.filter((r) => !covered.has(r));
if (missingRounds.length) throw new Error(`rounds not covered: ${missingRounds.join(', ')}`);

const byType = {};
const byBatch = {};
for (const a of assets) {
  byType[a.type] = (byType[a.type] ?? 0) + 1;
  byBatch[a.batch] = (byBatch[a.batch] ?? 0) + 1;
}

const manifest = {
  meta: {
    project: 'Case & Seek',
    season: 'Season One — The Hollow Frame (Marlowe Bay, 1927)',
    manifestVersion: '1.0.0',
    generator: 'tools/generate-assets-manifest.mjs (re-run to regenerate; hand-edit statuses only)',
    generatedAt: new Date().toISOString().slice(0, 10),
    purpose: 'Complete machine-readable production plan for SOL MAX FAST one-by-one image generation. One asset per generation, always (ART_BIBLE \u00a713.1).',
    sources: [
      'docs/ART_BIBLE.md', 'docs/SCENE_COMPOSITION.md', 'docs/GAME_DESIGN.md',
      'docs/STORY_BIBLE.md', 'docs/UX_SPEC.md', 'content/story/',
      'tools/gen/vocab-data.mjs', 'tools/gen/scene-data.mjs',
    ],
    totals: { assets: assets.length, byType, byBatch },
    roundCoverage: ALL_ROUNDS,
    conventions: {
      pathContract: 'Engine loads props from /assets/props/<assetId>.webp (public/assets/props/), scene plates from /assets/scenes/<sceneId>.webp, story art from /assets/story/. Generate at targetDimensions, convert to webp, save to generatedPath; the running game hot-swaps its generated stand-ins the moment files exist.',
      generationOrder: 'Follow the batch field (ART_BIBLE \u00a713.4): references \u2192 painting suite (master FIRST, then derivations) \u2192 scene plates \u2192 clue close-ups \u2192 prop sprites (family-batched) \u2192 portraits (ref first per character) \u2192 overlays \u2192 FX \u2192 UI \u2192 story \u2192 puzzles \u2192 thumbnails. One scene fully closed before the next opens where practical.',
      priorities: 'P0 = runtime-critical + hero suite. P1 = design-mandated near-term (portraits, close-ups, UI, FX, story, puzzles). P2 = enrichment (plural pose variants, derived cards, thumbnails).',
      globalStyleBlock: GLOBAL_STYLE,
      negativePrompts: { standard: NEGATIVE_STANDARD, prop: NEG_PROP, portrait: NEG_PORTRAIT },
      transparency: 'transparentBackground=true assets are generated on a plain warm-grey backdrop and cut to alpha in post (background removal); hit shapes derive from the alpha (GDD \u00a77.1). Never bake cast shadows or scene light into sprites.',
      statusValues: { status: ['pending', 'generated', 'regenerating', 'final'], qaStatus: ['pending', 'passed', 'failed-style', 'failed-text', 'failed-silhouette', 'failed-continuity', 'failed-palette'] },
      qaGates: 'ART_BIBLE \u00a714: style, palette-state histogram, 10%-scale silhouette (props), semantic typicality, zero readable words, single subject, continuity (token blocks, left-hand law, glove law, North Mole presence/absence, reserved colors), fairness handoff.',
      reservedColors: 'Vane Green #5E7C3F only in: pnt-* suite foliage/map, evid-c23, puz-p7-test-card, clue-c23. Nachtigall Grey #B8B2AD only on Ottilie art + evid-c17/clue-c17. Hint Gold #F5C86E is UI-side only and appears in NO generated asset.',
      notGenerated: 'Deliberately absent from this manifest (not image-generation work): typography overlays and all readable text; localized Lantern Quarter signage layers (typography); gender glyphs \u25b2/\u25cf/\u25a0 (UI vectors); per-scene light passes and grading (comp pipeline); alpha masks (build pipeline); audio; the CASE & SEEK logotype (type treatment); per-scene palette test cards (transient QA artifacts).',
    },
  },
  assets,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(manifest, null, 1) + '\n');
console.log(`wrote content/assets-manifest.json — ${assets.length} assets`);
console.log('byType:', JSON.stringify(byType, null, 1));
console.log('byBatch:', JSON.stringify(byBatch, null, 1));
console.log('round coverage: OK (S00–S28 all covered)');
