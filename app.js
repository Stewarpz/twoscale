/* ============================================================
   app.js — núcleo de la aplicación
   Responsabilidades, y solo estas tres:
     1. cargar los módulos declarados en index.html
     2. enrutar entre páginas
     3. mantener el idioma y notificar los cambios
   Ningún módulo importa a otro. Todos hablan con el store.
   ============================================================ */

import { STR } from './data/strings.js';

/** Idioma declarado en la direccion, si es uno de los dos que existen. */
function langFromUrl() {
  const v = new URLSearchParams(location.search).get('lang');
  return v === 'en' || v === 'es' ? v : null;
}

/* ---------- store mínimo, sin dependencias ---------- */
const listeners = new Set();
export const store = {
  state: {
    // El idioma de la direccion manda: es lo que hace enlazable y compartible
    // la version en ingles, que antes solo existia como estado del navegador.
    lang: langFromUrl() || localStorage.getItem('ts.lang') || 'es',
    page: location.hash.replace('#', '') || 'home',
  },
  /** Traduce una clave al idioma actual. */
  t(key) {
    const val = STR[this.state.lang][key];
    if (val === undefined) console.warn(`[twoscale] missing translation: "${key}" (${this.state.lang})`);
    // Solo devolvemos cadenas: un valor de otro tipo acabaría impreso como
    // "[object Object]" al asignarlo a textContent.
    if (typeof val !== 'string') return key;
    return val;
  },
  /** Devuelve el valor del idioma actual de un objeto {es, en}. */
  pick(obj) {
    if (obj && typeof obj === 'object' && ('es' in obj || 'en' in obj)) return obj[this.state.lang];
    return obj;
  },
  set(patch) {
    Object.assign(this.state, patch);
    if (patch.lang) {
      localStorage.setItem('ts.lang', patch.lang);
      applyLang(patch.lang);
    }
    listeners.forEach((fn) => fn(this.state));
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  go(page) {
    if (page === this.state.page) return;
    this.set({ page });
    const url = new URL(location.href);
    url.hash = page;
    history.replaceState(null, '', url.pathname + url.search + url.hash);
    landRoute(page);
  },
};

/* ---------- utilidades que todo módulo puede usar ---------- */
export const el = (tag, attrs = {}, children = []) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'style' || k === 'class') node.setAttribute(k, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== null && v !== undefined) node.setAttribute(k, v);
  }
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c == null) return;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  });
  return node;
};

/** Rellena todo [data-t] de un contenedor con la traducción de su clave. */
export const fillText = (root) => {
  root.querySelectorAll('[data-t]').forEach((n) => { n.textContent = store.t(n.dataset.t); });
  // Nombre accesible para controles que a veces solo muestran icono.
  root.querySelectorAll('[data-t-aria]').forEach((n) => { n.setAttribute('aria-label', store.t(n.dataset.tAria)); });
};

/** Máscara CSS para pintar un logo de marca en el color que se le pida. */
export const maskIcon = (url, size, color) =>
  `position:absolute;inset:0;background:${color};` +
  `-webkit-mask:url("${url}") center/${size} no-repeat;mask:url("${url}") center/${size} no-repeat`;

/* ---------- carga de módulos ---------- */
const MODULES = [
  'header', 'hero', 'metrics', 'chat-demo', 'integrations', 'process',
  'services', 'workflow', 'mockups', 'cases',
  'about', 'contact', 'footer', 'agent',
];

/* La descarga es simultánea; la inserción en el documento NO. Si cada módulo
   se insertara al resolver su propia petición, el orden dependería de la red:
   cuando hero ganaba la carrera a intro, la inserción posterior de intro lo
   empujaba casi una pantalla y el desplazamiento acumulado llegaba a 0,92. */
async function fetchModule(name) {
  const host = document.querySelector(`[data-module="${name}"]`);
  if (!host) return null;
  try {
    const [markup, mod] = await Promise.all([
      fetch(`modules/${name}/${name}.html`).then((r) => (r.ok ? r.text() : '')),
      import(`./modules/${name}/${name}.js`).catch(() => null),
    ]);
    return { name, host, markup, mod };
  } catch (err) {
    return { name, host, err };
  }
}

