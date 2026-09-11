/* modules/header/header.js — navegación, idioma y cajón móvil. */

/** Única fuente de verdad de las rutas del sitio. */
export const ROUTES = [
  { id: 'home',      key: 'nav_home'  },
  { id: 'servicios', key: 'nav_serv'  },
  { id: 'nosotros',  key: 'nav_about' },
  { id: 'contacto',  key: 'nav_contact' },
];

export default {
  name: 'header',

  mount(host, store) {
    const links  = host.querySelector('[data-role="links"]');
    const drawer = host.querySelector('[data-role="drawer"]');
    const langBtn = host.querySelector('[data-role="lang"]');
    const burger  = host.querySelector('[data-role="burger"]');

    let setDrawer = () => {};
    const makeLink = (route, cls) => {
      const a = document.createElement('a');
      a.className = cls;
      a.href = '#' + route.id;
      a.textContent = store.t(route.key);
      a.addEventListener('click', () => { setDrawer(false); });
      return a;
    };

    const render = () => {
      links.replaceChildren(...ROUTES.map((r) => makeLink(r, 'hdr-link')));
      drawer.replaceChildren(...ROUTES.map((r) => makeLink(r, '')));

      const cta = document.createElement('a');
      cta.className = 'hdr-cta';
      cta.href = '#contacto';
      cta.textContent = store.t('nav_cta');
      drawer.append(cta);

      langBtn.textContent = store.state.lang === 'es' ? 'EN' : 'ES';
      // La ruta actual se marca en la barra y tambien en el cajon: por
      // debajo de 1100px el cajon es la unica navegacion.
      [links, drawer].forEach((box) => {
        box.querySelectorAll('a').forEach((a) => {
          const id = (a.getAttribute('href') || '').slice(1);
          if (id === store.state.page && !a.classList.contains('hdr-cta')) a.setAttribute('aria-current', 'page');
          else a.removeAttribute('aria-current');
        });
      });
    };

    langBtn.addEventListener('click', () => {
      store.set({ lang: store.state.lang === 'es' ? 'en' : 'es' });
    });

    /* El cajón nunca usa [hidden]: se anima con transform y no ocupa layout,
       así que abrirlo no empuja el contenido de la página. */
    setDrawer = (open) => {
      drawer.dataset.open = String(open);
      drawer.setAttribute('aria-hidden', String(!open));
      burger.setAttribute('aria-expanded', String(open));
      burger.textContent = open ? '✕' : '☰';
      // Con el cajón abierto la página de fondo no se desplaza.
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) drawer.querySelector('a')?.focus();
    };
    setDrawer(false);

    burger.addEventListener('click', () => {
      setDrawer(drawer.dataset.open !== 'true');
    });

    /* Trampa de foco: con el cajón abierto, el tabulador circula entre el
       botón de menú y los enlaces del cajón, y nunca sale al contenido de
       fondo. Escape cierra y devuelve el foco al disparador. */
    document.addEventListener('keydown', (e) => {
      if (drawer.dataset.open !== 'true') return;
      if (e.key === 'Escape') { setDrawer(false); burger.focus(); return; }
      if (e.key !== 'Tab') return;
      const ring = [burger, ...drawer.querySelectorAll('a')];
      const i = ring.indexOf(document.activeElement);
      if (i === -1) { e.preventDefault(); ring[0].focus(); return; }
      const next = e.shiftKey ? i - 1 : i + 1;
      if (next < 0 || next >= ring.length) {
        e.preventDefault();
        ring[e.shiftKey ? ring.length - 1 : 0].focus();
      }
    });

    render();
    store.subscribe(render);
  },
};
