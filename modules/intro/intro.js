/* modules/intro/intro.js — logotipo gigante con lluvia de código recortada a las letras.

   Por qué canvas y no background-clip: el recorte debe seguir exactamente la
   forma de Space Grotesk, y la composición por canal alfa lo garantiza.
   El lienzo se LIMPIA en cada fotograma: las estelas se recalculan completas
   desde la posición de cada columna, así que acumular velo solo apagaría las letras. */

const SNIPPETS = [
  '<workflow name="reserva-luxe">', '<trigger event="message" channel="whatsapp"/>',
  '<node type="ai-agent" model="claude"/>', '<if condition="slot.available">',
  '<action>calendar.createEvent()</action>', '</workflow>',
  '"nodes":[{"type":"n8n-nodes-base.whatsApp"}]', '"connections":{"AI Agent":{"main":[[]]}}',
  '"parameters":{"model":"claude-sonnet"}', '"position":[520,300]', '"webhookId":"a7f2-lead-intake"',
  '$ npx n8n start --tunnel', '$ curl -X POST /webhook/lead', '$ git push origin main',
  'workflow activated in 142ms', '200 OK  lead -> crm.upsert()', 'agent.reply({ intent: "booking" })',
  'await supabase.from("bookings").insert()', 'if (score > 80) route("sales")',
];

const COL_W = 11, ROW_H = 15, TRAIL = 12;

export default {
  name: 'intro',

  mount(host) {
    const cv = host.querySelector('[data-role="canvas"]');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0, H = 0, cols = [];

    const seed = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = cv.clientWidth || 300;
      H = cv.clientHeight || 65;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = [];
      for (let i = 0, n = Math.ceil(W / COL_W) + 1; i < n; i++) {
        cols.push({
          x: i * COL_W,
          y: -Math.random() * H * 1.4,
          speed: 0.7 + Math.random() * 1.6,
          text: SNIPPETS[(Math.random() * SNIPPETS.length) | 0],
        });
      }
    };

    /* Cadenas de fuente cacheadas. Reasignar ctx.font referenciando familias
       web obliga a resolver estilo contra el documento en cada fotograma:
       eran 1 069 ms de recalculo forzado en un recorrido de 16,5 s. */
    const FONT_RAIN = '400 12.5px "Space Mono", ui-monospace, monospace';
    let fontLogo = '', fontLogoSize = -1;

    /** Dibuja el logotipo. `only` limita el pintado a un fragmento (".IA"). */
    const word = (fill, only) => {
      const size = Math.min(W * 0.138, H * 0.86);
      if (size !== fontLogoSize) { fontLogoSize = size; fontLogo = `700 ${size}px "Space Grotesk", system-ui, sans-serif`; }
      ctx.font = fontLogo;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const full = ctx.measureText('Twoscale.IA').width;
      const base = ctx.measureText('Twoscale').width;
      const x = (W - full) / 2;
      ctx.fillStyle = fill;
      ctx.fillText(only || 'Twoscale.IA', only ? x + base : x, H / 2);
    };

    const frame = () => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);

      // 1. la lluvia, a lo ancho de todo el lienzo
      ctx.font = FONT_RAIN;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      for (const c of cols) {
        c.y += c.speed;
        if (c.y > H + ROW_H * 7) {
          c.y = -ROW_H * 12;
          c.text = SNIPPETS[(Math.random() * SNIPPETS.length) | 0];
        }
        const head = Math.floor(c.y / ROW_H), len = c.text.length;
        for (let k = 0; k < TRAIL; k++) {
          const y = c.y - k * ROW_H;
          if (y < -ROW_H || y > H) continue;
          if (k === 0) { ctx.fillStyle = '#FFF6E4'; ctx.shadowColor = '#F0A93E'; ctx.shadowBlur = 17; }
          else if (k === 1) { ctx.fillStyle = '#F6B855'; ctx.shadowColor = '#F0A93E'; ctx.shadowBlur = 6; }
          else if (k < 4) { ctx.fillStyle = `rgba(247,244,238,${(0.96 - 0.11 * k).toFixed(3)})`; }
          else { ctx.fillStyle = `rgba(198,204,255,${(0.80 - 0.075 * (k - 4)).toFixed(3)})`; }
          const idx = ((head - k) % len + len) % len;
          ctx.fillText(c.text.charAt(idx) || ' ', c.x, y);
          ctx.shadowBlur = 0;
        }
      }

      // 2. recorta todo a la silueta de las letras
      ctx.globalCompositeOperation = 'destination-in';
      word('#fff');

      // 3. cuerpo tenue por debajo, para que el glifo se lea sin lluvia encima
      ctx.globalCompositeOperation = 'destination-over';
      word('rgba(214,220,255,0.46)');

      // 4. el ".IA" siempre sólido, con su resplandor
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowColor = 'rgba(240,169,62,.72)';
      ctx.shadowBlur = 32;
      word('#F0A93E', '.IA');
      ctx.shadowBlur = 0;

      // 5. rim índigo detrás, para separar del fondo
      ctx.globalCompositeOperation = 'destination-over';
      ctx.shadowColor = 'rgba(75,59,209,.85)';
      ctx.shadowBlur = 44;
      word('rgba(75,59,209,0.5)');
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
    };

    let raf = null;
    /* El enrutado por hash solo conmuta visibilidad: al cambiar de ruta el
       lienzo queda oculto y el bucle seguia pintando ~1 236 textos con
       sombra por fotograma sobre algo invisible, 16 % de un nucleo. */
    /* visible se mantiene por IntersectionObserver: leer clientWidth en cada
       fotograma para saber si el lienzo esta en pantalla fuerza layout, que
       es justo lo que este punto viene a quitar. */
    let visible = true;
    const loop = () => {
      if (!visible) { raf = null; return; }
      frame();
      raf = requestAnimationFrame(loop);
    };
    const watchVisibility = () => {
      if (!window.IntersectionObserver) return;
      new IntersectionObserver((es) => {
        visible = es[0].isIntersecting && es[0].boundingClientRect.width > 0;
        if (visible && !raf && !reduced) { seed(); raf = requestAnimationFrame(loop); }
      }, { threshold: 0 }).observe(cv);
    };
    watchVisibility();

    const start = () => {
      if (!cv.clientWidth || !cv.clientHeight) return false;
      seed();
      frame();
      if (!reduced && !raf) raf = requestAnimationFrame(loop);
      return true;
    };

    // El ancho puede ser 0 en el primer pintado: espera a que el layout resuelva.
    if (!start()) watchVisibility();

    window.addEventListener('resize', () => { seed(); frame(); }, { passive: true });
    // La fuente puede llegar después: re-mide cuando esté lista.
    document.fonts?.ready.then(() => { seed(); frame(); }).catch(() => {});
  },
};
