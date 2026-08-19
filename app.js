/* ============================================================
   app.js — núcleo de la aplicación
   Responsabilidades, y solo estas tres:
     1. cargar los módulos declarados en index.html
     2. enrutar entre páginas
     3. mantener el idioma y notificar los cambios
   Ningún módulo importa a otro. Todos hablan con el store.
   ============================================================ */

import { STR } from './data/strings.js';

/* ---------- store mínimo, sin dependencias ---------- */
const listeners = new Set();
export const store = {
  state: {
    lang: localStorage.getItem('ts.lang') || 'es',
    page: location.hash.replace('#', '') || 'home',
  },
  /** Traduce una clave al idioma actual. */
  t(key) {
    return STR[this.state.lang][key] ?? key;
  },
  /** Devuelve el valor del idioma actual de un objeto {es, en}. */
  pick(obj) {
    if (obj && typeof obj === 'object' && ('es' in obj || 'en' in obj)) return obj[this.state.lang];
    return obj;
  },
  set(patch) {
    Object.assign(this.state, patch);
    if (patch.lang) localStorage.setItem('ts.lang', patch.lang);
    listeners.forEach((fn) => fn(this.state));
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  go(page) {
    if (page === this.state.page) return;
    this.set({ page });
    history.replaceState(null, '', '#' + page);
    window.scrollTo({ top: 0, behavior: 'auto' });
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
};

/** Máscara CSS para pintar un logo de marca en el color que se le pida. */
export const maskIcon = (url, size, color) =>
  `position:absolute;inset:0;background:${color};` +
  `-webkit-mask:url("${url}") center/${size} no-repeat;mask:url("${url}") center/${size} no-repeat`;

/* ---------- carga de módulos ---------- */
const MODULES = [
  'header', 'intro', 'hero', 'metrics', 'chat-demo', 'integrations', 'process',
  'services', 'workflow', 'mockups', 'industries',
  'about', 'cases', 'contact', 'footer', 'agent',
];

async function loadModule(name) {
  const host = document.querySelector(`[data-module="${name}"]`);
  if (!host) return;
  try {
    const [markup, mod] = await Promise.all([
      fetch(`modules/${name}/${name}.html`).then((r) => (r.ok ? r.text() : '')),
      import(`./modules/${name}/${name}.js`).catch(() => null),
    ]);
    if (markup) host.innerHTML = markup;
    fillText(host);
    if (mod?.default?.mount) mod.default.mount(host, store);
    host.dataset.ready = 'true';
  } catch (err) {
    console.error(`[twoscale] módulo "${name}" falló:`, err);
  }
}

/* ---------- enrutado ---------- */
function applyRoute() {
  document.querySelectorAll('[data-page]').forEach((p) => {
    p.hidden = p.dataset.page !== store.state.page;
  });
}

/* ---------- arranque ---------- */
(async function boot() {
  await Promise.all(MODULES.map(loadModule));
  applyRoute();
  store.subscribe(applyRoute);
  // El cambio de idioma re-traduce todo lo declarativo y avisa a los módulos.
  store.subscribe(() => fillText(document.body));
  window.addEventListener('hashchange', () => {
    const page = location.hash.replace('#', '') || 'home';
    if (page !== store.state.page) store.set({ page });
  });
})();
