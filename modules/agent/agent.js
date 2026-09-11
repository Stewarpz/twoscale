/* modules/agent/agent.js — agente de prospección: seis preguntas y un resumen.

   Se apaga solo mientras una maqueta a pantalla completa está a la vista
   (evento "ts:hide-agent"), porque no hay hueco lateral al que apartarse. */

import { AGENT_FLOW, AGENT_CLOSE } from '../../data/chat.js';

/* ========== CONFIGURACIÓN — CAMBIAR ANTES DE PRODUCCIÓN ========== */
const AGENT_ENDPOINT = 'https://formspree.io/f/myeyonwe';
const WHATSAPP_NUMBER = '573004032882';
/* ================================================================= */

/** Escapa HTML para prevenir XSS al insertar datos del usuario. */
const escapeHtml = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

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

    const state = { open: false, step: 0, picks: [], draft: '', typing: false, hidden: false, sent: false };
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

    /* Un envío por recorrido. La bandera solo se limpia en reset(). */
    const enviarLead = (summary, wrap) => {
      if (state.sent) return;
      state.sent = true;
      fetch(AGENT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          source: 'agent',
          // Identificador de envío: sin él, dos duplicados son
          // indistinguibles en destino.
          submissionId: `ag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          answers: summary,
        }),
      }).catch((err) => {
        console.error('[twoscale] agent submit failed:', err);
        state.sent = false;
        const errMsg = document.createElement('p');
        errMsg.className = 'ag-note';
        errMsg.style.color = 'var(--ambar)';
        errMsg.textContent = store.t('ag_error');
        wrap.append(errMsg);
      });
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
      /* P-45: leer scrollHeight justo despues de reemplazar los hijos fuerza
         un recalculo sincrono de layout en cada render del agente. Eran
         463 ms de los 412 ms de reflujo total medidos tras corregir intro.js.
         Aplazarlo al siguiente cuadro deja que el navegador haga el layout
         una sola vez, por su cuenta. */
      requestAnimationFrame(() => { log.scrollTop = log.scrollHeight; });
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

        const summary = AGENT_FLOW.map((q, i) => ({
          key: store.pick(q.k),
          value: state.picks[i] || '—'
        }));

        /* El envío NO vive aquí: renderFoot está suscrita al store y se
           ejecuta un número indeterminado de veces. Dos pulsaciones del
           conmutador de idioma generaban dos leads duplicados idénticos.
           Se dispara una sola vez, desde enviarLead(). */
        enviarLead(summary, wrap);

        /* Construir enlace de WhatsApp con resumen */
        const waMsgLines = summary.map((s) => `${s.key}: ${s.value}`);
        const waMsg = 'Hola, soy ' + (state.picks[4] || '') + '.\n' + waMsgLines.join('\n');
        const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`;
        cta.href = waUrl;
        cta.target = '_blank';
        cta.rel = 'noopener noreferrer';
        cta.addEventListener('click', (e) => {
          e.preventDefault();
          state.open = false;
          render();
          window.open(waUrl, '_blank', 'noopener,noreferrer');
        });

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
        const input = document.createElement('input');
        input.className = 'ag-input';
        input.placeholder = store.pick(current.ph);
        input.value = state.draft;
        input.addEventListener('input', (e) => { state.draft = e.target.value; });
        const sendBtn = document.createElement('button');
        sendBtn.type = 'submit';
        sendBtn.className = 'ag-send';
        sendBtn.setAttribute('aria-label', store.t('ag_send'));
        sendBtn.textContent = '→';
        // I-72: los dos campos no tenian nombre accesible.
        input.setAttribute('aria-label', store.pick(current.ph));
        const aviso = document.createElement('p');
        aviso.className = 'ag-note ag-invalid';
        aviso.setAttribute('role', 'alert');
        aviso.hidden = true;
        const esContacto = current.id === 'contact';
        const RE_CONTACTO = /^(\+?[0-9\s-]{7,15}|[^@\s]+@[^@\s]+\.[a-z]{2,})$/i;
        form.append(input, sendBtn);
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const v = state.draft.trim();
          // I-71: antes, enviar vacio no avanzaba y no decia nada. El
          // usuario quedaba bloqueado a un paso de completar.
          if (!v) {
            aviso.textContent = store.t(esContacto ? 'ag_need_contact' : 'ag_need_name');
            aviso.hidden = false; input.focus(); return;
          }
          if (esContacto && !RE_CONTACTO.test(v)) {
            aviso.textContent = store.t('ag_bad_contact');
            aviso.hidden = false; input.focus(); return;
          }
          aviso.hidden = true;
          advance(v);
        });
        foot.append(form, aviso);
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
