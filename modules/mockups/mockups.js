/* modules/mockups/mockups.js — las dos demos de cliente del acto 2.

   Ambas son aplicaciones externas montadas en <iframe>. No se reinterpretan ni
   se tocan por dentro: cada una trae su propia lógica de recorrido guiado ya
   afinada, y el iframe garantiza que su CSS y sus listeners de scroll queden
   confinados y no afecten a la landing.

   Este módulo solo se ocupa de tres cosas:
     1. pintar la lista de "lo que gestiona el sistema"
     2. avisar al agente flotante que se retire mientras una demo está a la vista
     3. re-traducir al cambiar de idioma
*/

import { APPFEAT } from '../../data/misc.js';

export default {
  name: 'mockups',

  mount(host, store) {
    const q = (r) => host.querySelector(`[data-role="${r}"]`);

    /* ---------- lo que gestiona el sistema ---------- */
    const renderManages = () => {
      const box = q('manages');
      if (!box) return;
      box.replaceChildren(...APPFEAT.map((f) => {
        const cell = document.createElement('div');
        cell.className = 'mck-manage';
        const tick = document.createElement('i');
        tick.textContent = '✓';
        const label = document.createElement('span');
        label.textContent = store.pick(f);
        cell.append(tick, label);
        return cell;
      }));
    };

    /* ---------- el agente flotante se retira sobre las demos ----------
       Las tarjetas ocupan casi todo el ancho y el alto de la ventana: no hay
       hueco lateral al que apartarse, así que el agente se apaga mientras
       cualquiera de las dos está a la vista y vuelve al salir. */
    const watchDemos = () => {
      const zones = [q('aurea-zone'), q('dash-zone')].filter(Boolean);
      if (!zones.length || !window.IntersectionObserver) return;
      const visible = new Set();
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        });
        window.dispatchEvent(new CustomEvent('ts:hide-agent', { detail: visible.size > 0 }));
      }, { rootMargin: '-25% 0px -25% 0px' });
      zones.forEach((z) => io.observe(z));
    };

    /* ---------- las demos se cargan cuando se piden (P-09) ----------
       Cargarlas al acercarse a la vista costaba 184,7 KB de documento mas
       203,3 KB de subrecursos a todo el que pasara por la ruta, la usara o
       no. El marcador tiene el alto exacto del marco, de modo que sustituirlo
       por el iframe no desplaza nada de lo que hay debajo. */
    const armarDemo = (slot) => {
      const frame = document.createElement('iframe');
      frame.className = 'mck-iframe' + (slot.classList.contains('mck-preview-tall') ? ' mck-iframe-tall' : '');
      frame.src = slot.dataset.src;
      frame.title = slot.dataset.title;
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      slot.replaceWith(frame);
      frame.focus();
    };

    host.querySelectorAll('[data-src]').forEach((slot) => {
      slot.querySelector('.mck-preview-btn')?.addEventListener('click', () => armarDemo(slot));
    });

    renderManages();
    watchDemos();
    store.subscribe(renderManages);
  },
};