function mountModule(res) {
  if (!res) return;
  const { name, host, markup, mod, err } = res;
  if (err) {
    console.error(`[twoscale] módulo "${name}" falló:`, err);
    host.innerHTML = `<div style="padding:24px;color:#F0A93E;font-size:14px;font-family:monospace;border:1px solid rgba(240,169,62,.3);border-radius:12px;margin:12px 0">⚠️ Módulo «${name}» no pudo cargarse.</div>`;
    return;
  }
  if (markup) host.innerHTML = markup;
  fillText(host);
  if (mod?.default?.mount) mod.default.mount(host, store);
  host.dataset.ready = 'true';
}

/* ---------- idioma ---------- */
/** El documento declaraba siempre español: un lector de pantalla leia el
    contenido en ingles con fonetica española. Ademas el idioma queda escrito
    en la direccion, para que la version en ingles se pueda enlazar. */
function applyLang(lang) {
  document.documentElement.lang = lang;
  const url = new URL(location.href);
  if (lang === 'es') url.searchParams.delete('lang');
  else url.searchParams.set('lang', lang);
  history.replaceState(null, '', url.pathname + url.search + url.hash);
}

/* ---------- metadatos por ruta ---------- */
/** El documento tenia un solo titulo y una sola descripcion para las cuatro
    rutas, asi que las tres interiores competian con la portada por el mismo
    resultado de busqueda. */
function applyMeta() {
  const page = store.state.page;
  const clave = ['home', 'servicios', 'nosotros', 'contacto'].includes(page) ? page : 'home';
  document.title = store.t(`meta_${clave}_t`);
  const desc = store.t(`meta_${clave}_d`);
  document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
}

/* ---------- enrutado ---------- */
function applyRoute() {
  document.querySelectorAll('[data-page]').forEach((p) => {
    p.hidden = p.dataset.page !== store.state.page;
  });
  applyMeta();
  // Un solo encabezado de nivel 1 accesible: el de la ruta visible. Antes
  // coexistian cuatro H1 vivos, porque el enrutado solo conmuta visibilidad.
  document.querySelectorAll('[data-route-title]').forEach((h) => {
    const visible = !h.closest('[data-page]')?.hidden;
    h.setAttribute('role', 'heading');
    h.setAttribute('aria-level', visible ? '1' : '2');
  });
}

/** Deja la vista al principio de la ruta destino. En contacto, sobre el
    formulario, que es la acción que prometen los seis enlaces que llevan allí. */
function landRoute(page) {
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (page !== 'contacto') return;
  requestAnimationFrame(() => {
    const form = document.querySelector('[data-page="contacto"] form');
    if (form) form.scrollIntoView({ block: 'start', behavior: 'auto' });
  });
}

/* ---------- arranque ---------- */
(async function boot() {
  applyLang(store.state.lang);
  // Antes de nada: las rutas que no corresponden al hash nacen ocultas y nunca
  // llegan a pintarse. Antes se aplicaba al final, y quien abría /#contacto
  // veía la portada entera durante unos tres segundos.
  applyRoute();
  const pending = MODULES.map(fetchModule);
  for (const p of pending) mountModule(await p);
  applyRoute();
  store.subscribe(applyRoute);
  // El cambio de idioma re-traduce todo lo declarativo y avisa a los módulos.
  store.subscribe(() => fillText(document.body));
  window.addEventListener('hashchange', () => {
    const page = location.hash.replace('#', '') || 'home';
    if (page !== store.state.page) store.go(page);
  });
  // Un enlace a la ruta en la que ya estamos no dispara hashchange, y aun así
  // debe llevar al usuario a la acción que promete.
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a) return;
    const page = a.getAttribute('href').slice(1) || 'home';
    if (page === store.state.page) landRoute(page);
  });
})();
