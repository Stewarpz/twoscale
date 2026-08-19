/* modules/mockups/mockups.js — las tres demos de cliente.

   Las tres viven bajo .bs (Broadsheet encapsulado): papel claro, Source Serif 4,
   cian y magenta. La paleta oscura del sitio NO entra aquí, y al revés tampoco:
   por eso el sistema está encapsulado en vendor/broadsheet.css.

   La 02 es una demo externa en iframe. No se reinterpreta ni se toca su código:
   tiene su propia lógica de recorrido guiado ya afinada. */

import { SERVICES } from '../../data/services.js';
import { DASH_GOALS, KPI_TREE } from '../../data/dash.js';
import { APPFEAT } from '../../data/misc.js';

/* Tokens del sistema, leídos por variable: nunca hexadecimales a mano. */
const BS = {
  paper: 'var(--color-bg)', sur: 'var(--color-surface)', ink: 'var(--color-text)',
  mut: 'var(--color-neutral-600)', cyan: 'var(--color-accent)', cyanT: 'var(--color-accent-700)',
  mag: 'var(--color-accent-2)', line: 'var(--color-divider)',
};
const SERIF = "'Source Serif 4',Georgia,serif";

/* Las fotos se imprimen como planchas de color: Broadsheet pide ese tratamiento,
   y sin fotografías reales las planchas son lo más honesto que se puede dibujar. */
const PLATES = [
  'linear-gradient(150deg,#C9A98C,#8E7057)', 'linear-gradient(160deg,#A8B4A0,#6E7D6B)',
  'linear-gradient(140deg,#D3C0A8,#9A8468)', 'linear-gradient(155deg,#B6A894,#7C6E5C)',
  'linear-gradient(145deg,#C2B39C,#8A7963)', 'linear-gradient(165deg,#AEBAB8,#71807E)',
];

const node = (tag, style, content) => {
  const n = document.createElement(tag);
  if (style) n.style.cssText = style;
  if (content != null) n.textContent = content;
  return n;
};

