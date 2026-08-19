/* modules/cases/cases.js — tarjetas de caso. */

import { CASES } from '../../data/misc.js';

export default {
  name: 'cases',

  mount(host, store) {
    const grid = host.querySelector('[data-role="grid"]');

    const render = () => {
      grid.replaceChildren(...CASES.map((c) => {
        const card = document.createElement('div');
        card.className = 'cas-card';
        card.innerHTML =
          '<span class="cas-tag"></span><h3 class="cas-title"></h3><p class="cas-desc"></p>' +
          '<div class="cas-metrics">' +
            `<div><div class="cas-m-v cas-m-v-a">${c.m1}</div><div class="cas-m-l" data-l1></div></div>` +
            `<div><div class="cas-m-v cas-m-v-b">${c.m2}</div><div class="cas-m-l" data-l2></div></div>` +
          '</div>';
        card.querySelector('.cas-tag').textContent   = store.pick(c.tag);
        card.querySelector('.cas-title').textContent = store.pick(c.title);
        card.querySelector('.cas-desc').textContent  = store.pick(c.desc);
        card.querySelector('[data-l1]').textContent  = store.pick(c.m1l);
        card.querySelector('[data-l2]').textContent  = store.pick(c.m2l);
        return card;
      }));
    };

    render();
    store.subscribe(render);
  },
};
