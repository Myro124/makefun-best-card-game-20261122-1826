// Ember Duel's rules and state, with no drawing and no browser in it:
// a seeded deck, two hands of five, mana, life totals, turns and the
// log of what happened. A turn is: the player plays one card (if they
// can afford it), it hits the opponent for its attack, then the
// opponent answers with one card of its own. First life total to hit
// zero loses. Nothing here allocates after createWorld returns.
import { CARD, DECK, HAND_SIZE, LIFE_START, MANA_MAX, MANA_START, SUITS } from './config.js';

export const EVENT_PLAYED = 1;
export const EVENT_WIN = 2;
export const EVENT_LOSS = 4;

function shuffledDeck(random) {
  const deck = DECK.map((card, index) => ({ ...card, id: index }));
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  return deck;
}

export function createWorld(random) {
  const state = {
    playerLife: LIFE_START,
    oppLife: LIFE_START,
    playerMana: MANA_START,
    oppMana: MANA_START,
    turn: 1,
    score: 0,
    playerHand: [],
    oppHand: [],
    deck: [],
    deckPos: 0,
    table: [],
    log: [],
    over: null, // 'win' | 'loss' | null
    lastPlay: null,
  };

  function drawInto(hand) {
    if (state.deckPos >= state.deck.length) return null;
    const card = state.deck[state.deckPos];
    state.deckPos += 1;
    hand.push(card);
    return card;
  }

  function reset() {
    state.playerLife = LIFE_START;
    state.oppLife = LIFE_START;
    state.playerMana = MANA_START;
    state.oppMana = MANA_START;
    state.turn = 1;
    state.score = 0;
    state.playerHand = [];
    state.oppHand = [];
    state.deck = shuffledDeck(random);
    state.deckPos = 0;
    state.table = [];
    state.log = ['The duel begins. Play a card to strike.'];
    state.over = null;
    state.lastPlay = null;
    for (let i = 0; i < HAND_SIZE; i += 1) {
      drawInto(state.playerHand);
      drawInto(state.oppHand);
    }
  }

  function opponentTurn() {
    if (state.over) return;
    // The opponent plays its strongest affordable card, or passes.
    let best = -1;
    for (let i = 0; i < state.oppHand.length; i += 1) {
      const card = state.oppHand[i];
      if (card.cost <= state.oppMana && (best < 0 || card.attack > state.oppHand[best].attack)) best = i;
    }
    if (best < 0) {
      state.log.push('Vex passes, saving mana.');
    } else {
      const card = state.oppHand.splice(best, 1)[0];
      state.oppMana -= card.cost;
      state.playerLife = Math.max(0, state.playerLife - card.attack);
      state.table.push({ card, by: 'opp' });
      state.lastPlay = { card, by: 'opp' };
      state.log.push(`Vex plays ${card.name} (${SUITS[card.suit].name}) for ${card.attack}.`);
      drawInto(state.oppHand);
    }
    state.turn += 1;
    state.playerMana = Math.min(MANA_MAX, MANA_START + Math.floor(state.turn / 2));
    state.oppMana = Math.min(MANA_MAX, MANA_START + Math.floor(state.turn / 2));
    if (state.playerLife <= 0) {
      state.over = 'loss';
      state.log.push('Your life reaches zero. Vex wins the duel.');
    }
  }

  // Play the player's card at `index`. Returns an event bitmask, 0 if
  // the card cannot be played (not enough mana, or the duel is over).
  function playCard(index) {
    if (state.over) return 0;
    const card = state.playerHand[index];
    if (!card || card.cost > state.playerMana) return 0;
    state.playerHand.splice(index, 1);
    state.playerMana -= card.cost;
    state.oppLife = Math.max(0, state.oppLife - card.attack);
    state.score += card.attack;
    state.table.push({ card, by: 'you' });
    state.lastPlay = { card, by: 'you' };
    state.log.push(`You play ${card.name} (${SUITS[card.suit].name}) for ${card.attack}.`);
    drawInto(state.playerHand);
    if (state.oppLife <= 0) {
      state.over = 'win';
      state.log.push('Vex falls. You win the duel!');
      return EVENT_PLAYED | EVENT_WIN;
    }
    opponentTurn();
    return state.over === 'loss' ? EVENT_PLAYED | EVENT_LOSS : EVENT_PLAYED;
  }

  // Card rectangles for the current layout, shared by render and input.
  function cardRects() {
    const rects = [];
    const total = state.playerHand.length * CARD.width + (state.playerHand.length - 1) * CARD.gap;
    const x0 = (1280 - total) / 2;
    for (let i = 0; i < state.playerHand.length; i += 1) {
      rects.push({ index: i, x: x0 + i * (CARD.width + CARD.gap), y: 470, width: CARD.width, height: CARD.height });
    }
    return rects;
  }

  reset();
  return { state, reset, playCard, opponentTurn, cardRects };
}
