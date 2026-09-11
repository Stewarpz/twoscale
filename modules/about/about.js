/* modules/about/about.js — valores corporativos y fundadores. */

import { VALUES, FOUNDERS } from '../../data/misc.js';

/* Un ícono de línea por valor, en el orden en que VALUES los declara. */
const VALUE_ICONS = [
  '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
  '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  '<path d="M3 21h18M6 21V10l4-2 4 2 4-4v15"/>',
];

const svg = (paths) =>
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
  `stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

export default {
  name: 'about',

  mount(host, store) {
    const q = (r) => host.querySelector(`[data-role="${r}"]`);

    const render = () => {
      q('values').replaceChildren(...VALUES.map((v, i) => {
        const c = document.createElement('div');
        c.className = 'abt-value';
        c.innerHTML =
          `<span class="abt-value-ico">${svg(VALUE_ICONS[i] || VALUE_ICONS[0])}</span>` +
          '<h3 class="abt-card-t"></h3><p class="abt-card-d"></p>';
        c.querySelector('.abt-card-t').textContent = store.pick(v.t);
        c.querySelector('.abt-card-d').textContent = store.pick(v.d);
        return c;
      }));

      q('founders').replaceChildren(...FOUNDERS.map((f) => {
        const c = document.createElement('div');
        c.className = 'abt-founder';
        c.innerHTML =
          `<span class="abt-founder-ini">${f.initials}</span>` +
          '<div><h3 class="abt-founder-n"></h3><div class="abt-founder-r"></div><p class="abt-founder-b"></p></div>';
        c.querySelector('.abt-founder-n').textContent = f.name;
        c.querySelector('.abt-founder-r').textContent = store.pick(f.role);
        c.querySelector('.abt-founder-b').textContent = store.pick(f.bio);
        return c;
      }));
    };

    render();
    store.subscribe(render);
  },
};