export default {
  name: 'mockups',

  mount(host, store) {
    const q = (r) => host.querySelector(`[data-role="${r}"]`);
    const siteData = SERVICES.find((s) => s.dia === 'aida').dg.site;
    const dashData = SERVICES.find((s) => s.dia === 'analytics').dg;

    const state = { screen: 0, lightbox: null, testimonial: 0, question: 0, branches: [false, false] };

    /* ---------- lo que gestiona el sistema ---------- */
    const renderManages = () => {
      q('manages').replaceChildren(...APPFEAT.map((f) => {
        const cell = node('div');
        cell.className = 'mck-manage';
        cell.append(node('i', '', '✓'), node('span', '', store.pick(f)));
        return cell;
      }));
    };

    /* ---------- maqueta 01 · web navegable ---------- */
    const renderSite = () => {
      const d = siteData, cur = state.screen;
      q('site-url').textContent = d.url;

      const screen = q('site');
      screen.replaceChildren();
      screen.style.cssText = `min-height:420px;background:${BS.paper};color:${BS.ink};font-family:${SERIF};padding:0`;

      /* cabecera con el índice navegable */
      const head = node('div', `display:flex;align-items:baseline;gap:18px;padding:16px 22px;border-bottom:1px solid ${BS.line};flex-wrap:wrap`);
      head.append(node('span', `font-family:${SERIF};font-weight:600;font-size:17px;color:${BS.ink}`, d.brand));
      const nav = node('div', 'display:flex;gap:14px;flex-wrap:wrap;margin-left:auto');
      store.pick(d.nav).forEach((label, i) => {
        const b = node('button', `font-family:${SERIF};font-size:11px;letter-spacing:.2px;cursor:pointer;` +
          `background:none;border:none;padding:2px 0;transition:color .3s;` +
          `border-bottom:1px solid ${i === cur ? BS.cyan : 'transparent'};color:${i === cur ? BS.cyanT : BS.mut}`, label);
        b.addEventListener('click', () => { state.screen = i; state.lightbox = null; renderSite(); });
        nav.append(b);
      });
      head.append(nav);
      screen.append(head);

      const body = node('div', 'padding:22px;display:flex;flex-direction:column;min-height:360px');

      if (cur === 0) {
        body.append(
          node('div', `font-family:${SERIF};font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:${BS.mut}`, store.pick(d.dateline)),
          node('h2', `font-family:${SERIF};font-weight:600;font-size:clamp(22px,3vw,34px);line-height:1.1;margin:12px 0 0;color:${BS.ink}`, store.pick(d.h1)),
          node('p', `font-size:13.5px;color:${BS.mut};margin:10px 0 0;max-width:44ch`, store.pick(d.sub)));
        const cta = node('button', '', store.pick(d.cta));
        cta.className = 'btn btn-primary';
        cta.style.cssText = 'align-self:flex-start;margin-top:18px';
        cta.addEventListener('click', () => { state.screen = 4; renderSite(); });
        body.append(cta, node('div', `flex:1;min-height:120px;margin-top:18px;border-radius:2px;background:${PLATES[0]}`));
      }

      if (cur === 1) {
        body.append(
          node('h2', `font-family:${SERIF};font-weight:600;font-size:24px;color:${BS.ink}`, store.pick(d.houseT)),
          node('p', `font-size:13.5px;color:${BS.mut};margin:10px 0 0;max-width:52ch`, store.pick(d.houseP)));
        const specs = node('div', 'display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:20px');
        store.pick(d.specs).forEach(([v, l]) => {
          const cell = node('div');
          cell.append(
            node('div', `font-family:${SERIF};font-weight:600;font-size:20px;color:${BS.ink}`, v),
            node('div', `font-family:${SERIF};font-size:10px;color:${BS.mut};margin-top:2px`, l));
          specs.append(cell);
        });
        body.append(specs, node('div', `flex:1;min-height:100px;margin-top:20px;border-radius:2px;background:${PLATES[3]}`));
      }

      if (cur === 2) {
        body.append(
          node('h2', `font-family:${SERIF};font-weight:600;font-size:24px;color:${BS.ink}`, store.pick(d.galT)),
          node('p', `font-size:13px;color:${BS.mut};margin:8px 0 0`, store.pick(d.galS)));
        const grid = node('div', 'display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px;flex:1;min-height:0');
        store.pick(d.galCaps).forEach((cap, i) => {
          const col = node('div', 'display:flex;flex-direction:column;gap:5px;min-height:0');
          const plate = node('button', `aspect-ratio:4/3;border-radius:2px;border:none;padding:0;cursor:pointer;width:100%;flex:1;background:${PLATES[i % PLATES.length]}`);
          plate.addEventListener('click', () => { state.lightbox = i; renderSite(); });
          col.append(plate, node('span', `font-family:${SERIF};font-size:8.5px;color:${BS.mut}`, cap));
          grid.append(col);
        });
        body.append(grid);
      }

      if (cur === 3) {
        body.append(
          node('h2', `font-family:${SERIF};font-weight:600;font-size:24px;color:${BS.ink}`, store.pick(d.priceT)),
          node('p', `font-size:13px;color:${BS.mut};margin:8px 0 0`, store.pick(d.priceS)));
        const table = node('div', 'margin-top:16px');
        store.pick(d.rates).forEach(([a, b, c]) => {
          const row = node('div', `display:grid;grid-template-columns:1.2fr 1fr auto;gap:12px;align-items:baseline;padding:11px 0;border-top:1px solid ${BS.line}`);
          row.append(
            node('span', `font-size:13px;color:${BS.ink}`, a),
            node('span', `font-size:12px;color:${BS.mut}`, b),
            node('span', `font-family:${SERIF};font-weight:600;font-size:15px;color:${BS.ink}`, c));
          table.append(row);
        });
        body.append(table, node('p', `font-family:${SERIF};font-size:10px;color:${BS.mut};margin-top:14px`, store.pick(d.priceNote)));
      }

      if (cur === 4) {
        body.append(
          node('h2', `font-family:${SERIF};font-weight:600;font-size:24px;color:${BS.ink}`, store.pick(d.bookT)),
          node('p', `font-size:13px;color:${BS.mut};margin:8px 0 0;max-width:48ch`, store.pick(d.bookS)));
        const feats = node('div', 'display:flex;flex-direction:column;gap:9px;margin-top:18px');
        [d.f1, d.f2, d.f3].forEach((f) => {
          const s = node('span', `display:flex;gap:9px;font-size:13px;color:${BS.ink}`);
          s.append(node('span', `color:${BS.cyanT}`, '✓'), node('span', '', store.pick(f)));
          feats.append(s);
        });
        const btn = node('button', 'align-self:flex-start;margin-top:18px', store.pick(d.bookB));
        btn.className = 'btn btn-primary';
        body.append(feats, btn);

        /* testimonios rotando */
        const t = d.testimonials[state.testimonial % d.testimonials.length];
        const quote = node('div', `margin-top:auto;padding-top:18px;border-top:1px solid ${BS.line}`);
        quote.append(
          node('p', `font-family:${SERIF};font-style:italic;font-size:14px;color:${BS.ink};max-width:46ch`, '“' + store.pick(t.q) + '”'),
          node('div', `font-family:${SERIF};font-size:9.5px;letter-spacing:.6px;color:${BS.mut};margin-top:8px`, store.pick(t.w)));
        const dots = node('div', 'display:flex;gap:5px;margin-top:16px');
        d.testimonials.forEach((_, i) => {
          const on = i === state.testimonial % d.testimonials.length;
          const b = node('button', `width:${on ? 15 : 5}px;height:5px;border-radius:3px;border:none;padding:0;cursor:pointer;transition:all .45s;background:${on ? BS.mag : '#C7C3BF'}`);
          b.addEventListener('click', () => { state.testimonial = i; renderSite(); });
          dots.append(b);
        });
        quote.append(dots);
        body.append(quote);
      }

      if (cur === 5) {
        body.append(
          node('h2', `font-family:${SERIF};font-weight:600;font-size:24px;color:${BS.ink}`, store.pick(d.contT)),
          node('p', `font-size:13px;color:${BS.mut};margin:8px 0 0`, store.pick(d.contS)));
        const list = node('div', 'display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:20px');
        store.pick(d.conts).forEach(([a, b]) => {
          const cell = node('div');
          cell.append(
            node('div', `font-family:${SERIF};font-size:9.5px;letter-spacing:1px;text-transform:uppercase;color:${BS.mut}`, a),
            node('div', `font-size:13.5px;color:${BS.ink};margin-top:4px`, b));
          list.append(cell);
        });
        body.append(list);
      }

      screen.append(body);

      /* galería ampliada: modal real del sistema, no un cambio de pantalla */
      if (state.lightbox !== null) {
        const backdrop = node('div');
        backdrop.className = 'dialog-backdrop';
        backdrop.addEventListener('click', () => { state.lightbox = null; renderSite(); });
        const dialog = node('div');
        dialog.className = 'dialog';
        dialog.addEventListener('click', (e) => e.stopPropagation());
        dialog.append(node('div', `height:150px;border-radius:2px;background:${PLATES[state.lightbox % PLATES.length]}`));
        const title = node('div', 'font-size:15px', store.pick(d.galCaps)[state.lightbox]);
        title.className = 'dialog-title';
        dialog.append(title);
        const actions = node('div', 'align-items:center');
        actions.className = 'dialog-actions';
        actions.append(node('span', `margin-right:auto;font-size:11px;color:${BS.mut}`, `${state.lightbox + 1} / 6`));
        [['←', -1], ['→', 1]].forEach(([label, delta]) => {
          const b = node('button', '', label);
          b.className = 'btn btn-secondary btn-icon';
          b.addEventListener('click', () => { state.lightbox = (state.lightbox + delta + 6) % 6; renderSite(); });
          actions.append(b);
        });
        const close = node('button', '', store.state.lang === 'es' ? 'Volver' : 'Back');
        close.className = 'btn btn-secondary';
        close.addEventListener('click', () => { state.lightbox = null; renderSite(); });
        actions.append(close);
        dialog.append(actions);
        backdrop.append(dialog);
        screen.append(backdrop);
      }
    };

    /* ---------- maqueta 03 · panel de análisis ---------- */
    const renderDash = () => {
      const box = q('dash');
      box.replaceChildren();
      box.style.cssText = `background:${BS.paper};color:${BS.ink};font-family:${SERIF};padding:0`;

      const defs = [dashData.q1, dashData.q2, dashData.q3, dashData.q4];
      const dq = state.question, def = defs[dq], goal = DASH_GOALS[dq];

      const head = node('div', `display:flex;align-items:baseline;gap:14px;padding:14px 20px;border-bottom:1px solid ${BS.line}`);
      head.append(node('span', `font-family:${SERIF};font-weight:600;font-size:15px;color:${BS.ink}`, store.pick(dashData.client)));
      box.append(head);

      const grid = node('div', 'display:grid;grid-template-columns:220px 1fr;gap:0;min-height:400px');

      /* las cuatro preguntas de negocio */
      const side = node('div', `border-right:1px solid ${BS.line};padding:16px 12px;display:flex;flex-direction:column;gap:4px`);
      defs.forEach((d2, i) => {
        const b = node('button', `font-family:${SERIF};font-size:12px;text-align:left;padding:10px 13px;border-radius:2px;cursor:pointer;` +
          `border:none;transition:all .3s;background:${i === dq ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent'};` +
          `color:${i === dq ? BS.cyanT : BS.mut};border-left:2px solid ${i === dq ? BS.cyan : 'transparent'}`, store.pick(d2.q));
        b.addEventListener('click', () => { state.question = i; renderDash(); });
        side.append(b);
      });

      const main = node('div', 'padding:22px;display:flex;flex-direction:column');
      const kpiRow = node('div', 'display:flex;align-items:baseline;gap:14px;flex-wrap:wrap');
      kpiRow.append(
        node('span', `font-family:${SERIF};font-weight:600;font-size:38px;letter-spacing:-1px;color:${BS.ink}`, def.headline),
        node('span', `font-family:${SERIF};font-size:10px;color:${BS.mut}`, store.pick(def.hl)));
      const tag = node('span', 'gap:7px', goal.met ? store.t('cal_ok') && (store.state.lang === 'es' ? 'Meta cumplida' : 'Target met') : (store.state.lang === 'es' ? 'Bajo meta' : 'Below target'));
      tag.className = 'tag ' + (goal.met ? 'tag-accent' : 'tag-accent-2');
      kpiRow.append(tag);
      main.append(kpiRow, node('div', `font-size:11px;color:${BS.mut};margin-top:7px`, store.pick(goal.g)));

      /* el gráfico propio de cada pregunta */
      const chart = node('div', 'margin-top:22px;flex:1;min-height:150px');
      if (dq === 0) {
        def.rows.forEach((r) => {
          const row = node('div', 'display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;margin-bottom:12px');
          const left = node('div');
          left.append(node('div', `font-family:${SERIF};font-size:11px;color:${BS.mut};margin-bottom:5px`, store.pick(r.c)));
          left.append(node('div', `height:9px;border-radius:1px;width:${r.bar}%;background:${r.hot ? BS.mag : BS.cyan};opacity:${r.hot ? 1 : 0.55}`));
          row.append(left, node('span', `font-family:${SERIF};font-weight:600;font-size:13px;color:${BS.ink}`, r.cac));
          chart.append(row);
        });
      } else if (dq === 1) {
        const all = def.real.concat(def.proj), mx = Math.max(...all);
        const bars = node('div', 'display:flex;align-items:flex-end;gap:8px;height:150px');
        store.pick(def.months).forEach((m, i) => {
          const isProj = i >= def.real.length, v = all[i];
          const col = node('div', 'flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:6px;height:100%');
          const hold = node('div', 'width:100%;flex:1;display:flex;align-items:flex-end');
          hold.append(node('div', `width:100%;height:${Math.round(v / mx * 100)}%;border-radius:1px;` +
            `background:${isProj ? 'transparent' : BS.cyan};border:${isProj ? '1px dashed ' + BS.mag : 'none'}`));
          col.append(hold, node('span', `font-family:${SERIF};font-size:9px;color:${BS.mut}`, m));
          bars.append(col);
        });
        chart.append(bars);
      } else if (dq === 2) {
        const bars = node('div', 'display:flex;align-items:flex-end;gap:10px;height:150px');
        def.slots.forEach((sl) => {
          const col = node('div', 'flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:6px;height:100%');
          const hold = node('div', 'width:100%;flex:1;display:flex;align-items:flex-end');
          hold.append(node('div', `width:100%;height:${sl.v}%;border-radius:1px;background:${sl.v < 70 ? BS.mag : BS.cyan};opacity:${sl.v < 70 ? 1 : 0.7}`));
          col.append(hold, node('span', `font-family:${SERIF};font-size:9px;color:${BS.mut}`, store.pick(sl.d)));
          bars.append(col);
        });
        chart.append(bars);
      } else {
        def.rows.forEach((r) => {
          const row = node('div', `display:grid;grid-template-columns:1.4fr auto 1fr;gap:14px;align-items:center;padding:12px 0;border-top:1px solid ${BS.line}`);
          const pill = node('span', 'justify-self:start', store.pick(r.w));
          pill.className = 'tag ' + (r.k === 'warn' ? 'tag-accent-2' : 'tag-neutral');
          row.append(
            node('span', `font-size:12.5px;color:${BS.ink}`, store.pick(r.t)),
            node('span', `font-family:${SERIF};font-weight:600;font-size:19px;color:${r.k === 'warn' ? BS.mag : BS.mut}`, r.n),
            pill);
          chart.append(row);
        });
      }
      main.append(chart);

      /* cómo se lee la cifra */
      const read = node('div', `margin-top:18px;padding-top:16px;border-top:1px solid ${BS.line}`);
      read.append(
        node('div', `font-family:${SERIF};font-size:8.5px;letter-spacing:1.1px;text-transform:uppercase;color:${BS.cyanT}`, store.state.lang === 'es' ? 'Cómo se lee' : 'How to read it'),
        node('p', `font-size:13px;color:${BS.ink};margin-top:8px;max-width:62ch`, store.pick(def.insight)));
      main.append(read);

      /* árbol de indicadores, desplegable */
      const tree = node('div', 'margin-top:22px;gap:0');
      tree.className = 'card';
      const kicker = node('div', '', store.state.lang === 'es' ? 'Árbol de indicadores' : 'Indicator tree');
      kicker.className = 'card-kicker';
      tree.append(kicker);
      const root = node('div', `display:flex;align-items:baseline;gap:12px;margin-top:11px;padding-bottom:9px;border-bottom:1px solid ${BS.line}`);
      root.append(
        node('span', `flex:1;font-size:13px;color:${BS.ink}`, store.pick(KPI_TREE.root.n)),
        node('span', `font-weight:600;font-size:16px;color:${BS.ink}`, KPI_TREE.root.v),
        node('span', `font-size:9.5px;color:${BS.cyanT};width:52px;text-align:right`, KPI_TREE.root.d));
      tree.append(root);

      KPI_TREE.branches.forEach((br, i) => {
        const open = state.branches[i];
        const b = node('button', `display:flex;align-items:baseline;gap:12px;width:100%;text-align:left;padding:9px 0 9px 16px;` +
          `border:none;border-bottom:1px solid ${BS.line};background:transparent;cursor:pointer;font-family:inherit`);
        b.append(
          node('span', `font-family:${SERIF};font-size:10px;color:${BS.cyanT};width:9px;flex:none`, open ? '−' : '+'),
          node('span', `flex:1;font-size:12px;color:${BS.ink}`, store.pick(br.n)),
          node('span', `font-weight:600;font-size:13px;color:${BS.ink}`, br.v),
          node('span', `font-size:9.5px;color:${br.up ? BS.cyanT : BS.mag};width:52px;text-align:right`, br.d));
        b.addEventListener('click', () => { state.branches[i] = !open; renderDash(); });
        tree.append(b);
        if (open) br.kids.forEach((k) => {
          const kid = node('div', `display:grid;grid-template-columns:1fr auto 52px;gap:12px;align-items:baseline;padding:8px 0 8px 41px;border-bottom:1px solid ${BS.line}`);
          kid.append(
            node('span', `font-size:11.5px;color:${BS.mut}`, store.pick(k.n)),
            node('span', `font-size:12px;color:${BS.ink}`, k.v),
            node('span', `font-size:9.5px;color:${k.up ? BS.cyanT : BS.mag};text-align:right`, typeof k.d === 'object' ? store.pick(k.d) : k.d));
          tree.append(kid);
        });
      });
      main.append(tree);

      grid.append(side, main);
      box.append(grid);
    };

    /* ---------- maqueta 02 · el widget flotante se retira aquí ----------
       La tarjeta es de ancho casi completo: no hay hueco lateral al que
       apartarse, así que el agente se apaga mientras está a la vista. */
    const watchAurea = () => {
      const zone = q('aurea-zone');
      if (!zone || !window.IntersectionObserver) return;
      new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          window.dispatchEvent(new CustomEvent('ts:hide-agent', { detail: e.isIntersecting }));
        });
      }, { rootMargin: '-25% 0px -25% 0px' }).observe(zone);
    };

    const renderAll = () => { renderManages(); renderSite(); renderDash(); };
    renderAll();
    watchAurea();
    // Los testimonios rotan solos, como en el sitio.
    setInterval(() => { if (state.screen === 4) { state.testimonial++; renderSite(); } }, 5200);
    store.subscribe(renderAll);
  },
};
