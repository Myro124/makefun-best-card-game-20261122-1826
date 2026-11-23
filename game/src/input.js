// Keyboard and pointer input. Held keys are not needed here: a duel
// is turn-based, so every press is one-shot and queued as a bit flag,
// and every click is queued with its position, so a press or click
// between two frames is never lost and never counted twice.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;

const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);

export function createInput(target) {
  let actions = 0;
  let click = null;

  window.addEventListener('keydown', (event) => {
    if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (event.code.startsWith('Digit')) {
      const n = Number(event.code.slice(5));
      if (n >= 1 && n <= 5 && !event.repeat) actions |= 4 << (n - 1); // card 1..5
    } else return;
    event.preventDefault();
  });
  window.addEventListener('blur', () => {
    actions = 0;
    click = null;
  });
  target.addEventListener('pointerdown', (event) => {
    const rect = target.getBoundingClientRect();
    click = { x: event.clientX - rect.left, y: event.clientY - rect.top, width: rect.width, height: rect.height };
    actions |= ACTION_CONFIRM;
  });

  return {
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    takeClick() {
      const taken = click;
      click = null;
      return taken;
    },
  };
}
