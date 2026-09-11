/* modules/chat-demo/chat-demo.js — reproduce en bucle una conversación real.

   No es un chat interactivo: es una demostración temporizada. El usuario
   interactúa con el agente de prospección, que vive en modules/agent/. */

import { CHATSCRIPT } from '../../data/chat.js';
import { AGENT_ICON } from '../agent/agent.js';

const STEP_MS = 1600;

export default {
  name: 'chat-demo',

  mount(host, store) {
    const log    = host.querySelector('[data-role="log"]');
    const stats  = host.querySelector('[data-role="stats"]');
    const avatar = host.querySelector('[data-role="avatar"]');
    const cta    = host.querySelector('[data-role="cta"]');

    avatar.innerHTML = AGENT_ICON(19);
    cta.addEventListener('click', () => window.dispatchEvent(new CustomEvent('ts:agent-open')));

    let shown = 0, typing = true, timer = null;

    const renderStats = () => {
      const L = store.state.lang;
      const rows = [
        { v: '2 s',  l: L === 'es' ? 'primera respuesta' : 'first response' },
        { v: '24/7', l: L === 'es' ? 'sin turnos ni descansos' : 'no shifts, no breaks' },
        { v: '0',    l: L === 'es' ? 'conversaciones sin responder' : 'unanswered conversations' },
      ];
      stats.replaceChildren(...rows.map((r) => {
        const d = document.createElement('div');
        d.className = 'live-stat';
        d.innerHTML = `<div class="live-stat-v">${r.v}</div><div class="live-stat-l"></div>`;
        d.querySelector('.live-stat-l').textContent = r.l;
        return d;
      }));
    };

    const renderLog = () => {
      const script = CHATSCRIPT[store.state.lang];
      const nodes = script.slice(0, shown).map((m) => {
        const b = document.createElement('div');
        b.className = m.u ? 'bubble-you' : 'bubble-bot';
        b.textContent = m.t;
        return b;
      });
      if (typing && shown < script.length) {
        const t = document.createElement('div');
        t.className = 'bubble-typing';
        t.innerHTML = '<i></i><i></i><i></i>';
        nodes.push(t);
      }
      log.replaceChildren(...nodes);
    };

    const tick = () => {
      const script = CHATSCRIPT[store.state.lang];
      if (shown >= script.length) { shown = 0; typing = true; }
      else { shown += 1; typing = shown < script.length ? !script[shown]?.u : false; }
      renderLog();
    };

    const start = () => { clearInterval(timer); timer = setInterval(tick, STEP_MS); };

    renderStats();
    renderLog();
    start();

    store.subscribe(() => { shown = 0; typing = true; renderStats(); renderLog(); });
  },
};
