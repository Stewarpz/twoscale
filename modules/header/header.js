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
      links.querySelectorAll('a').forEach((a, i) => {
        if (ROUTES[i].id === store.state.page) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
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
    };
    setDrawer(false);

    burger.addEventListener('click', () => {
      setDrawer(drawer.dataset.open !== 'true');
    });

    render();
    store.subscribe(render);
  },
};
