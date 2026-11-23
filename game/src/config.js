// Ember Duel: every tuning number and colour in one place.
// The table is a fixed 1280x720 logical area; the renderer scales it to
// the window, so no rule below depends on the screen size.
export const FIELD = { width: 1280, height: 720 };

export const LIFE_START = 30;
export const MANA_START = 3;
export const MANA_MAX = 6;
export const HAND_SIZE = 5;

// Four original suits. Each card belongs to one suit, has a mana cost
// (the blue number) and an attack value (the big red number).
export const SUITS = {
  EMBER: { name: 'Ember', mark: '▲', color: '#e5534b', dark: '#7f1d1d' },
  TIDE: { name: 'Tide', mark: '●', color: '#38bdf8', dark: '#0c4a6e' },
  THORN: { name: 'Thorn', mark: '◆', color: '#4ade80', dark: '#14532d' },
  GALE: { name: 'Gale', mark: '✦', color: '#c084fc', dark: '#581c87' },
};

// The deck: 16 original cards, drawn in a seeded order. Name, suit,
// cost, attack. No card copies a commercial game.
export const DECK = [
  { name: 'Cinder Fox', suit: 'EMBER', cost: 1, attack: 2 },
  { name: 'Spark Imp', suit: 'EMBER', cost: 1, attack: 3 },
  { name: 'Flame Drake', suit: 'EMBER', cost: 3, attack: 6 },
  { name: 'Ash Phoenix', suit: 'EMBER', cost: 2, attack: 4 },
  { name: 'Tide Serpent', suit: 'TIDE', cost: 2, attack: 4 },
  { name: 'Pearl Kelpie', suit: 'TIDE', cost: 1, attack: 2 },
  { name: 'Storm Eel', suit: 'TIDE', cost: 3, attack: 5 },
  { name: 'Coral Guard', suit: 'TIDE', cost: 2, attack: 3 },
  { name: 'Thorn Wolf', suit: 'THORN', cost: 2, attack: 4 },
  { name: 'Moss Golem', suit: 'THORN', cost: 3, attack: 5 },
  { name: 'Seed Sprite', suit: 'THORN', cost: 1, attack: 2 },
  { name: 'Vine Hydra', suit: 'THORN', cost: 3, attack: 6 },
  { name: 'Gale Hawk', suit: 'GALE', cost: 1, attack: 3 },
  { name: 'Cloud Djinn', suit: 'GALE', cost: 3, attack: 6 },
  { name: 'Wind Wisp', suit: 'GALE', cost: 1, attack: 2 },
  { name: 'Tempest Roc', suit: 'GALE', cost: 2, attack: 5 },
];

export const CARD = { width: 150, height: 200, gap: 18 };

export const PALETTE = {
  backdrop: '#0b1f14',
  felt: '#14532d',
  feltDark: '#0f3d21',
  feltLight: '#166534',
  panel: '#101827',
  panelEdge: '#f2c94c',
  text: '#f8fafc',
  muted: '#cbd5e1',
  gold: '#f2c94c',
  mana: '#38bdf8',
  life: '#e5534b',
  cardBack: '#7c2d12',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'ember-duel.best';
