// Drawing only: the world's state and the current screen in, pixels
// out. The 1280x720 table is scaled to fit the window and centred.
// Opponent at the top, player at the bottom, cards with a big readable
// attack value, a mana cost in the corner and a suit name and mark.
import { CARD, FIELD, FONT, PALETTE, SUITS } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_WIN = 'win';
export const SCREEN_LOSS = 'loss';

const PANEL = { width: 640, top: 150, line: 32, bottom: 72 };

function roundRect(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  const fonts = new Map();
  function text(value, x, y, size, color, align) {
    if (!fonts.has(size)) fonts.set(size, `${size}px ${FONT}`);
    context.font = fonts.get(size);
    context.fillStyle = color;
    context.textAlign = align;
    context.textBaseline = 'alphabetic';
    context.fillText(value, x, y);
  }

  function drawCardFace(card, x, y, w, h, faceDown, dim) {
    const suit = SUITS[card.suit];
    roundRect(context, x, y, w, h, 12);
    if (faceDown) {
      context.fillStyle = PALETTE.cardBack;
      context.fill();
      context.strokeStyle = PALETTE.gold;
      context.lineWidth = 3;
      context.stroke();
      text('✦', x + w / 2, y + h / 2 + 18, 44, PALETTE.gold, 'center');
      if (w >= 120) text('EMBER DUEL', x + w / 2, y + h - 18, 13, PALETTE.gold, 'center');
      return;
    }
    context.fillStyle = dim ? '#334155' : '#f8fafc';
    context.fill();
    context.strokeStyle = suit.color;
    context.lineWidth = 4;
    context.stroke();
    if (w < 120) {
      // Table cards: compact — cost, mark, attack only, no name.
      context.fillStyle = PALETTE.mana;
      context.beginPath();
      context.arc(x + 18, y + 18, 13, 0, Math.PI * 2);
      context.fill();
      text(String(card.cost), x + 18, y + 24, 16, '#ffffff', 'center');
      text(suit.mark, x + w / 2, y + 62, 28, suit.color, 'center');
      text(String(card.attack), x + w / 2, y + h - 10, 30, '#dc2626', 'center');
      return;
    }
    // Mana cost, top-left circle.
    context.fillStyle = PALETTE.mana;
    context.beginPath();
    context.arc(x + 24, y + 24, 18, 0, Math.PI * 2);
    context.fill();
    text(String(card.cost), x + 24, y + 32, 22, '#ffffff', 'center');
    // Suit mark and name.
    text(suit.mark, x + w / 2, y + 72, 38, suit.color, 'center');
    text(suit.name.toUpperCase(), x + w / 2, y + 96, 14, suit.dark, 'center');
    // Card name on one line.
    text(card.name, x + w / 2, y + 126, 18, '#0f172a', 'center');
    // Big attack value at the bottom.
    text('ATTACK', x + w / 2, y + h - 38, 11, '#64748b', 'center');
    text(String(card.attack), x + w / 2, y + h - 8, 42, '#dc2626', 'center');
  }

  function drawLifeBar(label, life, x, y, align) {
    text(`${label}  ♥ ${life}`, x, y, 28, PALETTE.text, align);
    const w = 220;
    const bx = align === 'right' ? x - w : x;
    context.fillStyle = '#0f172a';
    context.fillRect(bx, y + 12, w, 14);
    context.fillStyle = PALETTE.life;
    context.fillRect(bx, y + 12, Math.max(0, (w * life) / 30), 14);
  }

  function drawTable(state) {
    context.fillStyle = PALETTE.felt;
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    context.fillStyle = PALETTE.feltDark;
    context.beginPath();
    context.ellipse(640, 360, 520, 240, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = PALETTE.gold;
    context.lineWidth = 4;
    context.beginPath();
    context.ellipse(640, 360, 520, 240, 0, 0, Math.PI * 2);
    context.stroke();
    text('EMBER DUEL', 640, 372, 26, 'rgba(242,201,76,0.35)', 'center');
    // Opponent's face-down hand.
    const oppTotal = state.oppHand.length * 92 + (state.oppHand.length - 1) * 10;
    for (let i = 0; i < state.oppHand.length; i += 1) {
      const x = (1280 - oppTotal) / 2 + i * 102;
      drawCardFace(state.oppHand[i], x, 96, 92, 122, true, false);
    }
    // Cards played to the table, centre.
    const table = state.table.slice(-4);
    const tTotal = table.length * 92 + (table.length - 1) * 10;
    for (let i = 0; i < table.length; i += 1) {
      const x = (1280 - tTotal) / 2 + i * 102;
      drawCardFace(table[i].card, x, 252, 92, 122, false, table[i].by === 'opp');
    }
  }

  function drawHud(state) {
    context.textBaseline = 'top';
    drawLifeBar('VEX', state.oppLife, 24, 22, 'left');
    drawLifeBar('YOU', state.playerLife, 1256, 22, 'right');
    text(`Turn ${state.turn}`, 640, 22, 26, PALETTE.text, 'center');
    text(`Score ${state.score}`, 640, 56, 20, PALETTE.gold, 'center');
    // Mana pips.
    text('MANA', 24, 690, 18, PALETTE.mana, 'left');
    for (let i = 0; i < 6; i += 1) {
      context.fillStyle = i < state.playerMana ? PALETTE.mana : '#1e293b';
      context.beginPath();
      context.arc(96 + i * 28, 698, 10, 0, Math.PI * 2);
      context.fill();
    }
    const last = state.log[state.log.length - 1] || '';
    text(last, 640, 84, 16, PALETTE.muted, 'center');
  }

  function drawHand(state) {
    const total = state.playerHand.length * CARD.width + (state.playerHand.length - 1) * CARD.gap;
    const x0 = (1280 - total) / 2;
    for (let i = 0; i < state.playerHand.length; i += 1) {
      const card = state.playerHand[i];
      const dim = card.cost > state.playerMana;
      drawCardFace(card, x0 + i * (CARD.width + CARD.gap), 470, CARD.width, CARD.height, false, dim);
      text(`[${i + 1}]`, x0 + i * (CARD.width + CARD.gap) + CARD.width / 2, 692, 14, dim ? '#64748b' : PALETTE.text, 'center');
    }
    text('Click a card (or press 1–5) to play it. Dim cards cost more mana than you have.', 640, 448, 18, PALETTE.muted, 'center');
  }

  function drawPanel(title, lines, prompt) {
    const height = PANEL.top + lines.length * PANEL.line + PANEL.bottom;
    const x = (FIELD.width - PANEL.width) / 2;
    const y = (FIELD.height - height) / 2;
    context.fillStyle = PALETTE.panel;
    context.fillRect(x, y, PANEL.width, height);
    context.strokeStyle = PALETTE.panelEdge;
    context.lineWidth = 3;
    context.strokeRect(x, y, PANEL.width, height);
    text(title, FIELD.width / 2, y + 78, 48, PALETTE.text, 'center');
    for (let i = 0; i < lines.length; i += 1) text(lines[i], FIELD.width / 2, y + PANEL.top + i * PANEL.line, 21, PALETTE.muted, 'center');
    text(prompt, FIELD.width / 2, y + height - 40, 23, PALETTE.gold, 'center');
  }

  function draw(state, screen, best) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    drawTable(state);
    if (screen === SCREEN_TITLE) {
      drawPanel('EMBER DUEL', ['A duel of original elemental cards.', 'You and Vex start at 30 life. Play a card,', 'it strikes for its attack. First to zero loses.', `Best score ${best}`], 'Press Space or click to start');
      return;
    }
    drawHud(state);
    drawHand(state);
    if (screen === SCREEN_PAUSED) drawPanel('Paused', ['The duel waits for you.'], 'Press P to resume');
    else if (screen === SCREEN_WIN) drawPanel('YOU WIN', [`Score ${state.score}  ·  Best ${best}`, `Vex falls in ${state.turn} turns.`], 'Press Space or click to duel again');
    else if (screen === SCREEN_LOSS) drawPanel('YOU LOSE', [`Score ${state.score}  ·  Best ${best}`, 'Vex, the Ember Warden, takes the duel.'], 'Press Space or click to try again');
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw, view };
}
