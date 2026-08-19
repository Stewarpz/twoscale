/* modules/industries/industries.js — el mismo argumento, aplicado al sector del visitante. */

import { INDUSTRIES } from '../../data/metrics.js';

export default {
  name: 'industries',

  mount(host, store) {
    const q = (r) => host.querySelector(`[data-role="${r}"]`);
    let active = 0;

    const render = () => {
      const x = INDUSTRIES[active];

      q('tabs').replaceChildren(...INDUSTRIES.map((ind, i) => {
        const b = document.createElement('button');
        b.className = 'ind-tab';
        b.setAttribute('aria-pressed', String(i === active));
        b.textContent = store.pick(ind.name);
        b.addEventListener('click', () => { active = i; render(); });
        return b;
      }));

      q('problem').textContent  = store.pick(x.problem);
      q('solution').textContent = store.pick(x.solution);
      q('level').textContent    = x.pkgLevel;
      q('pkg').textContent      = store.pick(x.pkgName);

      q('features').replaceChildren(...store.pick(x.features).map((f) => {
        const li = document.createElement('li');
        li.innerHTML = '<i>→</i><span></span>';
        li.querySelector('span').textContent = f;
        return li;
      }));
    };

    render();
    store.subscribe(render);
  },
};
