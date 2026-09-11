/* modules/contact/contact.js — formulario, calculadora de retorno, agenda incrustada y FAQ.

   Flujo dual: envío AJAX al backend + redirección a WhatsApp tras éxito.
   Configura FORM_ENDPOINT y WHATSAPP_NUMBER antes de desplegar. */

import { FAQ, CONTACT_WORDS, TRUST } from '../../data/misc.js';

/* ========== CONFIGURACIÓN — CAMBIAR ANTES DE PRODUCCIÓN ========== */
const FORM_ENDPOINT = 'https://formspree.io/f/myeyonwe';
const WHATSAPP_NUMBER = '573004032882';
/* Tipo de evento de Calendly que se incrusta. Es el enlace del evento, no el
   del perfil (calendly.com/2scaleia): el del perfil lista los tipos y obliga
   a un clic mas antes de ver un solo hueco libre. */
const CALENDLY_URL = 'https://calendly.com/2scaleia/30min';
/* Enlace directo a la conversación, usado en el bloque de contacto y en la
   recuperación del error de envío. */
const WA_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=` +
  encodeURIComponent('Hola, quiero automatizar mi operación.');
/* ================================================================= */

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
        { v: '$' + nf(saving),  l: store.t('roi_savelbl'), hot: true,  color: 'var(--crema)' },
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

    /* ---------- agenda ----------
       El calendario propio no sabia que franjas estaban tomadas: las seis
       horas eran un array fijo y confirmar hacia POST a un rele de
       formulario a correo, que no se puede consultar. Era un formulario de
       solicitud con aspecto de agenda. Ahora la disponibilidad la sirve
       Calendly, que lee el calendario real del equipo, resuelve la zona
       horaria del visitante y manda la invitacion.

       El guion del proveedor no se descarga en la carga del sitio: solo la
       primera vez que la ruta de contacto se muestra. En las otras tres
       rutas no se pide ni un byte. */
    const montarAgenda = (() => {
      let pedido = false;
      return () => {
        if (pedido) return;
        pedido = true;
        const caja = q('cal');
        if (!caja) return;

        const pintar = () => {
          caja.replaceChildren();
          const widget = document.createElement('div');
          widget.className = 'calendly-inline-widget cnt-cal-embed';
          caja.append(widget);
          // Los colores de marca viajan en la direccion: el widget nace ya
          // sobre el fondo grafito y no parpadea en blanco.
          window.Calendly.initInlineWidget({
            url: CALENDLY_URL + '?hide_gdpr_banner=1&hide_event_type_details=1'
               + '&background_color=1C2029&text_color=F7F4EE&primary_color=F0A93E',
            parentElement: widget,
          });
        };

        const caer = () => {
          // Si el proveedor no carga —red, bloqueador, politica— el visitante
          // no se queda sin forma de agendar.
          caja.replaceChildren();
          const a = document.createElement('a');
          a.className = 'btn-amber cnt-cal-fallback';
          a.href = CALENDLY_URL;
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = store.t('cal_abrir');
          caja.append(a);
        };

        if (window.Calendly) { pintar(); return; }
        const s = document.createElement('script');
        s.src = 'https://assets.calendly.com/assets/external/widget.js';
        s.async = true;
        s.addEventListener('load', () => { window.Calendly ? pintar() : caer(); });
        s.addEventListener('error', caer);
        document.head.append(s);
      };
    })();

    /* La ruta nace oculta: esperamos a que se muestre de verdad. */
    const zona = host.closest('[data-page]');
    if (zona && !zona.hidden) montarAgenda();
    else if (zona && window.IntersectionObserver) {
      const io = new IntersectionObserver((entradas) => {
        if (entradas.some((e) => e.isIntersecting)) { io.disconnect(); montarAgenda(); }
      });
      io.observe(zona);
    } else {
      montarAgenda();
    }

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

    const renderAll = () => { renderRoi(); renderContacts(); renderFaq(); renderWords(); renderTrust(); };
    renderAll();
    store.subscribe(renderAll);
  },
};
