/* modules/footer/footer.js — columnas de enlaces, derivadas de las rutas reales. */

export default {
  name: 'footer',

  mount(host, store) {
    const cols = host.querySelector('[data-role="cols"]');

    const render = () => {
      const es = store.state.lang === 'es';
      const groups = [
        { title: es ? 'SOLUCIONES' : 'SOLUTIONS', links: [['servicios', 'nav_serv']] },
        { title: es ? 'EMPRESA' : 'COMPANY',      links: [['nosotros', 'nav_about']] },
        { title: es ? 'CONTACTO' : 'CONTACT',     links: [['contacto', 'nav_contact']] },
      ];
      cols.replaceChildren(...groups.map((g) => {
        const box = document.createElement('div');
        box.className = 'ftr-col';
        const t = document.createElement('div');
        t.className = 'ftr-col-t';
        t.textContent = g.title;
        box.append(t);
        g.links.forEach(([id, key]) => {
          const a = document.createElement('a');
          a.href = '#' + id;
          a.textContent = store.t(key);
          box.append(a);
        });
        return box;
      }));
    };

    render();
    store.subscribe(render);
  },
};
