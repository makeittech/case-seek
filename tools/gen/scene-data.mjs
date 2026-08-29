/**
 * Scene composition table. The generator lays props out deterministically
 * (seeded) across fg/mg/bg bands; real art swaps in via /assets/props/*.webp
 * and /assets/scenes/*.webp without touching this data's semantics.
 *
 * concepts: [conceptId, count] — target-capable props (count ≥ plural needs)
 * evidence: [propId, clueId, xFrac, yFrac] — story-object props
 * ambience: number of untagged dressing props
 */

const W = 1920;
const H = 1080;

export const SCENE_SIZE = { w: W, h: H };

export const SCENES = [
  {
    id: 'scn-office',
    name: "Detective's Office",
    locationId: 'office',
    light: 'day',
    palette: {
      wallTop: '#5a4632', wallBottom: '#7a6142', floor: '#4a3826', accent: '#b98a44',
      motifs: [
        { kind: 'window', x: 1350, y: 120, w: 340, h: 420, color: '#c9b98a', alpha: 0.9 },
        { kind: 'rect', x: 150, y: 180, w: 420, h: 380, color: '#3c2f1f', alpha: 0.8 },
        { kind: 'beam', x: 0, y: 60, w: W, h: 26, color: '#332818', alpha: 0.7 },
      ],
    },
    concepts: [
      ['key', 1], ['notebook', 1], ['magnifier', 1], ['coat', 1], ['hat', 1], ['lamp', 1],
      ['cup', 1], ['umbrella', 1], ['map', 1], ['cat', 1], ['string', 1], ['calendar', 1],
    ],
    evidence: [['ev-s00-pass', 'C00', 0.62, 0.72]],
    ambience: 6,
  },
  {
    id: 'scn-gallery-day',
    name: 'Museum Gallery',
    locationId: 'gallery',
    light: 'day',
    palette: {
      wallTop: '#6e6252', wallBottom: '#8d7f68', floor: '#5c4c38', accent: '#caa64f',
      motifs: [
        { kind: 'arch', x: 300, y: 80, w: 380, h: 560, color: '#57493a', alpha: 0.85 },
        { kind: 'arch', x: 1240, y: 80, w: 380, h: 560, color: '#57493a', alpha: 0.85 },
        { kind: 'rect', x: 820, y: 130, w: 300, h: 380, color: '#2f2a22', alpha: 0.95 },
      ],
    },
    concepts: [
      ['frame', 1], ['rope', 1], ['crate', 2], ['ladder', 1], ['glove', 1], ['screwdriver', 1],
      ['label', 1], ['bench', 1], ['chandelier', 1], ['dust-sheet', 1], ['candelabra', 1],
      ['key', 1], ['lantern', 1],
    ],
    evidence: [['ev-s01-screw', 'C01', 0.47, 0.66]],
    ambience: 7,
  },
  {
    id: 'scn-curators-office',
    name: "Curator's Office",
    locationId: 'curators-office',
    light: 'day',
    palette: {
      wallTop: '#4c5340', wallBottom: '#6a7157', floor: '#4c3d2b', accent: '#a9954e',
      motifs: [
        { kind: 'window', x: 1420, y: 130, w: 300, h: 400, color: '#cfd6ae', alpha: 0.85 },
        { kind: 'rect', x: 180, y: 150, w: 520, h: 420, color: '#3a4030', alpha: 0.8 },
      ],
    },
    concepts: [
      ['ledger', 1], ['teacup', 1], ['envelope', 1], ['rubber-stamp', 1], ['inkwell', 1],
      ['scissors', 1], ['folder', 1], ['monocle', 1], ['telephone', 1],
      ['blotter', 1], ['candle', 1], ['sealing-wax', 1], ['letter-opener', 1], ['calendar', 1],
      ['drawer', 1], ['photograph', 1], ['ribbon', 1], ['clock', 1], ['key', 1], ['lamp', 1],
    ],
    evidence: [
      ['ev-s02-file', 'C02', 0.4, 0.7],
      ['ev-s03-blotter', 'C03', 0.58, 0.75],
    ],
    ambience: 6,
  },
  {
    id: 'scn-archives',
    name: 'Museum Archives',
    locationId: 'archives',
    light: 'lamplit',
    palette: {
      wallTop: '#3a3226', wallBottom: '#514534', floor: '#39301f', accent: '#c69a3f',
      motifs: [
        { kind: 'rect', x: 100, y: 90, w: 480, h: 520, color: '#2c2517', alpha: 0.9 },
        { kind: 'rect', x: 1340, y: 90, w: 480, h: 520, color: '#2c2517', alpha: 0.9 },
        { kind: 'beam', x: 0, y: 70, w: W, h: 30, color: '#211a10', alpha: 0.85 },
      ],
    },
    concepts: [
      ['blueprint', 1], ['newspaper', 1], ['map', 1], ['box', 2], ['lantern', 1], ['brush', 1],
      ['ink', 1], ['stool', 1], ['string', 1], ['magnet', 1],
      ['register', 1], ['card-index', 1], ['portrait', 1], ['ruler', 1], ['compass', 1],
      ['sextant', 1], ['gazette', 1], ['folder', 3], ['rubber-stamp', 1], ['letter', 1],
      ['manifest', 1], ['seal', 1],
    ],
    evidence: [
      ['ev-s04-blueprint', 'C04', 0.5, 0.62],
      ['ev-s21-minute', 'C26', 0.68, 0.7],
    ],
    ambience: 7,
  },
  {
    id: 'scn-docks-day',
    name: 'Harbor Docks',
    locationId: 'docks',
    light: 'day',
    palette: {
      wallTop: '#7e93a3', wallBottom: '#a3b2ba', floor: '#5d564a', accent: '#b8743a',
      motifs: [
        { kind: 'rect', x: 60, y: 250, w: 560, h: 340, color: '#4d5a63', alpha: 0.8 },
        { kind: 'ellipse', x: 1380, y: 160, w: 420, h: 180, color: '#c9d4da', alpha: 0.55 },
        { kind: 'beam', x: 0, y: 620, w: W, h: 34, color: '#3d382e', alpha: 0.9 },
      ],
    },
    concepts: [
      ['seagull', 3], ['anchor', 1], ['barrel', 2], ['hook', 1], ['net', 1], ['bell', 1],
      ['bollard', 1], ['chain', 1], ['crate', 2], ['rope', 1], ['lantern', 1], ['sack', 1],
    ],
    evidence: [['ev-s05-ledger', 'C08', 0.34, 0.74]],
    ambience: 7,
  },
  {
    id: 'scn-tavern',
    name: 'The Rusty Anchor',
    locationId: 'tavern',
    light: 'evening',
    palette: {
      wallTop: '#4a3220', wallBottom: '#63452b', floor: '#3b2b1a', accent: '#c98a3b',
      motifs: [
        { kind: 'window', x: 200, y: 150, w: 260, h: 300, color: '#e2a44e', alpha: 0.7 },
        { kind: 'beam', x: 0, y: 100, w: W, h: 34, color: '#2c1f11', alpha: 0.9 },
        { kind: 'rect', x: 1200, y: 200, w: 620, h: 380, color: '#31241485', alpha: 0.8 },
      ],
    },
    concepts: [
      ['bottle', 3], ['tankard', 1], ['dartboard', 1], ['chalk', 1], ['bread', 1], ['cheese', 1],
      ['playing-card', 1], ['kettle', 1], ['pipe', 1],
      ['logbook', 1], ['apron', 1], ['mousetrap', 1], ['jug', 1], ['broom', 1], ['coin', 1],
      ['match', 1], ['towel', 1], ['key', 2], ['barrel', 1], ['clock', 1], ['lamp', 1],
      ['crate', 1], ['stool', 1], ['candle', 1],
    ],
    evidence: [
      ['ev-s06-slate', 'C09', 0.7, 0.55],
      ['ev-s08-logbook', 'C12', 0.28, 0.78],
    ],
    ambience: 6,
  },
  {
    id: 'scn-warehouse',
    name: 'Customs Warehouse',
    locationId: 'warehouse',
    light: 'lamplit',
    palette: {
      wallTop: '#3c4148', wallBottom: '#565c63', floor: '#3a362d', accent: '#c0913e',
      motifs: [
        { kind: 'rect', x: 120, y: 120, w: 540, h: 480, color: '#2e3237', alpha: 0.9 },
        { kind: 'rect', x: 1300, y: 160, w: 500, h: 440, color: '#2e3237', alpha: 0.9 },
        { kind: 'window', x: 860, y: 90, w: 220, h: 200, color: '#8fa1b5', alpha: 0.5 },
      ],
    },
    concepts: [
      ['scale', 1], ['twine', 1], ['funnel', 1], ['typewriter', 1], ['sack', 2], ['tea-chest', 1],
      ['birdcage', 1], ['hand-truck', 1], ['seal', 1], ['rubber-stamp', 2], ['umbrella', 1],
      ['bell', 1], ['crate', 2], ['barrel', 1], ['ledger', 1], ['padlock', 1],
    ],
    evidence: [['ev-s09-stamp', 'C13', 0.55, 0.68]],
    ambience: 8,
  },
  {
    id: 'scn-hotel-lobby',
    name: 'Grand Hotel Lobby',
    locationId: 'hotel-lobby',
    light: 'day',
    palette: {
      wallTop: '#6d5a4a', wallBottom: '#8f7a64', floor: '#6b3f2e', accent: '#d4af5a',
      motifs: [
        { kind: 'arch', x: 220, y: 70, w: 420, h: 580, color: '#5b4a3b', alpha: 0.9 },
        { kind: 'arch', x: 1280, y: 70, w: 420, h: 580, color: '#5b4a3b', alpha: 0.9 },
        { kind: 'ellipse', x: 810, y: 700, w: 340, h: 90, color: '#7c2d24', alpha: 0.75 },
      ],
    },
    concepts: [
      ['suitcase', 2], ['palm', 1], ['cane', 1], ['hatbox', 1], ['key-rack', 1], ['ashtray', 1],
      ['tray', 1], ['champagne-bucket', 1], ['umbrella-stand', 1], ['luggage-cart', 1],
      ['letter', 1], ['carnation', 1], ['cigarette-case', 1], ['saucer', 1],
      ['newspaper', 1], ['telephone', 1], ['bell', 1], ['coat', 1], ['lamp', 1], ['glove', 1],
    ],
    evidence: [
      ['ev-s10-register', 'C14', 0.5, 0.72],
      ['ev-s12-note', 'C17', 0.64, 0.6],
    ],
    ambience: 7,
  },
  {
    id: 'scn-shop-day',
    name: "Casal's Antique Shop",
    locationId: 'shop',
    light: 'day',
    palette: {
      wallTop: '#503c2c', wallBottom: '#6e553c', floor: '#443122', accent: '#c99e46',
      motifs: [
        { kind: 'rect', x: 130, y: 130, w: 500, h: 460, color: '#3c2d1f', alpha: 0.9 },
        { kind: 'rect', x: 1320, y: 130, w: 480, h: 460, color: '#3c2d1f', alpha: 0.9 },
        { kind: 'window', x: 850, y: 100, w: 250, h: 240, color: '#d8c896', alpha: 0.6 },
      ],
    },
    concepts: [
      ['candlestick', 2], ['violin', 1], ['globe', 1], ['mirror', 1], ['vase', 1], ['medal', 1],
      ['fan', 1], ['chessboard', 1], ['stamp-die', 1], ['telescope', 1],
      ['ledger', 1], ['clock', 1], ['lamp', 1], ['fountain-pen', 1], ['teacup', 1],
    ],
    evidence: [['ev-s11-die', 'C15', 0.44, 0.64]],
    ambience: 8,
  },
  {
    id: 'scn-suite-412',
    name: 'Hotel Suite 412',
    locationId: 'suite',
    light: 'day',
    palette: {
      wallTop: '#5d5348', wallBottom: '#7c6f60', floor: '#54402f', accent: '#b99a55',
      motifs: [
        { kind: 'window', x: 1380, y: 120, w: 340, h: 430, color: '#cfd4c2', alpha: 0.85 },
        { kind: 'rect', x: 190, y: 200, w: 460, h: 360, color: '#453a2e', alpha: 0.85 },
      ],
    },
    concepts: [
      ['cufflink', 1], ['razor', 1], ['shoehorn', 1], ['pocket-watch', 1], ['decanter', 1],
      ['slipper', 1], ['cravat', 1], ['travel-case', 1], ['fountain-pen', 1],
      ['photograph', 1], ['mirror', 1], ['suitcase', 1], ['letter', 1],
    ],
    evidence: [['ev-s13-telegram', 'C18', 0.68, 0.68]],
    ambience: 6,
  },
  {
    id: 'scn-night-market',
    name: 'Night Market',
    locationId: 'market',
    light: 'night-lantern',
    palette: {
      wallTop: '#1d2340', wallBottom: '#2c3355', floor: '#231d33', accent: '#e8a53d',
      motifs: [
        { kind: 'rect', x: 140, y: 200, w: 520, h: 380, color: '#402f52', alpha: 0.85 },
        { kind: 'rect', x: 1260, y: 200, w: 520, h: 380, color: '#52302f', alpha: 0.85 },
        { kind: 'ellipse', x: 760, y: 120, w: 400, h: 130, color: '#e8a53d', alpha: 0.18 },
      ],
    },
    concepts: [
      ['orange', 3], ['scarf', 1], ['basket', 1], ['garlic', 1], ['pepper', 1], ['fish', 1],
      ['teapot', 1], ['drum', 1],
      ['jar', 1], ['cloth-bolt', 1], ['thimble', 1], ['button', 1], ['mortar', 1], ['bead', 1],
      ['loom', 1], ['oil-flask', 1], ['easel', 1], ['brush', 2],
      ['lantern', 2], ['cheese', 1], ['scale', 1], ['candle', 1], ['ribbon', 1],
    ],
    evidence: [
      ['ev-s14-lantern', 'C19', 0.52, 0.5],
      ['ev-s15-orderbook', 'C20', 0.38, 0.76],
    ],
    ambience: 7,
  },
  {
    id: 'scn-tram-depot',
    name: 'Tram Depot',
    locationId: 'depot',
    light: 'night',
    palette: {
      wallTop: '#242a30', wallBottom: '#343c44', floor: '#2a261e', accent: '#c78f3c',
      motifs: [
        { kind: 'rect', x: 200, y: 160, w: 700, h: 420, color: '#1c2126', alpha: 0.9 },
        { kind: 'beam', x: 0, y: 600, w: W, h: 40, color: '#15181c', alpha: 0.95 },
        { kind: 'window', x: 1450, y: 140, w: 260, h: 280, color: '#54636f', alpha: 0.5 },
      ],
    },
    concepts: [
      ['wrench', 1], ['oilcan', 1], ['timetable', 1], ['ticket', 3], ['signal-lamp', 1],
      ['toolbox', 1], ['gear', 1], ['cap', 1], ['waybill', 1],
      ['bench', 1], ['whistle', 1], ['lantern', 1], ['chain', 1],
    ],
    evidence: [['ev-s16-waybill', 'C21', 0.6, 0.66]],
    ambience: 7,
  },
  {
    id: 'scn-loft',
    name: "Artist's Loft",
    locationId: 'loft',
    light: 'dawn',
    palette: {
      wallTop: '#7a6a71', wallBottom: '#95837f', floor: '#5c4a3c', accent: '#d9a05b',
      motifs: [
        { kind: 'window', x: 760, y: 60, w: 420, h: 320, color: '#e8c9d8', alpha: 0.75 },
        { kind: 'beam', x: 0, y: 50, w: W, h: 26, color: '#4a3c40', alpha: 0.8 },
        { kind: 'rect', x: 1360, y: 260, w: 440, h: 340, color: '#67555a', alpha: 0.7 },
      ],
    },
    concepts: [
      ['palette', 1], ['rag', 1], ['window-pole', 1], ['smock', 1], ['charcoal', 1],
      ['laundry-line', 1], ['stove', 1], ['sketchbook', 1],
      ['pestle', 1], ['beeswax', 1], ['palette-knife', 1], ['jar', 3], ['oil-flask', 1],
      ['funnel', 1], ['label', 1], ['twine', 1], ['apron', 1], ['magnifier', 1],
      ['notebook', 1], ['crate', 1], ['kettle', 1], ['mirror', 1], ['scale', 1], ['easel', 1],
    ],
    evidence: [
      ['ev-s17-cartoon', 'C22', 0.42, 0.58],
      ['ev-s18-pigment', 'C23', 0.66, 0.72],
    ],
    ambience: 6,
  },
  {
    id: 'scn-auction-house',
    name: 'Auction House',
    locationId: 'auction',
    light: 'evening',
    palette: {
      wallTop: '#4d3b33', wallBottom: '#6b5347', floor: '#4f2e26', accent: '#d8b25c',
      motifs: [
        { kind: 'arch', x: 760, y: 70, w: 400, h: 560, color: '#3d2e28', alpha: 0.9 },
        { kind: 'rect', x: 170, y: 190, w: 460, h: 400, color: '#392b25', alpha: 0.85 },
        { kind: 'rect', x: 1330, y: 190, w: 440, h: 400, color: '#392b25', alpha: 0.85 },
      ],
    },
    concepts: [
      ['gavel', 1], ['paddle', 1], ['cushion', 1], ['catalogue', 1], ['candelabra', 1],
      ['frame', 1], ['magnifier', 1], ['pocket-watch', 1], ['rope', 1], ['inkwell', 1], ['easel', 1],
      ['trolley', 1], ['blanket', 1], ['telegram-form', 1], ['stencil', 1], ['cashbox', 1],
      ['label', 3], ['crate', 1], ['ledger', 1], ['seal', 1], ['brush', 1], ['scissors', 1], ['lamp', 1],
    ],
    evidence: [
      ['ev-s19-study', 'C24', 0.5, 0.44],
      ['ev-s20-ledger', 'C25', 0.7, 0.74],
    ],
    ambience: 7,
  },
  {
    id: 'scn-conservatory',
    name: 'The Conservatory',
    locationId: 'conservatory',
    light: 'day',
    palette: {
      wallTop: '#87a08b', wallBottom: '#a8bda6', floor: '#66604a', accent: '#71a35e',
      motifs: [
        { kind: 'window', x: 240, y: 80, w: 380, h: 480, color: '#d3e4cf', alpha: 0.7 },
        { kind: 'window', x: 1300, y: 80, w: 380, h: 480, color: '#d3e4cf', alpha: 0.7 },
        { kind: 'arch', x: 780, y: 60, w: 360, h: 560, color: '#7e937b', alpha: 0.7 },
      ],
    },
    concepts: [
      ['flowerpot', 3], ['watering-can', 1], ['orchid', 1], ['trowel', 1], ['thermometer', 1],
      ['shears', 1], ['hose', 1],
      ['birdcage', 1], ['glove', 1], ['bench', 1], ['sketchbook', 1], ['cat', 1],
    ],
    evidence: [['ev-s22-sketchbook', 'C28', 0.56, 0.7]],
    ambience: 6,
  },
  {
    id: 'scn-clocktower',
    name: 'Clocktower Workshop',
    locationId: 'clocktower',
    light: 'lamplit',
    palette: {
      wallTop: '#41372b', wallBottom: '#59503e', floor: '#38301f', accent: '#caa14b',
      motifs: [
        { kind: 'ellipse', x: 800, y: 90, w: 330, h: 330, color: '#d9c47e', alpha: 0.35 },
        { kind: 'rect', x: 170, y: 200, w: 460, h: 380, color: '#332b1e', alpha: 0.85 },
        { kind: 'window', x: 1440, y: 150, w: 280, h: 340, color: '#5d6b80', alpha: 0.5 },
      ],
    },
    concepts: [
      ['pigeon', 1], ['chart-tube', 1], ['brazier', 1], ['trunk', 1], ['gear', 2],
      ['blueprint', 1], ['compass', 1], ['oilcan', 1], ['stool', 1], ['stove', 1],
      ['timetable', 1], ['easel', 1], ['map', 1], ['lantern', 1],
    ],
    evidence: [['ev-s24-stretcher', 'C30', 0.5, 0.6]],
    ambience: 6,
  },
  {
    id: 'scn-station',
    name: 'Central Station',
    locationId: 'station',
    light: 'night',
    palette: {
      wallTop: '#232936', wallBottom: '#38404f', floor: '#2b2a26', accent: '#d3a445',
      motifs: [
        { kind: 'arch', x: 700, y: 40, w: 520, h: 620, color: '#1b202a', alpha: 0.9 },
        { kind: 'ellipse', x: 860, y: 120, w: 200, h: 200, color: '#e7d391', alpha: 0.5 },
        { kind: 'beam', x: 0, y: 640, w: W, h: 30, color: '#14171d', alpha: 0.95 },
      ],
    },
    concepts: [
      ['kiosk', 1], ['pressure-gauge', 1], ['mailbag', 1], ['luggage-tag', 1], ['clock', 2],
      ['bench', 1], ['timetable', 1], ['suitcase', 1], ['whistle', 1], ['ticket', 1],
      ['telegram-form', 1], ['signal-lamp', 1], ['umbrella', 1], ['lantern', 1],
    ],
    evidence: [['ev-s25-counterfoil', 'C32', 0.46, 0.7]],
    ambience: 7,
  },
  {
    id: 'scn-pier',
    name: 'Boathouse & Ferry Pier',
    locationId: 'pier',
    light: 'storm',
    palette: {
      wallTop: '#333d47', wallBottom: '#46525c', floor: '#31383b', accent: '#b98a3c',
      motifs: [
        { kind: 'rect', x: 150, y: 210, w: 560, h: 380, color: '#26303a', alpha: 0.9 },
        { kind: 'ellipse', x: 1350, y: 180, w: 420, h: 150, color: '#5b6a74', alpha: 0.5 },
        { kind: 'beam', x: 0, y: 620, w: W, h: 36, color: '#1c2328', alpha: 0.9 },
      ],
    },
    concepts: [
      ['oar', 2], ['lifebuoy', 1], ['tackle-box', 1], ['rain-hat', 1], ['flare', 1],
      ['barometer', 1], ['tarpaulin', 1], ['lantern', 2], ['rope', 1], ['crate', 1],
      ['bollard', 1], ['net', 1], ['anchor', 1],
    ],
    evidence: [['ev-s26-brooch', 'C33', 0.58, 0.66]],
    ambience: 6,
  },
  {
    id: 'scn-rooftop',
    name: 'Belmont Rooftop',
    locationId: 'rooftop',
    light: 'night-storm',
    palette: {
      wallTop: '#101527', wallBottom: '#232a44', floor: '#1c1c26', accent: '#e3b556',
      motifs: [
        { kind: 'window', x: 640, y: 60, w: 640, h: 420, color: '#2e3a5c', alpha: 0.8 },
        { kind: 'ellipse', x: 860, y: 620, w: 480, h: 120, color: '#e7cd88', alpha: 0.25 },
        { kind: 'rect', x: 140, y: 260, w: 380, h: 340, color: '#181d30', alpha: 0.9 },
      ],
    },
    concepts: [
      ['easel', 1], ['lantern', 2], ['trunk', 1], ['blanket', 1], ['stool', 1],
    ],
    evidence: [
      ['sw-s28-c07', 'C07', 0.18, 0.62],
      ['sw-s28-c09', 'C09', 0.3, 0.74],
      ['sw-s28-c11', 'C11', 0.42, 0.6],
      ['sw-s28-c13', 'C13', 0.54, 0.76],
      ['sw-s28-c15', 'C15', 0.66, 0.6],
      ['sw-s28-c18', 'C18', 0.78, 0.72],
      ['sw-s28-c19', 'C19', 0.24, 0.5],
      ['sw-s28-c23', 'C23', 0.36, 0.44],
      ['sw-s28-c22', 'C22', 0.48, 0.52],
      ['sw-s28-c24', 'C24', 0.6, 0.42],
      ['sw-s28-c26', 'C26', 0.72, 0.5],
      ['sw-s28-c30', 'C30', 0.84, 0.58],
      ['sw-s28-c31', 'C31', 0.66, 0.86],
      ['sw-s28-c33', 'C33', 0.5, 0.9],
    ],
    ambience: 5,
  },
];

