# Twoscale.IA — sitio web modular

Arquitectura por módulos, sin build ni dependencias. HTML, CSS y JS nativo
con módulos ES. Cada bloque del sitio es una carpeta autónoma.

## Cómo levantarlo

Los módulos se cargan con `fetch` e `import()`, así que **necesita un servidor**.
Abrir `index.html` con doble clic (protocolo `file://`) no funciona: el navegador
bloquea ambas cosas por CORS.

```bash
npx serve .          # o
python3 -m http.server 8080
```

## Estructura

```
index.html                  Esqueleto: solo puntos de montaje <div data-module>
globals.css                 Tokens de marca, reset y utilidades compartidas
app.js                      Núcleo: carga de módulos, enrutado, idioma, store

data/                       Contenido separado de la presentación
  strings.js                Todo el copy, ES/EN
  services.js               Los diez servicios con su metodología
  workflows.js              Grafo de los tres workflows tipo n8n
  icons.js                  Integraciones y resolución de logos
  metrics.js                Cifras del inicio e industrias
  chat.js                   Guiones del chat y del agente
  process.js                Los tres pasos y los cuatro pilares
  dash.js                   Metas y árbol de KPIs
  misc.js                   Listas auxiliares

modules/<nombre>/           Un módulo = una carpeta = tres archivos
  <nombre>.html             Marcado, con [data-t] para i18n y [data-role] para JS
  <nombre>.css             Estilos propios. Prefijo de clase por módulo.
  <nombre>.js              Lógica. Exporta { name, mount(host, store) }

vendor/broadsheet.css       Sistema Broadsheet, encapsulado bajo .bs
logos/                      Logos de marca en SVG (Simple Icons)
aurea-demo.html             Demo de cliente, se carga en iframe
```

## El contrato de un módulo

```js
export default {
  name: 'hero',
  mount(host, store) {
    // host  = el <div data-module="hero"> con su HTML ya inyectado
    // store = { state, t(key), pick({es,en}), set(patch), subscribe(fn), go(page) }
  },
};
```

Reglas que mantienen los módulos independientes:

1. **Ningún módulo importa a otro.** Se comunican por el store o por eventos
   de `window` (`ts:agent-open`, `ts:hide-agent`).
2. **El CSS lleva prefijo propio** (`.hero-`, `.ag-`, `.integ-`). Sin colisiones.
3. **Los colores y tipografías salen de `globals.css`.** Nunca un hex a mano.
4. **El copy vive en `data/strings.js`.** El marcado solo declara la clave.
5. **Suscribirse al store** para reaccionar al cambio de idioma o de página.

## Añadir un módulo

1. Crear `modules/mi-modulo/` con sus tres archivos.
2. Añadir `<div data-module="mi-modulo"></div>` en `index.html`.
3. Añadir su `<link>` en el `<head>`.
4. Añadir su nombre al array `MODULES` de `app.js`.

## Idioma

Bilingüe ES/EN. Se guarda en `localStorage` bajo `ts.lang`.
Texto declarativo con `data-t="clave"`; texto generado en JS con `store.t()`
o `store.pick({es, en})`.
