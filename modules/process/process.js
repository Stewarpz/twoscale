/* modules/process/process.js — los tres pasos del método, con su gráfico.

   Cada paso trae un panel distinto porque cada uno cuenta algo distinto:
   fugas que caen, construcción que sube, soporte que late. */

import { PROC_STEPS } from '../../data/process.js';

const VIZ = [
  /* 01 · fugas de capital */
  () => {
    const wrap = document.createElement('div');
    wrap.className = 'prc-viz';
    wrap.innerHTML = '<span class="prc-viz-line"></span><span class="prc-viz-base"></span>';
    [18, 38, 58, 78].forEach((left, i) => {
      const drop = document.createElement('span');
      drop.className = 'prc-leak';
      drop.style.left = left + '%';
      drop.style.animationDelay = (i * 0.55).toFixed(2) + 's';
      wrap.append(drop);
    });
    return wrap;
  },
  /* 02 · arquitectura en catorce días */
  () => {
    const wrap = document.createElement('div');
    wrap.className = 'prc-viz';
    const bars = document.createElement('div');
    bars.className = 'prc-bars';
    [30, 42, 38, 55, 64, 58, 76, 88].forEach((h, i) => {
      const b = document.createElement('div');
      b.className = 'prc-bar';
      b.style.height = h + '%';
      b.style.animationDelay = (i * 0.11).toFixed(2) + 's';
      bars.append(b);
    });
    wrap.append(bars);
    return wrap;
  },
  /* 03 · soporte continuo */
  () => {
    const wrap = document.createElement('div');
    wrap.className = 'prc-viz';
    const dots = document.createElement('div');
    dots.className = 'prc-dots';
    [0, 1, 2].forEach((i) => {
      const d = document.createElement('span');
      d.style.animationDelay = (i * 0.32).toFixed(2) + 's';
      dots.append(d);
    });
    wrap.append(dots);
    return wrap;
  },
];

export default {
  name: 'process',

  mount(host, store) {
    const box = host.querySelector('[data-role="steps"]');

    const render = () => {
      box.replaceChildren(...PROC_STEPS.map((bullets, i) => {
        const n = String(i + 1).padStart(2, '0');
        const card = document.createElement('div');
        card.className = 'prc-step prc-step-' + (i + 1);
        card.setAttribute('data-reveal', 'scale');
        card.innerHTML =
          '<span class="prc-rail"></span>' +
          `<div class="prc-top"><span class="prc-n">${n}</span><span class="prc-tag"></span></div>` +
          '<h3 class="prc-t"></h3><p class="prc-d"></p>';
        card.querySelector('.prc-tag').textContent = store.t(`pr_p${i + 1}_tag`);
        card.querySelector('.prc-t').textContent = store.t(`pr_p${i + 1}_t`);
        card.querySelector('.prc-d').textContent = store.t(`pr_p${i + 1}_d`);

        const viz = VIZ[i]();
        const cap = document.createElement('span');
        cap.className = 'prc-viz-cap';
        cap.textContent = store.t(`pr_p${i + 1}_cap`);
        viz.append(cap);
        card.append(viz);

        const list = document.createElement('div');
        list.className = 'prc-list';
        store.pick(bullets).forEach((text) => {
          const row = document.createElement('span');
          const arrow = document.createElement('i');
          arrow.textContent = '→';
          const label = document.createElement('span');
          label.textContent = text;
          row.append(arrow, label);
          list.append(row);
        });
        card.append(list);
        return card;
      }));
    };

    render();
    store.subscribe(render);
  },
};
