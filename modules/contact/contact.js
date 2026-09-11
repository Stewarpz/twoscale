/* modules/contact/contact.js — formulario, calculadora de retorno, agenda y FAQ.

   Flujo dual: envío AJAX al backend + redirección a WhatsApp tras éxito.
   Configura FORM_ENDPOINT y WHATSAPP_NUMBER antes de desplegar. */

import { FAQ, CONTACT_WORDS, TRUST } from '../../data/misc.js';

/* ========== CONFIGURACIÓN — CAMBIAR ANTES DE PRODUCCIÓN ========== */
const FORM_ENDPOINT = 'https://formspree.io/f/myeyonwe';
const WHATSAPP_NUMBER = '573004032882';
/* Enlace directo a la conversación, usado en el bloque de contacto y en la
   recuperación del error de envío. */
const WA_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=` +
  encodeURIComponent('Hola, quiero automatizar mi operación.');
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

    /* Errores de validación visibles y anunciados (P-19).
       Antes el navegador bloqueaba el envío sin marcar el campo, sin
       asociarle mensaje y sin mover el foco: en lector de pantalla el
       botón simplemente no hacía nada. */
    const ERR_KEYS = {
      name: 'form_err_name', email: 'form_err_email',
      phone: 'form_err_phone', message: 'form_err_msg',
    };
    const campos = () => [...form.elements].filter((f) => f.name && ERR_KEYS[f.name]);

    /* Con el formulario inválido el navegador bloquea el envío antes de emitir
       «submit», así que el manejador de abajo nunca llegaba a correr. Apagamos
       la validación interactiva nativa —desde JS, para que siga actuando si no
       hay JS— y validamos con checkValidity() sobre los mismos atributos. */
    form.noValidate = true;

    const limpiarError = (f) => {
      f.removeAttribute('aria-invalid');
      f.removeAttribute('aria-describedby');
      form.querySelector(`[data-err-for="${f.name}"]`)?.remove();
    };

    const marcarError = (f) => {
      limpiarError(f);
      const n = document.createElement('span');
      n.className = 'cnt-field-err';
      n.id = f.id + '-err';
      n.dataset.errFor = f.name;
      // data-t para que el cambio de idioma lo re-traduzca como al resto.
      n.dataset.t = ERR_KEYS[f.name];
      n.setAttribute('role', 'alert');
      n.textContent = store.t(ERR_KEYS[f.name]);
      f.insertAdjacentElement('afterend', n);
      f.setAttribute('aria-invalid', 'true');
      f.setAttribute('aria-describedby', n.id);
    };

    // El mensaje desaparece en cuanto el campo deja de ser inválido, no al
    // siguiente intento de envío.
    campos().forEach((f) => {
      f.addEventListener('input', () => { if (f.checkValidity()) limpiarError(f); });
    });

    /* ---------- borrador local, 7 días (P-20) ---------- */
    const DRAFT_KEY = 'ts.contact.draft';
    const DRAFT_TTL = 7 * 24 * 60 * 60 * 1000;

    const leerBorrador = () => {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return null;
        const d = JSON.parse(raw);
        if (!d || typeof d.at !== 'number' || Date.now() - d.at > DRAFT_TTL) {
          localStorage.removeItem(DRAFT_KEY);
          return null;
        }
        return d.v;
      } catch { return null; }
    };
    const borrarBorrador = () => { try { localStorage.removeItem(DRAFT_KEY); } catch {} };
    const guardarBorrador = () => {
      const v = Object.fromEntries(new FormData(form));
      try {
        if (Object.values(v).every((x) => !String(x).trim())) localStorage.removeItem(DRAFT_KEY);
        else localStorage.setItem(DRAFT_KEY, JSON.stringify({ at: Date.now(), v }));
      } catch { /* almacenamiento lleno o bloqueado: el formulario sigue usable */ }
    };

    const borrador = leerBorrador();
    if (borrador) {
      let repuesto = false;
      for (const [k, val] of Object.entries(borrador)) {
        const f = form.elements[k];
        if (f && typeof val === 'string' && val.trim()) { f.value = val; repuesto = true; }
      }
      if (repuesto) q('draft').hidden = false;
    }
    form.addEventListener('input', guardarBorrador);
    q('draft-reset').addEventListener('click', () => {
      form.reset();
      campos().forEach(limpiarError);
      borrarBorrador();
      q('draft').hidden = true;
      form.elements.name?.focus();
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      /* Validación nativa HTML5, con la señalización propia encima */
      if (!form.checkValidity()) {
        const primero = campos().find((f) => !f.checkValidity());
        if (primero) { marcarError(primero); primero.focus(); }
        return;
      }
      campos().forEach(limpiarError);

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

        /* 2. Éxito: mostrar confirmación.
           El formulario, al ocultarse, colapsaba la altura del contenedor y
           arrastraba el scroll: el panel quedaba 78-106 px por encima del
           borde superior y el usuario no veía la confirmación. */
        const alto = form.getBoundingClientRect().height;
        form.parentElement.style.minHeight = alto + 'px';
        form.hidden = true;
        const ok = q('ok');
        q('ok-wa').href = `https://wa.me/${WHATSAPP_NUMBER}?text=` +
          encodeURIComponent(`Hola, soy ${data.name}. Acabo de enviar el formulario desde la web.`);
        q('ok-agenda').addEventListener('click', () => {
          q('cal').scrollIntoView({ block: 'center', behavior: 'auto' });
        });
        ok.hidden = false;
        ok.scrollIntoView({ block: 'center', behavior: 'auto' });
        borrarBorrador();
        q('draft').hidden = true;

        /* 3. Nada de abrir WhatsApp por nuestra cuenta: el traspaso de canal
           es una eleccion del usuario y vive en el enlace secundario del
           panel de exito. Repetir alli los cinco campos que acaba de enviar
           era incomodo y no aportaba nada. */

      } catch (err) {
        console.error('[twoscale] form submit failed:', err);
        q('err-wa').href = WA_LINK;
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
          `<input type="range" min="${s.min}" max="${s.max}" value="${roi[s.key]}" aria-label="${s.label}">`;
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
      // El correo se retira mientras su dominio no resuelva: no recibe nada.
      // El WhatsApp deja de ser texto inerte y pasa a ser un enlace pulsable.
      q('contacts').replaceChildren(...[
        [store.t('contact_wa'),   store.t('contact_wa_v'), WA_LINK],
        [store.t('contact_city'), 'Medellín, Colombia',    null],
      ].map(([l, v, href]) => {
        const c = document.createElement('div');
        c.className = 'cnt-contact';
        c.innerHTML = '<div class="cnt-contact-l"></div>';
        c.querySelector('.cnt-contact-l').textContent = l;
        const val = document.createElement(href ? 'a' : 'div');
        val.className = 'cnt-contact-v';
        val.textContent = v;
        if (href) { val.href = href; val.target = '_blank'; val.rel = 'noopener'; }
        c.append(val);
        return c;
      }));
    };

    /* ---------- agenda ---------- */
    const cal = { offset: 0, day: null, slot: null, booked: false, name: '', mail: '' };

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
        b.setAttribute('aria-pressed', String(cal.day === iso));
        if (off) {
          // Pulsable pero no seleccionable: antes no devolvia nada y el
          // usuario no distinguia el fallo de dedo del sitio roto.
          b.setAttribute('aria-disabled', 'true');
          b.classList.add('cal-day-off');
          b.addEventListener('click', () => {
            const e = box.querySelector('.cal-err');
            if (e) { e.textContent = store.t('cal_weekend'); e.hidden = false; }
          });
        } else {
          b.addEventListener('click', () => { cal.day = iso; cal.slot = null; renderCal(); });
        }
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

      const ready = !!(cal.day && cal.slot);

      /* Con día y hora elegidos pedimos nombre y correo: sin un identificador
         no hay a quién confirmar, y antes la pantalla de éxito se pintaba sin
         que saliera una sola petición del navegador. */
      let nameI = null, mailI = null;
      if (ready) {
        const who = document.createElement('div');
        who.className = 'cal-who';
        who.innerHTML =
          '<label class="cnt-field"><span></span><input type="text" name="cal_name" autocomplete="name" required></label>' +
          '<label class="cnt-field"><span></span><input type="email" name="cal_email" autocomplete="email" required></label>';
        const [ln, lm] = who.querySelectorAll('span');
        ln.textContent = store.t('cal_name');
        lm.textContent = store.t('cal_mail');
        [nameI, mailI] = who.querySelectorAll('input');
        nameI.value = cal.name; mailI.value = cal.mail;
        nameI.addEventListener('input', (e) => { cal.name = e.target.value; });
        mailI.addEventListener('input', (e) => { cal.mail = e.target.value; });
        box.append(who);
      }

      const err = document.createElement('p');
      err.className = 'cal-err';
      err.setAttribute('role', 'alert');
      err.hidden = true;
      box.append(err);

      const confirm = document.createElement('button');
      confirm.className = 'cal-confirm';
      confirm.dataset.ready = String(ready);
      confirm.disabled = !ready;                       // I-58: deshabilitado de verdad
      if (ready) {
        const [yy, mm, dd] = cal.day.split('-').map(Number);
        const L2 = store.state.lang;
        const pretty = L2 === 'es' ? `${dd} de ${MONTHS.es[mm - 1]}` : `${MONTHS.en[mm - 1]} ${dd}`;
        confirm.textContent = `${store.t('cal_confirm_for')} ${pretty} · ${cal.slot}`;
        confirm.addEventListener('click', async () => {
          if (!nameI.value.trim() || !mailI.checkValidity()) {
            const bad = !nameI.value.trim() ? nameI : mailI;
            err.textContent = store.t(bad === nameI ? 'cal_name' : 'cal_mail');
            err.hidden = false;
            bad.focus();
            return;
          }
          err.hidden = true;
          confirm.disabled = true;
          confirm.textContent = store.t('cal_sending');
          try {
            const res = await fetch(FORM_ENDPOINT, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({
                source: 'agenda', day: cal.day, slot: cal.slot,
                name: nameI.value.trim(), email: mailI.value.trim(),
              }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            cal.booked = true;                          // solo tras respuesta correcta
            renderCal();
          } catch (e) {
            console.error('[twoscale] reserva fallida:', e);
            err.textContent = store.t('cal_err');
            err.hidden = false;
            confirm.disabled = false;
            confirm.textContent = store.t('cal_btn');
          }
        });
      } else {
        confirm.textContent = store.t('cal_btn_wait');
      }
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
      // Sin duplicado de bucle: las tres se muestran a la vez. En carrusel,
      // dos de las tres razones para rellenar el formulario quedaban
      // ocultas justo encima del formulario (P-39).
      track.replaceChildren(...TRUST.map((t) => {
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
