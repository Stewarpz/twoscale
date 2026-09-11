/* modules/metrics/metrics.js — conteo ascendente al entrar en pantalla.

   Se dispara con IntersectionObserver y solo una vez por cifra. */

import { METRICS } from '../../data/metrics.js';

const countUp = (node, target, reduced) => {
  if (reduced) { node.textContent = target; return; }
  const DURATION = 1400, t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / DURATION);
    node.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

export default {
  name: 'metrics',

  mount(host, store) {
    const grid = host.querySelector('[data-role="grid"]');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      grid.replaceChildren(...METRICS.map((m) => {
        const cell = document.createElement('div');
        cell.innerHTML =
          `<div class="metric-value">${m.prefix || ''}<span data-count="${m.value}">0</span>` +
          `<span class="metric-suffix">${(store.state.lang === 'en' && m.suffixEn) ? m.suffixEn : m.suffix}</span></div>` +
          `<div class="metric-label"></div>`;
        cell.querySelector('.metric-label').textContent = store.pick(m.label);
        return cell;
      }));
      observe();
    };

    const observe = () => {
      grid.querySelectorAll('[data-count]').forEach((n) => {
        if (n.dataset.done) return;
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting || n.dataset.done) return;
            n.dataset.done = 'true';
            countUp(n, parseFloat(n.dataset.count), reduced);
            io.disconnect();
          });
        }, { threshold: 0.5 });
        io.observe(n);
      });
    };

    render();
    store.subscribe(render);
  },
};
