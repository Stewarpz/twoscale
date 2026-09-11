/* modules/integrations/integrations.js — grupos destacados y cintas en movimiento.

   Tres cintas a velocidades distintas (52/61/70 s) y direcciones alternas,
   para que nunca se sincronicen y el movimiento no se sienta mecánico. */

import { INTEG, INTEG_GROUPS, ICON } from '../../data/icons.js';
import { maskIcon } from '../../app.js';

const ROWS = 2;   // dos cintas en vez de tres: el modulo medía 959 px (P-40)

export default {
  name: 'integrations',

  mount(host, store) {
    const groups  = host.querySelector('[data-role="groups"]');
    const ribbons = host.querySelector('[data-role="ribbons"]');
    const count   = host.querySelector('[data-role="count"]');

    /* Recorte del muro a las 18 marcas que el publico declarado reconoce.
       Antes se pintaban las 46 repetidas tres veces: 138 nodos y 959 px de
       alto, el modulo mas alto de la portada (P-40). El contador sigue
       diciendo 46, que es el total real de integraciones disponibles. */
    const MURO = new Set(['whatsapp','instagram','googlecalendar','gmail','googlesheets',
      'hubspot','zoho','stripe','mercadopago','shopify','calendly','n8n','make','supabase',
      'anthropic','googlegemini','deepseek','mistralai']);
    const flat = [];
    INTEG.forEach((g, gi) => g.items.forEach(([slug, name]) => {
      if (MURO.has(slug)) flat.push({ slug, name, gi });
    }));
    // El contador dice el total real de integraciones disponibles, no las
    // que se muestran en el muro. Fuente unica: INTEG (P-35).
    count.textContent = INTEG.reduce((n, g) => n + g.items.length, 0);

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
        // Control real: antes solo reaccionaba a :hover y el modulo aportaba
        // cero paradas de foco (P-40).
        cell.setAttribute('role', 'button');
        cell.tabIndex = 0;
        cell.setAttribute('aria-pressed', 'false');
        cell.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cell.click(); }
        });
        cell.addEventListener('click', () => {
          const on = cell.getAttribute('aria-pressed') !== 'true';
          [...cell.parentElement.children].forEach((c) => c.setAttribute('aria-pressed', 'false'));
          cell.setAttribute('aria-pressed', String(on));
        });
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
        // La primera pasada es la real; las dos copias existen solo para que
        // el bucle no se vea. Se ocultan a la tecnologia asistiva: antes los
        // 138 nombres ocupaban el 49 % de los nodos de la pagina (P-40).
        own.concat(own, own).forEach((it, idx) => {
          const chip = document.createElement('span');
          chip.className = 'integ-chip';
          chip.append(logoNode(it.slug, 'integ-chip-logo', '22px 22px', 'var(--crema)'));
          const nm = document.createElement('span');
          nm.className = 'integ-chip-name';
          nm.textContent = it.name;
          chip.append(nm);
          if (idx >= own.length) chip.setAttribute('aria-hidden', 'true');
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
