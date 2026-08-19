/* modules/services/services.js — explorador de servicios.

   Cada servicio declara una metodología (`dia`) y ARTIFACTS tiene un dibujante
   por cada una. Añadir un servicio nuevo es añadir su entrada en data/services.js
   y su dibujante aquí; nada más cambia. */

import { SERVICES } from '../../data/services.js';
import { ICON } from '../../data/icons.js';
import { maskIcon } from '../../app.js';

/* helpers de DOM, locales al módulo */
const div = (cls, style) => {
  const d = document.createElement('div');
  if (cls) d.className = cls;
  if (style) d.style.cssText = style;
  return d;
};
const txt = (tag, style, content) => {
  const n = document.createElement(tag);
  if (style) n.style.cssText = style;
  if (content != null) n.textContent = content;
  return n;
};

const MONO = 'font-family:var(--fm)';
const AMBER = 'var(--ambar)';
const STONE = 'var(--piedra)';

/* ============================================================
   Un dibujante por metodología. Todos reciben (dg, store).
   ============================================================ */
const ARTIFACTS = {

  /* Value Stream Mapping — tiempo de valor contra tiempo de espera */
  vsm(dg, store) {
    const box = div('art-col', 'gap:26px');
    const bars = div('', 'display:flex;gap:12px;align-items:flex-end');
    dg.steps.forEach((st) => {
      const col = div('', 'flex:1;display:flex;flex-direction:column;gap:8px;min-width:0');
      const stack = div('', 'display:flex;flex-direction:column;justify-content:flex-end;gap:4px;height:78px');
      stack.append(
        txt('span', `height:${Math.max(6, st.wait * 0.55)}px;border-radius:3px;background:${STONE}`),
        txt('span', `height:${Math.max(6, st.val * 1.5)}px;border-radius:3px;background:${AMBER}`),
      );
      col.append(stack,
        txt('span', 'font-family:var(--fh);font-weight:600;font-size:12px;color:var(--crema);white-space:nowrap;overflow:hidden;text-overflow:ellipsis', store.pick(st.l)),
        txt('span', `${MONO};font-size:9.5px;color:${STONE}`, `${st.wait} min · ${st.val} min`));
      bars.append(col);
    });

    const legend = div('', `display:flex;gap:20px;${MONO};font-size:10px;color:${STONE}`);
    [[AMBER, store.t('vsm_value')], [STONE, store.t('vsm_wait')]].forEach(([c, label]) => {
      const s = txt('span', 'display:flex;align-items:center;gap:7px');
      s.append(txt('span', `width:11px;height:5px;border-radius:2px;background:${c}`), document.createTextNode(label));
      legend.append(s);
    });

    const ratios = div('', 'border-top:1px solid var(--line);padding-top:22px;display:flex;flex-direction:column;gap:14px');
    [[dg.before, dg.bpct, STONE], [dg.after, dg.apct, AMBER]].forEach(([label, pct, color]) => {
      const row = div();
      row.append(txt('div', `${MONO};font-size:10px;letter-spacing:1px;color:${color === AMBER ? AMBER : STONE};margin-bottom:7px`, store.pick(label)));
      const track = div('art-track', 'height:13px;border-radius:6px');
      track.append(txt('div', `height:100%;width:${pct}%;border-radius:6px;background:${color}`));
      row.append(track);
      ratios.append(row);
    });

    box.append(bars, legend, ratios);
    return box;
  },

  /* BPMN — evento de inicio, compuerta y tres rutas con su porcentaje */
  bpmn(dg, store) {
    const row = div('forkrow', 'display:flex;align-items:center;gap:20px');

    const start = div('', 'flex:none;display:flex;flex-direction:column;align-items:center;gap:9px');
    const ring = div('', 'width:44px;height:44px;border-radius:50%;border:2px solid var(--indigo-2);display:grid;place-items:center');
    ring.append(txt('span', 'width:12px;height:12px;border-radius:50%;background:var(--indigo-2)'));
    start.append(ring, txt('span', `${MONO};font-size:9.5px;color:${STONE};text-align:center;max-width:70px`, store.pick(dg.start)));

    const gate = div('', 'flex:none;display:flex;flex-direction:column;align-items:center;gap:9px');
    const diamond = div('', `width:44px;height:44px;background:var(--grafito);border:2px solid ${AMBER};transform:rotate(45deg);border-radius:5px;display:grid;place-items:center`);
    diamond.append(txt('span', `transform:rotate(-45deg);${MONO};font-weight:700;font-size:14px;color:${AMBER}`, '?'));
    gate.append(diamond, txt('span', `${MONO};font-size:9.5px;color:${STONE};text-align:center;max-width:88px`, store.pick(dg.gate)));

    const outs = div('', 'flex:1;display:flex;flex-direction:column;gap:8px;min-width:0');
    dg.outs.forEach((o, i) => {
      const r = div('', `display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:9px;` +
        `background:${o.hot ? 'rgba(240,169,62,.12)' : 'rgba(28,32,41,.9)'};` +
        `border:1px solid ${o.hot ? AMBER : 'var(--line-2)'}`);
      r.append(
        txt('span', `width:7px;height:7px;flex:none;border-radius:50%;background:${o.hot ? AMBER : 'var(--indigo-2)'};animation:blink 1.6s infinite ${i * 0.25}s`),
        txt('span', `flex:1;font-family:var(--fh);font-weight:600;font-size:12.5px;color:${o.hot ? 'var(--crema)' : 'var(--crema-dim)'}`, store.pick(o.l)),
        txt('span', `${MONO};font-size:10.5px;color:${o.hot ? AMBER : STONE}`, o.p));
      outs.append(r);
    });

    const dash = () => txt('span', 'flex:none;width:26px;height:2px;background:var(--line-2)');
    row.append(start, dash(), gate, dash(), outs);
    return row;
  },

  /* RACI — quién ejecuta y quién decide */
  raci(dg, store) {
    const COLOR = { R: AMBER, A: AMBER, C: 'var(--indigo-2)', I: STONE, '-': 'rgba(139,141,152,.3)' };
    const GRID = 'display:grid;grid-template-columns:1.6fr repeat(3,minmax(0,1fr));gap:8px;align-items:center';
    const box = div();

    const head = div('', GRID);
    head.append(txt('span'));
    store.pick(dg.cols).forEach((c) => head.append(txt('span', `${MONO};font-size:9.5px;letter-spacing:.6px;color:${STONE};text-align:center`, c)));
    box.append(head);

    const body = div('', 'display:flex;flex-direction:column;gap:6px;margin-top:11px');
    dg.rows.forEach((r) => {
      const row = div('', GRID);
      row.append(txt('span', 'font-family:var(--fh);font-weight:600;font-size:12.5px;color:var(--crema-dim)', store.pick(r.t)));
      r.v.forEach((v) => row.append(txt('span',
        `display:grid;place-items:center;height:30px;border-radius:7px;${MONO};font-weight:700;font-size:11.5px;` +
        `background:${v === 'R' ? 'rgba(240,169,62,.16)' : v === 'C' ? 'rgba(75,59,209,.16)' : 'transparent'};color:${COLOR[v]}`, v)));
      body.append(row);
    });
    box.append(body);

    const es = store.state.lang === 'es';
    const legend = div('', 'display:flex;flex-wrap:wrap;gap:18px;margin-top:20px;border-top:1px solid var(--line);padding-top:16px');
    [['R', es ? 'Ejecuta' : 'Executes'], ['C', es ? 'Consultado' : 'Consulted'], ['I', es ? 'Informado' : 'Informed']]
      .forEach(([k, label]) => {
        const s = txt('span', `${MONO};font-size:9.5px;color:${STONE}`);
        s.append(txt('span', `color:${AMBER};font-weight:700`, k), document.createTextNode(' · ' + label));
        legend.append(s);
      });
    box.append(legend);
    return box;
  },

  /* Embudo de conversación con su tasa entre etapas */
  funnel(dg, store) {
    const box = div('art-col', 'gap:15px');
    dg.steps.forEach((st) => {
      const row = div();
      const head = div('', 'display:flex;align-items:baseline;gap:10px;margin-bottom:7px');
      head.append(txt('span', `${MONO};font-size:10px;letter-spacing:1px;color:${STONE}`, store.pick(st.l)));
      if (st.cv) head.append(txt('span', `${MONO};font-size:10px;color:${AMBER}`, st.cv));
      const bar = div('', `height:32px;width:${st.pct}%;min-width:64px;border-radius:7px;display:flex;align-items:center;padding:0 12px;` +
        `background:linear-gradient(90deg,${AMBER},rgba(240,169,62,.55))`);
      bar.append(txt('span', 'font-family:var(--fh);font-weight:700;font-size:14px;color:var(--grafito)', st.v));
      row.append(head, bar);
      box.append(row);
    });
    return box;
  },

  /* Pareto — barras descendentes con acumulado */
  pareto(dg, store) {
    const box = div();
    const chart = div('', 'display:flex;align-items:flex-end;gap:14px;height:150px');
    dg.bars.forEach((b) => {
      const col = div('', 'flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:8px;height:100%;min-width:0');
      col.append(txt('span', `${MONO};font-size:10px;color:${AMBER}`, b.cum));
      const hold = div('', 'width:100%;flex:1;display:flex;align-items:flex-end');
      hold.append(txt('span', `width:100%;height:${b.pct}%;border-radius:5px 5px 0 0;background:${b.pct >= 34 ? AMBER : STONE}`));
      col.append(hold);
      chart.append(col);
    });
    const labels = div('', 'display:flex;gap:14px;margin-top:10px');
    dg.bars.forEach((b) => labels.append(txt('span',
      'flex:1;min-width:0;font-family:var(--fh);font-weight:600;font-size:11px;color:var(--crema-dim);text-align:center;overflow-wrap:anywhere',
      store.pick(b.l))));
    box.append(chart, labels, txt('p', '', store.pick(dg.cut)));
    box.lastChild.className = 'art-note';
    return box;
  },

  /* Sales Velocity — las cuatro variables y la fórmula */
  velocity(dg, store) {
    const box = div();
    const grid = div('velgrid', 'display:grid;grid-template-columns:repeat(4,1fr);gap:12px');
    dg.vars.forEach((v) => {
      const card = div('art-card');
      card.append(txt('div', `${MONO};font-size:9.5px;letter-spacing:.5px;color:${STONE}`, store.pick(v.l)));
      const old = div('', 'display:flex;align-items:baseline;gap:7px;margin-top:9px');
      old.append(
        txt('span', `${MONO};font-size:11.5px;color:${STONE};text-decoration:line-through`, v.b),
        txt('span', `${MONO};font-size:11px;color:${AMBER}`, v.up ? '↑' : '↓'));
      card.append(old, txt('div', `font-family:var(--fh);font-weight:700;font-size:17px;color:${AMBER}`, v.a));
      grid.append(card);
    });
    const foot = div('', 'margin-top:20px;border-top:1px solid var(--line);padding-top:18px');
    foot.append(
      txt('p', `${MONO};font-size:11.5px;color:var(--crema-dim)`, store.pick(dg.formula)),
      txt('p', `font-family:var(--fh);font-weight:700;font-size:19px;color:${AMBER};margin:9px 0 0`, store.pick(dg.res)));
    box.append(grid, foot);
    return box;
  },

  /* AIDA — cada etapa mapeada a una zona de la página */
  aida(dg, store) {
    const box = div('art-col', 'gap:9px');
    dg.stages.forEach((st, i) => {
      const last = i === 3;
      const row = div('art-card', 'display:flex;align-items:center;gap:15px;padding:15px 17px');
      row.append(txt('span',
        `width:34px;height:34px;flex:none;display:grid;place-items:center;border-radius:9px;font-family:var(--fh);font-weight:700;font-size:15px;` +
        `background:${last ? AMBER : 'rgba(75,59,209,.2)'};color:${last ? 'var(--grafito)' : 'var(--indigo-2)'}`, st.k));
      const mid = txt('span', 'flex:1;min-width:0;display:flex;flex-direction:column;gap:2px');
      mid.append(
        txt('span', 'font-family:var(--fh);font-weight:600;font-size:13.5px;color:var(--crema)', store.pick(st.n)),
        txt('span', `${MONO};font-size:10px;color:${STONE};text-wrap:pretty`, store.pick(st.z)));
      row.append(mid, txt('span', `font-family:var(--fh);font-weight:700;font-size:15px;color:${last ? AMBER : 'var(--crema-dim)'}`, st.m));
      box.append(row);
    });
    box.append(txt('p', `${MONO};font-size:10px;color:${STONE};margin:6px 0 0`, store.t('see_mock')));
    return box;
  },

  /* Balanced Scorecard — cuatro perspectivas */
  bsc(dg, store) {
    const box = div();
    const grid = div('bscgrid', 'display:grid;grid-template-columns:1fr 1fr;gap:12px');
    dg.quads.forEach((q) => {
      const card = div('art-card', 'border-radius:13px;padding:17px');
      card.append(txt('div', `${MONO};font-size:9.5px;letter-spacing:1.2px;text-transform:uppercase;color:${AMBER}`, store.pick(q.p)));
      const row = div('', 'display:flex;gap:22px;margin-top:13px');
      q.k.forEach((kk) => {
        const cell = div();
        cell.append(
          txt('div', 'font-family:var(--fh);font-weight:700;font-size:20px;color:var(--crema)', kk.v),
          txt('div', `${MONO};font-size:9.5px;color:${STONE};margin-top:2px`, store.pick(kk.l)));
        row.append(cell);
      });
      card.append(row);
      grid.append(card);
    });
    box.append(grid, txt('p', `${MONO};font-size:10px;color:${STONE};margin:14px 0 0`, store.t('see_mock')));
    return box;
  },

  /* Análisis de datos — las cuatro preguntas de negocio y su cifra */
  analytics(dg, store) {
    const box = div();
    const list = div('art-col', 'gap:10px');
    [dg.q1, dg.q2, dg.q3, dg.q4].forEach((q, i) => {
      const row = div('art-card', 'display:flex;align-items:center;gap:16px;padding:15px 17px');
      row.append(
        txt('span', `${MONO};font-size:10px;letter-spacing:1px;color:${AMBER};flex:none`, '0' + (i + 1)),
        txt('span', 'flex:1;min-width:0;font-family:var(--fh);font-weight:600;font-size:13.5px;color:var(--crema);text-wrap:pretty', store.pick(q.q)),
        txt('span', `font-family:var(--fh);font-weight:700;font-size:17px;color:${AMBER};flex:none`, q.headline));
      list.append(row);
    });
    box.append(list, txt('p', `${MONO};font-size:10px;color:${STONE};margin:14px 0 0`, store.t('see_mock')));
    return box;
  },

  /* SIPOC — proveedor, entrada, proceso, salida, cliente */
  sipoc(dg, store) {
    const grid = div('sipocgrid', 'display:grid;grid-template-columns:repeat(5,1fr);gap:10px');
    dg.cols.forEach((c, i) => {
      const card = div('art-card', 'border-radius:12px;padding:15px');
      card.append(txt('span',
        `width:26px;height:26px;display:grid;place-items:center;border-radius:7px;${MONO};font-weight:700;font-size:11px;` +
        `background:${i === 2 ? AMBER : 'rgba(75,59,209,.2)'};color:${i === 2 ? 'var(--grafito)' : 'var(--indigo-2)'}`, c.k));
      card.append(txt('div', 'font-family:var(--fh);font-weight:600;font-size:12px;color:var(--crema);margin-top:11px', store.pick(c.t)));
      const items = div('art-col', 'gap:6px;margin-top:11px');
      store.pick(c.items).forEach((it) => items.append(txt('span', `${MONO};font-size:10px;color:${STONE};overflow-wrap:anywhere`, it)));
      card.append(items);
      grid.append(card);
    });
    return grid;
  },
};

