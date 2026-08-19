/* modules/workflow/workflow.js — lienzo tipo n8n con cámara automática.

   Cada escenario declara nodos con coordenadas, aristas con rama opcional y
   una lista de etapas. La cámara centra la etapa activa, atenúa lo demás y
   avanza sola; al terminar un escenario pasa al siguiente. No se puede pausar:
   es una vitrina, no un editor. */

import { WF_W, WF_H, SUBS, PORT_Y, BR_COLOR, BR_LABEL, WFS } from '../../data/workflows.js';
import { ICON } from '../../data/icons.js';
import { maskIcon } from '../../app.js';

const STAGE_MS = 3400;
const ROLE = { trigger:'TRIGGER', if:'BRANCH', switch:'SWITCH', agent:'AI AGENT', store:'STORAGE' };

export default {
  name: 'workflow',

  mount(host, store) {
    const canvas = host.querySelector('[data-role="canvas"]');
    const chips  = host.querySelector('[data-role="chips"]');
    const q = (r) => host.querySelector(`[data-role="${r}"]`);

    const state = { wf: 0, stage: 0, node: null };
    let timer = null;

    const advance = () => {
      const total = WFS[state.wf].stages.length;
      if (state.stage + 1 < total) { state.stage += 1; }
      else { state.stage = 0; state.wf = (state.wf + 1) % WFS.length; }
      state.node = null;
      render();
    };

    const restart = () => { clearInterval(timer); timer = setInterval(advance, STAGE_MS); };

    /* --- geometría --- */
    const outPort = (n, br) => ({ x: n.x + WF_W, y: n.y + (br ? PORT_Y[br] : WF_H / 2) });
    const inPort  = (n) => ({ x: n.x, y: n.y + WF_H / 2 });

    const render = () => {
      const sc = WFS[state.wf];
      const byId = {};
      sc.nodes.forEach((n) => { byId[n.id] = n; });

      const stage = sc.stages[Math.min(state.stage, sc.stages.length - 1)];
      const camIds = stage.ids === 'all' ? sc.nodes.map((n) => n.id) : stage.ids;
      const focus = new Set(camIds);
      const camNodes = camIds.map((id) => byId[id]).filter(Boolean);
      const cx = camNodes.reduce((a, n) => a + n.x + WF_W / 2, 0) / camNodes.length;
      const cy = camNodes.reduce((a, n) => a + n.y + WF_H / 2, 0) / camNodes.length;
      const zoom = stage.z || sc.fit;
      const { w: CW, h: CH } = sc.canvas;

      canvas.style.cssText =
        `position:absolute;left:50%;top:50%;width:${CW}px;height:${CH}px;` +
        `margin-left:${-CW / 2}px;margin-top:${-CH / 2}px;transform-origin:center center;` +
        `transform:scale(${zoom}) translate(${(CW / 2 - cx).toFixed(1)}px,${(CH / 2 - cy).toFixed(1)}px);` +
        `transition:transform 1.5s cubic-bezier(.62,.03,.24,1);` +
        `background-image:radial-gradient(circle at 1px 1px,rgba(247,244,238,.09) 1px,transparent 0);background-size:26px 26px`;

      const NS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('width', CW);
      svg.setAttribute('height', CH);
      svg.setAttribute('style', 'position:absolute;top:0;left:0;overflow:visible');

      const packets = document.createElement('div');
      packets.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none';

      const labels = [];

      /* --- sub-nodos del agente, con línea punteada --- */
      const agent = sc.nodes.find((n) => n.kind === 'agent');
      const subLit = focus.has(agent.id);
      const subY = agent.y + 124;
      const subX = SUBS.map((_, i) => agent.x - 16 + i * 54);
      subX.forEach((sx) => {
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', `M ${agent.x + WF_W / 2} ${agent.y + WF_H} C ${agent.x + WF_W / 2} ${agent.y + WF_H + 32}, ${sx + 24} ${subY - 32}, ${sx + 24} ${subY}`);
        p.setAttribute('fill', 'none');
        p.setAttribute('stroke', 'var(--line-2)');
        p.setAttribute('stroke-width', '1.5');
        p.setAttribute('stroke-dasharray', '4 5');
        p.setAttribute('opacity', subLit ? 0.7 : 0.2);
        svg.append(p);
      });

      /* --- aristas curvas + paquetes de datos viajando --- */
      sc.edges.forEach(([from, to, br], i) => {
        const p1 = outPort(byId[from], br), p2 = inPort(byId[to]);
        const co = Math.max(52, (p2.x - p1.x) * 0.55);
        const d = `M ${p1.x} ${p1.y} C ${p1.x + co} ${p1.y}, ${p2.x - co} ${p2.y}, ${p2.x} ${p2.y}`;
        const color = br ? BR_COLOR[br] : 'var(--indigo-2)';
        const lit = focus.has(from) || focus.has(to);

        const path = document.createElementNS(NS, 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('opacity', lit ? 0.95 : 0.3);
        svg.append(path);

        [[9, 'var(--ambar)', 0], [7, 'var(--indigo-2)', 1.3]].forEach(([size, fill, offset]) => {
          const dot = document.createElement('span');
          dot.className = 'flowdot';
          dot.style.cssText =
            `position:absolute;top:0;left:0;width:${size}px;height:${size}px;border-radius:50%;` +
            `background:${fill};box-shadow:0 0 12px ${fill};offset-path:path('${d}');offset-rotate:0deg;` +
            `animation:pkt 2.6s linear infinite;animation-delay:${(i * 0.28 + offset).toFixed(2)}s`;
          packets.append(dot);
        });

        if (br) {
          const above = br === 'true' || br === 'a';
          const tag = document.createElement('span');
          tag.className = 'wf-edge-label';
          tag.style.cssText =
            `left:${p1.x + 13}px;top:${above ? p1.y - 25 : p1.y + 8}px;color:${color};opacity:${lit ? 1 : 0.35}`;
          tag.textContent = store.pick(BR_LABEL[br]);
          labels.push(tag);
        }
      });

      canvas.replaceChildren(svg, packets, ...labels);

      /* --- sub-nodos visibles --- */
      SUBS.forEach((s, i) => {
        const box = document.createElement('div');
        box.className = 'wf-sub';
        box.style.cssText = `left:${subX[i]}px;top:${subY}px;opacity:${subLit ? 1 : 0.4}`;
        box.innerHTML = `<span class="wf-sub-chip">${s.mono}</span><span class="wf-sub-label"></span>`;
        box.querySelector('.wf-sub-label').textContent = store.pick(s.label);
        canvas.append(box);
      });

      /* --- nodos --- */
      const selId = state.node || camIds[0];
      sc.nodes.forEach((n) => {
        const sel = selId === n.id, lit = focus.has(n.id);
        const isTrig = n.kind === 'trigger';
        const isBranch = n.kind === 'if' || n.kind === 'switch';
        const outs = n.kind === 'switch' ? ['a', 'b', 'c'] : n.kind === 'if' ? ['true', 'false'] : ['x'];

        const btn = document.createElement('button');
        btn.className = 'wfnode';
        btn.style.cssText =
          `left:${n.x}px;top:${n.y}px;width:${WF_W}px;height:${WF_H}px;` +
          `background:${sel ? 'rgba(240,169,62,.12)' : 'rgba(28,32,41,.9)'};` +
          `border:1.5px solid ${sel ? 'var(--ambar)' : lit ? 'var(--indigo-2)' : 'var(--line-2)'};` +
          `border-radius:${isTrig ? '33px 12px 12px 33px' : '12px'};opacity:${lit ? 1 : 0.34};` +
          `box-shadow:${lit ? '0 12px 40px -14px rgba(75,59,209,.7)' : 'none'}`;

        if (!isTrig) {
          const p = document.createElement('span');
          p.className = 'wf-port';
          p.style.cssText = 'left:-6px;top:50%;margin-top:-5px;border:2px solid var(--indigo-2)';
          btn.append(p);
        }
        outs.forEach((b) => {
          const p = document.createElement('span');
          p.className = 'wf-port';
          p.style.cssText =
            `right:-6px;top:${b === 'x' ? WF_H / 2 : PORT_Y[b]}px;margin-top:-5px;` +
            `border:2px solid ${b === 'x' ? 'var(--indigo-2)' : BR_COLOR[b]}`;
          btn.append(p);
        });

        const badge = document.createElement('span');
        badge.className = 'wf-node-badge';
        badge.style.cssText =
          `background:${sel ? 'var(--ambar)' : 'var(--grafito)'};` +
          `color:${sel ? 'var(--grafito)' : isBranch ? '#5fd07a' : 'var(--crema-dim)'};` +
          `border:1px solid ${sel ? 'var(--ambar)' : 'var(--line)'}`;
        if (n.logo) {
          const inner = document.createElement('span');
          inner.setAttribute('style', maskIcon(ICON(n.logo), '20px 20px', sel ? 'var(--grafito)' : 'var(--crema)'));
          badge.append(inner);
        } else {
          badge.textContent = n.mono || '';
        }
        btn.append(badge);

        const txt = document.createElement('span');
        txt.className = 'wf-node-txt';
        txt.innerHTML = '<span class="wf-node-label"></span><span class="wf-node-sub"></span>';
        txt.querySelector('.wf-node-label').textContent = store.pick(n.label);
        txt.querySelector('.wf-node-sub').textContent = store.pick(n.sub);
        btn.append(txt);

        btn.addEventListener('click', () => { state.node = n.id; render(); restart(); });
        canvas.append(btn);
      });

      /* --- etapas, chips y detalle --- */
      q('stage-n').textContent =
        String(state.stage + 1).padStart(2, '0') + ' / ' + String(sc.stages.length).padStart(2, '0');
      q('stage-l').textContent = store.pick(stage.label);

      chips.replaceChildren(...sc.stages.map((st, i) => {
        const b = document.createElement('button');
        b.className = 'wf-chip';
        b.setAttribute('aria-pressed', String(i === state.stage));
        b.textContent = store.pick(st.label);
        b.addEventListener('click', () => { state.stage = i; state.node = null; render(); restart(); });
        return b;
      }));

      const sel = byId[selId] || sc.nodes[0];
      const badge = q('detail-badge');
      badge.replaceChildren();
      if (sel.logo) {
        const inner = document.createElement('span');
        inner.setAttribute('style', maskIcon(ICON(sel.logo), '22px 22px', 'var(--ambar)'));
        badge.append(inner);
      } else {
        badge.textContent = sel.mono || '';
      }
      q('detail-label').textContent = store.pick(sel.label);
      q('detail-role').textContent = ROLE[sel.kind] || 'ACTION';
      q('detail-info').textContent = store.pick(sel.info);
    };

    render();
    restart();
    store.subscribe(render);
  },
};
