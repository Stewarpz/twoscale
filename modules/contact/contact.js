/* modules/contact/contact.js — formulario, calculadora de retorno, agenda y FAQ.

   Flujo dual: envío AJAX al backend + redirección a WhatsApp tras éxito.
   Configura FORM_ENDPOINT y WHATSAPP_NUMBER antes de desplegar. */

import { FAQ, CONTACT_WORDS, TRUST } from '../../data/misc.js';

/* ========== CONFIGURACIÓN — CAMBIAR ANTES DE PRODUCCIÓN ========== */
const FORM_ENDPOINT = 'https://formspree.io/f/myeyonwe';
const WHATSAPP_NUMBER = '573004032882';
/* ================================================================= */

const MONTHS = {
  es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
};
const DOWS = { es: ['L','M','M','J','V','S','D'], en: ['M','T','W','T','F','S','S'] };
const SLOTS = ['09:00','10:00','11:00','14:00','15:00','16:00'];
const MAX_MONTHS_AHEAD = 3;

const pad = (n) => String(n).padStart(2, '0');
const nf = (n) => Math.round(n).toLocaleString('en-US');

export default {
  name: 'contact',

  mount(host, store) {
    const q = (r) => host.querySelector(`[data-role="${r}"]`);

    /* ---------- formulario con flujo dual ---------- */
    const form = q('form');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      /* Validación nativa HTML5 */
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      /* Recopilar datos */
      const data = Object.fromEntries(new FormData(form));

      /* Estado de carga */
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = store.t('form_sending');
      q('err').hidden = true;

      try {
        /* 1. Envío AJAX al backend */
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        /* 2. Éxito: mostrar confirmación */
        form.hidden = true;
        q('ok').hidden = false;

        /* 3. Construir y abrir enlace de WhatsApp */
        const msg = [
          store.t('form_name') + ': ' + data.name,
          store.t('form_email') + ': ' + data.email,
          (store.t('form_phone') || 'Tel') + ': ' + data.phone,
          data.organization ? (store.t('form_biz') + ': ' + data.organization) : '',
          data.message ? (store.t('form_msg') + ': ' + data.message) : '',
        ].filter(Boolean).join('\n');

        const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');

      } catch (err) {
        console.error('[twoscale] form submit failed:', err);
        q('err').hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });

    /* ---------- calculadora de retorno ---------- */
    const roi = { hours: 10, emp: 3, cost: 12 };

    const renderRoi = () => {
      const monthlyHours = roi.hours * 4.33 * roi.emp;
      const recover = Math.round(monthlyHours * 0.7);
      const manual  = Math.round(monthlyHours * roi.cost);
      const saving  = Math.round(recover * roi.cost);

      q('sliders').replaceChildren(...[
        { key: 'hours', label: store.t('roi_hours'), min: 1, max: 40, show: roi.hours },
        { key: 'emp',   label: store.t('roi_emp'),   min: 1, max: 50, show: roi.emp },
        { key: 'cost',  label: store.t('roi_cost'),  min: 3, max: 80, show: '$' + roi.cost },
      ].map((s) => {
        const box = document.createElement('div');
        box.className = 'cnt-slider';
        box.innerHTML =
          `<div class="cnt-slider-head"><span></span><span class="cnt-slider-v">${s.show}</span></div>` +
          `<input type="range" min="${s.min}" max="${s.max}" value="${roi[s.key]}">`;
        box.querySelector('span').textContent = s.label;
        box.querySelector('input').addEventListener('input', (e) => {
          roi[s.key] = parseFloat(e.target.value) || 0;
          renderRoi();
        });
        return box;
      }));

      q('roi-out').replaceChildren(...[
        { v: nf(recover),       l: store.t('roi_recover'), hot: false, color: 'var(--crema)' },
        { v: '$' + nf(manual),  l: store.t('roi_costlbl'), hot: false, color: 'var(--piedra)' },
        { v: '$' + nf(saving),  l: store.t('roi_savelbl'), hot: true,  color: 'var(--ambar)' },
      ].map((o) => {
        const cell = document.createElement('div');
        cell.className = 'cnt-out' + (o.hot ? ' cnt-out-hot' : '');
        cell.innerHTML = `<div class="cnt-out-v" style="color:${o.color}">${o.v}</div><div class="cnt-out-l"></div>`;
        cell.querySelector('.cnt-out-l').textContent = o.l;
        return cell;
      }));
    };

    /* ---------- datos de contacto ---------- */
    const renderContacts = () => {
      q('contacts').replaceChildren(...[
        [store.t('contact_wa'),   '+57 300 403 2882'],
        [store.t('contact_mail'), 'hola@twoscale.ia'],
        [store.t('contact_city'), 'Medellín, Colombia'],
      ].map(([l, v]) => {
        const c = document.createElement('div');
        c.className = 'cnt-contact';
        c.innerHTML = '<div class="cnt-contact-l"></div><div class="cnt-contact-v"></div>';
        c.querySelector('.cnt-contact-l').textContent = l;
        c.querySelector('.cnt-contact-v').textContent = v;
        return c;
      }));
    };

    /* ---------- agenda ---------- */
    const cal = { offset: 0, day: null, slot: null, booked: false };

    const renderCal = () => {
      const box = q('cal');
      box.replaceChildren();
      const L = store.state.lang;

      if (cal.booked) {
        const [yy, mm, dd] = cal.day.split('-').map(Number);
        const pretty = L === 'es' ? `${dd} de ${MONTHS.es[mm - 1]}` : `${MONTHS.en[mm - 1]} ${dd}`;
        const done = document.createElement('div');
        done.className = 'cal-done';
        done.innerHTML =
          '<span class="cal-done-icon">✓</span>' +
          '<p class="cal-done-t"></p>' +
          `<p class="cal-done-when">${pretty} · ${cal.slot}</p>` +
          '<p class="cal-done-s"></p>' +
          '<button class="cal-again"></button>';
        done.querySelector('.cal-done-t').textContent = store.t('cal_ok');
        done.querySelector('.cal-done-s').textContent = store.t('cal_ok_s');
        const again = done.querySelector('.cal-again');
        again.textContent = store.t('cal_again');
        again.addEventListener('click', () => { cal.day = null; cal.slot = null; cal.booked = false; renderCal(); });
        box.append(done);
        return;
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const view = new Date(now.getFullYear(), now.getMonth() + cal.offset, 1);
      const vY = view.getFullYear(), vM = view.getMonth();

      const head = document.createElement('div');
      head.className = 'cal-head';
      head.innerHTML =
        `<span class="cal-month">${MONTHS[L][vM]} ${vY}</span>` +
        '<span class="cal-nav"><button data-prev aria-label="Anterior">‹</button><button data-next aria-label="Siguiente">›</button></span>';
      const prev = head.querySelector('[data-prev]'), next = head.querySelector('[data-next]');
      prev.disabled = cal.offset <= 0;
      next.disabled = cal.offset >= MAX_MONTHS_AHEAD;
      prev.addEventListener('click', () => { if (cal.offset > 0) { cal.offset--; cal.day = null; cal.slot = null; renderCal(); } });
      next.addEventListener('click', () => { if (cal.offset < MAX_MONTHS_AHEAD) { cal.offset++; cal.day = null; cal.slot = null; renderCal(); } });
      box.append(head);

      const dows = document.createElement('div');
      dows.className = 'cal-dows';
      DOWS[L].forEach((d) => {
        const s = document.createElement('span');
        s.className = 'cal-dow';
        s.textContent = d;
        dows.append(s);
      });
      box.append(dows);

      const days = document.createElement('div');
      days.className = 'cal-days';
      // lunes = 0, para que la rejilla arranque en L
      const firstDow = (new Date(vY, vM, 1).getDay() + 6) % 7;
      const daysInMonth = new Date(vY, vM + 1, 0).getDate();
      for (let i = 0; i < firstDow; i++) days.append(document.createElement('span'));
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(vY, vM, d), dow = date.getDay();
        const iso = `${vY}-${pad(vM + 1)}-${pad(d)}`;
        const off = date < today || dow === 0 || dow === 6;   // sin fines de semana ni pasado
        const b = document.createElement('button');
        b.className = 'cal-day';
        b.textContent = d;
        b.disabled = off;
        b.setAttribute('aria-pressed', String(cal.day === iso));
        if (!off) b.addEventListener('click', () => { cal.day = iso; cal.slot = null; renderCal(); });
        days.append(b);
      }
      box.append(days);

      if (cal.day) {
        const wrap = document.createElement('div');
        wrap.className = 'cal-slots-wrap';
        wrap.innerHTML = `<div class="svc-lbl">${store.t('cal_slots')}</div><div class="cal-slots"></div>`;
        const row = wrap.querySelector('.cal-slots');
        SLOTS.forEach((tm) => {
          const b = document.createElement('button');
          b.className = 'cal-slot';
          b.textContent = tm;
          b.setAttribute('aria-pressed', String(cal.slot === tm));
          b.addEventListener('click', () => { cal.slot = tm; renderCal(); });
          row.append(b);
        });
        box.append(wrap);
      } else {
        const hint = document.createElement('p');
        hint.className = 'cnt-note';
        hint.style.cssText = 'max-width:322px;border-top:1px solid var(--line);padding-top:18px;margin-top:20px';
        hint.textContent = store.t('cal_pick');
        box.append(hint);
      }

      const confirm = document.createElement('button');
      confirm.className = 'cal-confirm';
      confirm.textContent = store.t('cal_btn');
      const ready = !!(cal.day && cal.slot);
      confirm.dataset.ready = String(ready);
      if (ready) confirm.addEventListener('click', () => { cal.booked = true; renderCal(); });
      box.append(confirm);
    };

    /* ---------- palabra rotativa del título ----------
       La primera se repite al final: el salto del bucle cae sobre un
       fotograma idéntico y no se ve el corte. */
    const renderWords = () => {
      const track = q('words');
      if (!track) return;
      const words = CONTACT_WORDS[store.state.lang] || CONTACT_WORDS.es;
      track.replaceChildren(...words.concat([words[0]]).map((w) => {
        const s = document.createElement('span');
        s.className = 'wordrot-item';
        s.textContent = w;
        return s;
      }));
    };

    /* ---------- señales de confianza, una visible a la vez ---------- */
    const renderTrust = () => {
      const track = q('trust');
      if (!track) return;
      track.replaceChildren(...TRUST.concat([TRUST[0]]).map((t) => {
        const row = document.createElement('div');
        row.className = 'trustrot-item';
        const v = document.createElement('span');
        v.className = 'trustrot-v';
        v.textContent = t.v;
        const l = document.createElement('span');
        l.className = 'trustrot-l';
        l.textContent = store.pick(t.l);
        row.append(v, l);
        return row;
      }));
    };

    /* ---------- FAQ ---------- */
    const renderFaq = () => {
      q('faq').replaceChildren(...FAQ.map((f) => {
        const item = document.createElement('div');
        item.className = 'cnt-faq-item';
        item.innerHTML = '<div class="cnt-faq-q"></div><p class="cnt-faq-a"></p>';
        item.querySelector('.cnt-faq-q').textContent = store.pick(f.q);
        item.querySelector('.cnt-faq-a').textContent = store.pick(f.a);
        return item;
      }));
    };

    const renderAll = () => { renderRoi(); renderContacts(); renderCal(); renderFaq(); renderWords(); renderTrust(); };
    renderAll();
    store.subscribe(renderAll);
  },
};
