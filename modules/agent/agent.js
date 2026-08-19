/* modules/agent/agent.js — agente de prospección: seis preguntas y un resumen.

   Se apaga solo mientras una maqueta a pantalla completa está a la vista
   (evento "ts:hide-agent"), porque no hay hueco lateral al que apartarse. */

import { AGENT_FLOW, AGENT_CLOSE } from '../../data/chat.js';

/** Marca del agente. SVG propio: no usamos logos de terceros. */
export const AGENT_ICON = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
  <rect x="4" y="7.5" width="16" height="12" rx="4"/>
  <path d="M12 4.2v3.3M8.5 13h.01M15.5 13h.01"/>
  <path d="M9 16.4c1.9 1.1 4.1 1.1 6 0"/></svg>`;

const TYPING_MS = 800;

export default {
  name: 'agent',

  mount(host, store) {
    const launcher = host.querySelector('[data-role="launcher"]');
    const panel    = host.querySelector('[data-role="panel"]');
    const log      = host.querySelector('[data-role="log"]');
    const foot     = host.querySelector('[data-role="foot"]');
    const bar      = host.querySelector('[data-role="bar"]');

    host.querySelector('[data-role="launcher-icon"]').insertAdjacentHTML('afterbegin', AGENT_ICON(19));
    host.querySelector('[data-role="avatar"]').insertAdjacentHTML('afterbegin', AGENT_ICON(20));

    const state = { open: false, step: 0, picks: [], draft: '', typing: false, hidden: false };
    let typingTimer = null;

    const advance = (value) => {
      state.picks.push(value);
      state.step += 1;
      state.draft = '';
      state.typing = true;
      render();
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => { state.typing = false; render(); }, TYPING_MS);
    };

    const reset = () => { state.step = 0; state.picks = []; state.draft = ''; state.typing = false; render(); };

    /* ---------- vista ---------- */
    const renderLog = (done, current) => {
      const nodes = [];
      const push = (cls, text) => {
        const d = document.createElement('div');
        d.className = cls;
        d.textContent = text;
        nodes.push(d);
      };

      for (let i = 0; i <= state.step && i < AGENT_FLOW.length; i++) {
        const q = AGENT_FLOW[i];
        push('ag-bot', store.pick(q.q));
        if (i < state.picks.length) {
          push('ag-you', state.picks[i]);
          if (q.opts && q.ack) {
            const idx = store.pick(q.opts).indexOf(state.picks[i]);
            if (idx >= 0) push('ag-bot', store.pick(q.ack)[idx]);
          }
        }
      }
      if (done) push('ag-bot', AGENT_CLOSE[store.state.lang]);

      if (state.typing) {
        const t = document.createElement('div');
        t.className = 'ag-typing';
        t.innerHTML = '<i></i><i></i><i></i>';
        nodes.push(t);
      }

      if (done) {
        const box = document.createElement('div');
        box.className = 'ag-summary';
        box.innerHTML = `<div class="ag-summary-t">${store.t('ag_summary')}</div>`;
        AGENT_FLOW.forEach((q, i) => {
          const row = document.createElement('div');
          row.className = 'ag-summary-row';
          row.innerHTML = '<span class="ag-summary-k"></span><span class="ag-summary-v"></span>';
          row.querySelector('.ag-summary-k').textContent = store.pick(q.k);
          row.querySelector('.ag-summary-v').textContent = state.picks[i] || '—';
          box.append(row);
        });
        nodes.push(box);
      }

      log.replaceChildren(...nodes);
      log.scrollTop = log.scrollHeight;
    };

    const renderFoot = (done, current) => {
      foot.replaceChildren();

      if (state.typing) {
        const p = document.createElement('p');
        p.className = 'ag-note';
        p.textContent = store.t('ag_note');
        foot.append(p);
        return;
      }

      if (done) {
        const wrap = document.createElement('div');
        wrap.className = 'ag-done';
        const cta = document.createElement('a');
        cta.className = 'ag-done-cta';
        cta.href = '#contacto';
        cta.textContent = store.t('ag_cta');
        cta.addEventListener('click', () => { state.open = false; render(); });
        const again = document.createElement('button');
        again.className = 'ag-again';
        again.textContent = store.t('ag_again');
        again.addEventListener('click', reset);
        wrap.append(cta, again);
        foot.append(wrap);
        return;
      }

      if (current?.opts) {
        const row = document.createElement('div');
        row.className = 'ag-opts';
        store.pick(current.opts).forEach((label) => {
          const b = document.createElement('button');
          b.className = 'ag-opt';
          b.textContent = label;
          b.addEventListener('click', () => advance(label));
          row.append(b);
        });
        foot.append(row);
        return;
      }

      if (current?.input) {
        const form = document.createElement('form');
        form.className = 'ag-form';
        form.innerHTML =
          `<input class="ag-input" placeholder="${store.pick(current.ph)}" value="${state.draft}">` +
          `<button type="submit" class="ag-send" aria-label="${store.t('ag_send')}">→</button>`;
        const input = form.querySelector('input');
        input.addEventListener('input', (e) => { state.draft = e.target.value; });
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const v = state.draft.trim();
          if (v) advance(v);
        });
        foot.append(form);
        requestAnimationFrame(() => input.focus());
      }
    };

    const render = () => {
      const done = state.step >= AGENT_FLOW.length;
      const current = done ? null : AGENT_FLOW[state.step];

      launcher.hidden = state.open;
      panel.hidden = !state.open;
      // Abierto, el panel no se esconde: cerrarse bajo el cursor sería peor.
      launcher.className = 'ag-launcher ' + (state.hidden && !state.open ? 'agent-dodge' : 'agent-rest');

      bar.style.width = Math.round(Math.min(state.step, AGENT_FLOW.length) / AGENT_FLOW.length * 100) + '%';
      renderLog(done, current);
      renderFoot(done, current);
    };

    launcher.addEventListener('click', () => { state.open = true; render(); });
    host.querySelector('[data-role="close"]').addEventListener('click', () => { state.open = false; render(); });
    window.addEventListener('ts:agent-open', () => { state.open = true; render(); });
    window.addEventListener('ts:hide-agent', (e) => { state.hidden = !!e.detail; render(); });

    render();
    store.subscribe(render);
  },
};
