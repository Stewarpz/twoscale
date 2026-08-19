/* modules/process/process.js — los tres pasos, cada uno con su propia animación.

   Paso 1 gotea (fugas), paso 2 se levanta (arquitectura), paso 3 barre 14 días
   y orbita (soporte continuo). Las animaciones son CSS; aquí solo se arma el DOM. */

import { PROC_STEPS } from '../../data/process.js';

const VIZ = {
  /* Paso 1 — cuánto se pierde cada mes, por concepto */
  0: (store) => {
    const es = store.state.lang === 'es';
    const rows = [
      { l: es ? 'Leads sin responder' : 'Unanswered leads', v: '$4,2 M', pct: 100 },
      { l: es ? 'Citas no confirmadas' : 'Unconfirmed bookings', v: '$2,8 M', pct: 67 },
      { l: es ? 'Tareas manuales' : 'Manual work', v: '$1,9 M', pct: 45 },
    ];
    const box = document.createElement('div');
    box.className = 'viz-leaks';
    rows.forEach((r, i) => {
      const row = document.createElement('div');
      row.className = 'viz-leak';
      row.innerHTML =
        `<div><div style="font-family:var(--fm);font-size:10px;color:var(--piedra);margin-bottom:6px"></div>` +
        `<div class="viz-leak-bar"><div class="viz-leak-fill leakdrop" style="width:${r.pct}%;animation-delay:${i * 0.4}s"></div></div></div>` +
        `<span class="viz-leak-v">${r.v}</span>`;
      row.querySelector('div div').textContent = r.l;
      box.append(row);
    });
    return box;
  },

  /* Paso 2 — la arquitectura levantándose */
  1: () => {
    const box = document.createElement('div');
    box.className = 'viz-build';
    [38, 56, 47, 72, 61, 88, 79, 100].forEach((h, i) => {
      const b = document.createElement('span');
      b.className = 'buildbar';
      b.style.cssText =
        `height:${h}%;background:${i === 7 ? 'var(--ambar)' : 'var(--indigo)'};` +
        `animation-delay:${(i * 0.14).toFixed(2)}s`;
      box.append(b);
    });
    return box;
  },

  /* Paso 3 — el barrido de los 14 días y el soporte que sigue girando */
  2: (store) => {
    const es = store.state.lang === 'es';
    const box = document.createElement('div');
    box.style.cssText = 'width:100%;display:flex;flex-direction:column;gap:18px';

    const days = document.createElement('div');
    days.className = 'viz-days';
    days.innerHTML =
      '<div class="viz-days-track"><div class="daysweep"></div></div>' +
      '<div class="viz-days-grid"></div>';
    const grid = days.querySelector('.viz-days-grid');
    for (let i = 0; i < 14; i++) {
      const d = document.createElement('span');
      d.className = 'viz-day' + (i < 14 ? ' viz-day-on' : '');
      d.style.opacity = String(0.35 + (i / 14) * 0.65);
      grid.append(d);
    }

    const orbit = document.createElement('div');
    orbit.className = 'viz-orbit';
    orbit.innerHTML =
      '<div class="viz-orbit-ring"></div>' +
      '<div class="orbitdot"><i></i></div>' +
      `<div class="viz-orbit-core">${es ? 'SOPORTE<br>CONTINUO' : 'ONGOING<br>SUPPORT'}</div>`;

    box.append(days, orbit);
    return box;
  },
};

export default {
  name: 'process',

  mount(host, store) {
    const steps = host.querySelector('[data-role="steps"]');

    const render = () => {
      steps.replaceChildren(...PROC_STEPS.map((step, i) => {
        const row = document.createElement('div');
        row.className = 'proc-step';
        row.setAttribute('data-reveal', '');
        row.innerHTML =
          `<div class="proc-rail"><span class="proc-num" style="animation-delay:${i * 0.5}s">${i + 1}</span>` +
          `${i < PROC_STEPS.length - 1 ? '<span class="proc-line steprail"></span>' : ''}</div>` +
          `<div><span class="proc-body-tag"></span><h3 class="proc-body-t"></h3>` +
          `<p class="proc-body-d"></p><span class="proc-body-when"></span><ul class="proc-body-list"></ul></div>` +
          `<div class="proc-viz"></div>`;

        // Las claves viven en data/strings.js como pr_p1_*, pr_p2_*, pr_p3_*
        const k = 'pr_p' + (i + 1) + '_';
        row.querySelector('.proc-body-t').textContent = store.t(k + 't');
        row.querySelector('.proc-body-when').textContent = store.t(k + 'cap');
        row.querySelector('.proc-body-tag').textContent = store.t(k + 'tag');
        row.querySelector('.proc-body-d').textContent = store.t(k + 'd');
        const ul = row.querySelector('.proc-body-list');
        store.pick(step).forEach((line) => {
          const li = document.createElement('li');
          li.innerHTML = '<i>→</i><span></span>';
          li.querySelector('span').textContent = line;
          ul.append(li);
        });
        row.querySelector('.proc-viz').append(VIZ[i](store));
        return row;
      }));
    };

    render();
    store.subscribe(render);
  },
};
