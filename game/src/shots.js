// The screenshot scenes behind ?shot=start|play|win|loss. Each one
// plays the real rules forward from a fresh world, steered by a simple
// autopilot (play the strongest affordable card each turn), so the
// frame is what a real duel looks like and the same seed always gives
// the same frame.
import { EVENT_LOSS, EVENT_WIN } from './world.js';
import { SCREEN_LOSS, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';

function autopilotPlay(world) {
  const hand = world.state.playerHand;
  let best = -1;
  for (let i = 0; i < hand.length; i += 1) {
    if (hand[i].cost <= world.state.playerMana && (best < 0 || hand[i].attack > hand[best].attack)) best = i;
  }
  if (best < 0) {
    // No affordable card: let the opponent strike, then the turn ends.
    world.opponentTurn();
    return 0;
  }
  return world.playCard(best);
}

// Set `world` to the named scene and return the screen to draw over
// it and the best score to show.
export function stageShot(name, world) {
  world.reset();
  if (name === 'win') {
    world.state.oppLife = 3;
    const events = autopilotPlay(world);
    return { screen: events & EVENT_WIN ? SCREEN_WIN : SCREEN_PLAY, best: world.state.score };
  }
  if (name === 'loss') {
    world.state.playerLife = 2;
    world.state.oppHand = [{ name: 'Flame Drake', suit: 'EMBER', cost: 3, attack: 6, id: 99 }];
    world.state.oppMana = 3;
    world.opponentTurn();
    return { screen: world.state.over === 'loss' ? SCREEN_LOSS : SCREEN_PLAY, best: world.state.score };
  }
  if (name === 'play') {
    for (let turn = 0; turn < 3; turn += 1) {
      if (world.state.over) break;
      autopilotPlay(world);
    }
    return { screen: SCREEN_PLAY, best: world.state.score };
  }
  return { screen: SCREEN_TITLE, best: 0 };
}