export default {
  name: 'services',

  mount(host, store) {
    const q = (r) => host.querySelector(`[data-role="${r}"]`);
    let active = 0;

    const renderRail = () => {
      q('rail').replaceChildren(...SERVICES.map((x, i) => {
        const b = document.createElement('button');
        b.className = 'svc-rail-item';
        b.setAttribute('aria-current', String(i === active));
        b.innerHTML =
          '<span class="svc-rail-top"><span class="svc-rail-mono"></span><span class="svc-rail-name"></span></span>' +
          '<span class="svc-rail-method"></span>';
        b.querySelector('.svc-rail-mono').textContent = x.mono;
        b.querySelector('.svc-rail-name').textContent = store.pick(x.name);
        b.querySelector('.svc-rail-method').textContent = store.pick(x.method);
        b.addEventListener('click', () => { active = i; render(); });
        return b;
      }));
    };

    const render = () => {
      const x = SERVICES[active];
      renderRail();

      q('method').textContent = store.pick(x.method);
      q('name').textContent = store.pick(x.name);
      q('problem').textContent = store.pick(x.problem);
      q('solution').textContent = store.pick(x.solution);

      const drawer = ARTIFACTS[x.dia];
      q('artifact').replaceChildren(drawer ? drawer(x.dg, store) : txt('p', `color:${STONE}`, x.dia));

      q('kpis').replaceChildren(...x.kpis.map((k) => {
        const cell = div();
        cell.append(txt('div', 'font-family:var(--fh);font-weight:700;font-size:clamp(26px,3vw,34px);letter-spacing:-1.1px;color:var(--ambar);line-height:1', k.v));
        cell.lastChild.className = 'svc-kpi-v';
        cell.append(txt('div', '', store.pick(k.l)));
        cell.lastChild.className = 'svc-kpi-l';
        return cell;
      }));

      const listOf = (items, mark, color) => items.map((d) => {
        const s = txt('span');
        s.append(txt('i', `color:${color}`, mark), document.createTextNode(d));
        return s;
      });
      q('deliv').replaceChildren(...listOf(store.pick(x.deliv), '✓', AMBER));
      q('meas').replaceChildren(...listOf(store.pick(x.meas), '→', 'var(--indigo-2)'));

      const phases = store.pick(x.phases);
      const row = [];
      phases.forEach((p, i) => {
        const cell = div('svc-phase');
        cell.append(
          txt('span', '', String(i + 1)),
          txt('span', '', p[0]),
          txt('span', '', p[1]));
        cell.children[0].className = 'svc-phase-n';
        cell.children[1].className = 'svc-phase-l';
        cell.children[2].className = 'svc-phase-d';
        row.push(cell);
        if (i < phases.length - 1) row.push(txt('span', '', ''));
        if (i < phases.length - 1) row[row.length - 1].className = 'svc-phase-line';
      });
      q('phases').replaceChildren(...row);

      q('tools').replaceChildren(...x.tools.map(([slug, name]) => {
        const chip = txt('span');
        chip.className = 'svc-tool';
        if (slug) {
          const logo = txt('span');
          logo.className = 'svc-tool-logo';
          logo.append(txt('span', maskIcon(ICON(slug), '16px 16px', 'var(--crema-dim)')));
          chip.append(logo);
        }
        chip.append(txt('span', '', name));
        chip.lastChild.className = 'svc-tool-name';
        return chip;
      }));
    };

    render();
    store.subscribe(render);
  },
};
