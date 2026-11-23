// Boot and the one loop: input is read every frame and the renderer
// paints what is there. The duel is turn-based, so there is no
// real-time simulation to step; a click or a number key plays a card,
// Space starts or restarts, P pauses.
// ?seed=N fixes the deck order. ?shot=start|play|win|loss (with
// &seed=N) stages that scene instead of running the loop, paints it
// twice and sets window.__shotReady for a screenshot.
import { BEST_KEY } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_LOSS, EVENT_WIN } from './world.js';
import { ACTION_CONFIRM, ACTION_PAUSE, createInput } from './input.js';
import { createRenderer, SCREEN_LOSS, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off: the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    screen = SCREEN_PLAY;
    announce('Playing Ember Duel. Your turn: play a card.');
  }

  function finishGame() {
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    screen = world.state.over === 'win' ? SCREEN_WIN : SCREEN_LOSS;
    announce(world.state.over === 'win' ? `You win. Score ${world.state.score}.` : `You lose. Score ${world.state.score}.`);
  }

  function playCardAt(index) {
    if (screen !== SCREEN_PLAY) return;
    const events = world.playCard(index);
    if (events === 0) {
      announce('Not enough mana for that card.');
      return;
    }
    if (events & (EVENT_WIN | EVENT_LOSS)) finishGame();
    else announce(world.state.log[world.state.log.length - 1]);
  }

  function handleClick() {
    const click = input.takeClick();
    if (!click) return;
    // Convert the click from window pixels to the 1280x720 field.
    const fieldX = ((click.x * window.devicePixelRatio) - renderer.view.x) / renderer.view.scale;
    const fieldY = ((click.y * window.devicePixelRatio) - renderer.view.y) / renderer.view.scale;
    if (screen !== SCREEN_PLAY) return;
    for (const rect of world.cardRects()) {
      if (fieldX >= rect.x && fieldX <= rect.x + rect.width && fieldY >= rect.y && fieldY <= rect.y + rect.height) {
        playCardAt(rect.index);
        return;
      }
    }
  }

  function frame() {
    requestAnimationFrame(frame);
    const actions = input.takeActions();
    handleClick();
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_WIN || screen === SCREEN_LOSS)) startGame();
    else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
    if (screen === SCREEN_PLAY) {
      for (let card = 0; card < 5; card += 1) {
        if (actions & (4 << card)) playCardAt(card);
      }
    }
    renderer.draw(world.state, screen, best);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Ember Duel. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
