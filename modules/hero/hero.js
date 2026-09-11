/* modules/hero/hero.js — píldoras de capacidades y pasos de la tarjeta. */

import { HERO_PILLS, HERO_FLOW } from '../../data/strings.js';

/* Arranca el cerebro digital en cuanto el motor y el contenedor existen. */
function bootBrain(tries = 0) {
  const el = document.getElementById('cerebro-vivo');
  if (!el || !window.TwocalesBrain) {
    if (tries < 80) setTimeout(() => bootBrain(tries + 1), 200);
    return;
  }
  if (el.dataset.brain === 'on') return;
  el.dataset.brain = 'on';
  try {
    new window.TwocalesBrain(el, {
      contour: 'suave', interaction: 'magnet', pointerScope: 'window',
      intensity: 34, density: 104, brainRatio: 0.62,
    });
  } catch (e) { /* la sección se ve igual sin la red */ }
}

export default {
  name: 'hero',

  mount(host, store) {
    bootBrain();
    const pills = host.querySelector('[data-role="pills"]');
    const flow  = host.querySelector('[data-role="flow"]');

    const render = () => {
      pills.replaceChildren(...store.pick(HERO_PILLS).map((label) => {
        const s = document.createElement('span');
        s.className = 'hero-pill';
        s.textContent = label;
        return s;
      }));

      flow.replaceChildren(...store.pick(HERO_FLOW).map((step) => {
        const row = document.createElement('div');
        row.className = 'hero-step';
        row.innerHTML =
          `<span class="hero-step-badge">${step.mono}</span>` +
          `<div style="min-width:0"><div class="hero-step-title"></div><div class="hero-step-sub"></div></div>` +
          `<span class="hero-step-tag">${step.tag}</span>`;
        row.querySelector('.hero-step-title').textContent = step.title;
        row.querySelector('.hero-step-sub').textContent = step.sub;
        return row;
      }));
    };

    render();
    store.subscribe(render);
  },
};