export const VARIANTS = [
  {
    id: 'scn-docks-fog',
    name: 'Harbor Docks — Berth 9',
    parent: 'scn-docks-day',
    light: 'fog-dusk',
    palette: {
      wallTop: '#4b5866', wallBottom: '#68737d', floor: '#454038', accent: '#d29a45',
      motifs: [
        { kind: 'rect', x: 60, y: 250, w: 560, h: 340, color: '#3a4650', alpha: 0.8 },
        { kind: 'ellipse', x: 1300, y: 180, w: 500, h: 170, color: '#7d8a94', alpha: 0.4 },
      ],
    },
    addConcepts: [
      ['tarpaulin', 1], ['winch', 1], ['gangplank', 1], ['oilskin', 1], ['whistle', 1],
      ['cat', 1], ['padlock', 1], ['manifest', 1], ['lantern', 2],
    ],
    addEvidence: [['ev-s07-slip', 'C11', 0.62, 0.6]],
    removeAmbience: 2,
  },
  {
    id: 'scn-shop-night',
    name: 'Antique Shop — Shuttered',
    parent: 'scn-shop-day',
    light: 'lamplit',
    palette: {
      wallTop: '#2c2118', wallBottom: '#413021', floor: '#241a12', accent: '#d3a044',
      motifs: [
        { kind: 'rect', x: 130, y: 130, w: 500, h: 460, color: '#211810', alpha: 0.9 },
        { kind: 'rect', x: 1320, y: 130, w: 480, h: 460, color: '#211810', alpha: 0.9 },
      ],
    },
    addConcepts: [
      ['curtain', 1], ['strongbox', 1], ['rug', 1], ['crowbar', 1], ['snuffbox', 1],
      ['letter-scale', 1], ['key-ring', 1], ['file', 1], ['cashbox', 1], ['lantern', 1],
      ['candelabra', 1],
    ],
    addEvidence: [['ev-s23-dossier', 'C29', 0.5, 0.78]],
    removeAmbience: 2,
  },
  {
    id: 'scn-gallery-storm',
    name: 'Museum Gallery — Ransacked',
    parent: 'scn-gallery-day',
    light: 'night-storm',
    palette: {
      wallTop: '#2a2f3d', wallBottom: '#3c4353', floor: '#2c2822', accent: '#d8ac4c',
      motifs: [
        { kind: 'arch', x: 300, y: 80, w: 380, h: 560, color: '#232837', alpha: 0.9 },
        { kind: 'arch', x: 1240, y: 80, w: 380, h: 560, color: '#232837', alpha: 0.9 },
        { kind: 'rect', x: 820, y: 130, w: 300, h: 380, color: '#151821', alpha: 0.95 },
      ],
    },
    addConcepts: [
      ['glass-shard', 1], ['handcuffs', 1], ['plaster-cast', 1],
    ],
    addEvidence: [['ev-s27-seal', 'C34', 0.46, 0.7]],
    removeAmbience: 2,
  },
];
