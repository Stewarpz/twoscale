/* modules/about/about.js — pilares, valores y pasos del proceso. */

import { PILLARS } from '../../data/process.js';
import { VALUES, STEPS } from '../../data/misc.js';

export default {
  name: 'about',

  mount(host, store) {
    const q = (r) => host.querySelector(`[data-role="${r}"]`);

    const render = () => {
      q('pillars').replaceChildren(...PILLARS.map((p) => {
        const c = document.createElement('div');
        c.className = 'abt-pillar';
        c.innerHTML =
          `<span class="abt-pillar-n">${p.n}</span>` +
          '<h3 class="abt-pillar-t"></h3><p class="abt-pillar-d"></p><p class="abt-pillar-k"></p>';
        c.querySelector('.abt-pillar-t').textContent = store.pick(p.t);
        c.querySelector('.abt-pillar-d').textContent = store.pick(p.d);
        c.querySelector('.abt-pillar-k').textContent = store.pick(p.k);
        return c;
      }));

      q('values').replaceChildren(...VALUES.map((v) => {
        const c = document.createElement('div');
        c.className = 'abt-card';
        c.innerHTML = `<div class="abt-card-mono">${v.mono}</div><h3 class="abt-card-t"></h3><p class="abt-card-d"></p>`;
        c.querySelector('.abt-card-t').textContent = store.pick(v.t);
        c.querySelector('.abt-card-d').textContent = store.pick(v.d);
        return c;
      }));

      q('steps').replaceChildren(...STEPS.map((s) => {
        const c = document.createElement('div');
        c.className = 'abt-step';
        c.innerHTML = `<div class="abt-step-n">${s.n}</div><h3 class="abt-card-t"></h3><p class="abt-card-d"></p>`;
        c.querySelector('.abt-card-t').textContent = store.pick(s.t);
        c.querySelector('.abt-card-d').textContent = store.pick(s.d);
        return c;
      }));
    };

    render();
    store.subscribe(render);
  },
};
