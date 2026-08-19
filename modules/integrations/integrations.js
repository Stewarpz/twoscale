/* modules/integrations/integrations.js — grupos destacados y cintas en movimiento.

   Tres cintas a velocidades distintas (52/61/70 s) y direcciones alternas,
   para que nunca se sincronicen y el movimiento no se sienta mecánico. */

import { INTEG, INTEG_GROUPS, ICON } from '../../data/icons.js';
import { maskIcon } from '../../app.js';

const ROWS = 3;

export default {
  name: 'integrations',

  mount(host, store) {
    const groups  = host.querySelector('[data-role="groups"]');
    const ribbons = host.querySelector('[data-role="ribbons"]');
    const count   = host.querySelector('[data-role="count"]');

    const flat = [];
    INTEG.forEach((g, gi) => g.items.forEach(([slug, name]) => flat.push({ slug, name, gi })));
    count.textContent = flat.length;

    const logoNode = (slug, cls, size, color) => {
      const wrap = document.createElement('span');
      wrap.className = cls;
      const inner = document.createElement('span');
      inner.setAttribute('style', maskIcon(ICON(slug), size, color));
      wrap.append(inner);
      return wrap;
    };

    const renderGroups = () => {
      groups.replaceChildren(...INTEG_GROUPS.map((g) => {
        const cell = document.createElement('div');
        cell.className = 'integ-group';
        cell.setAttribute('data-reveal', '');
        cell.innerHTML =
          '<div class="integ-group-cat"></div>' +
          '<p class="integ-group-note"></p>' +
          '<div class="integ-group-logos"></div>' +
          '<p class="integ-group-names"></p>';
        cell.querySelector('.integ-group-cat').textContent = store.pick(g.cat);
        cell.querySelector('.integ-group-note').textContent = store.pick(g.note);
        const box = cell.querySelector('.integ-group-logos');
        g.items.forEach(([slug]) => box.append(logoNode(slug, 'integ-logo', '20px 20px', 'var(--crema-dim)')));
        cell.querySelector('.integ-group-names').textContent = g.items.map((i) => i[1]).join(' · ');
        return cell;
      }));
    };

    const renderRibbons = () => {
      const rows = [];
      for (let r = 0; r < ROWS; r++) {
        const own = flat.filter((_, i) => i % ROWS === r);
        const track = document.createElement('div');
        // triplicado: el bucle salta un tercio, así que nunca se ve el corte
        track.style.cssText =
          `display:flex;gap:14px;width:max-content;` +
          `animation:ribbon${r % 2 ? 'B' : 'A'} ${52 + r * 9}s linear infinite`;
        own.concat(own, own).forEach((it) => {
          const chip = document.createElement('span');
          chip.className = 'integ-chip';
          chip.append(logoNode(it.slug, 'integ-chip-logo', '22px 22px', 'var(--crema)'));
          const nm = document.createElement('span');
          nm.className = 'integ-chip-name';
          nm.textContent = it.name;
          chip.append(nm);
          track.append(chip);
        });
        const lane = document.createElement('div');
        lane.className = 'ribbon';
        lane.style.overflow = 'hidden';
        lane.append(track);
        rows.push(lane);
      }
      ribbons.replaceChildren(...rows);
    };

    renderGroups();
    renderRibbons();
    store.subscribe(renderGroups);
  },
};
