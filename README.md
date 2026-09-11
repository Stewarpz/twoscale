# Twoscale.IA — sitio web

Sitio estático, sin build y sin dependencias de npm. Se despliega copiando la
carpeta tal cual a cualquier hosting de archivos estáticos.

---

## Cómo verlo en local

El sitio carga los módulos con `fetch()` y usa módulos ES (`<script type="module">`).
Los navegadores bloquean ambas cosas bajo `file://`, así que **hace falta un
servidor local**. Cualquiera sirve:

```bash
# Python (viene instalado en macOS y Linux)
python3 -m http.server 8080

# Node
npx serve .

# PHP
php -S localhost:8080
```

Luego abre `http://localhost:8080`.

---

## Cómo desplegarlo

No hay paso de compilación. Sube el contenido de la carpeta a la raíz del hosting.

| Hosting | Qué hacer |
|---|---|
| **Netlify** | Arrastra la carpeta, o conecta el repo. `netlify.toml` ya trae cabeceras y caché. |
| **Vercel** | Importa el repo. `vercel.json` ya está configurado. Framework: *Other*. |
| **GitHub Pages** | Sube a la rama `main` y activa Pages sobre la raíz. |
| **Hosting propio (Apache/Nginx)** | Copia todo al `DocumentRoot`. No requiere configuración especial. |

Antes de publicar, cambia el dominio en tres sitios: `robots.txt`, `sitemap.xml`
y la etiqueta `<link rel="canonical">` de `index.html`.

---

## Estructura

```
index.html          Esqueleto. Solo puntos de montaje: <div data-module="…">
app.js              Núcleo: carga módulos, enruta y mantiene el idioma
globals.css         Tokens de marca, reset y utilidades compartidas
404.html            Página de error

data/               Contenido separado de la presentación
  strings.js          Todos los textos, ES y EN
  services.js         Los 10 servicios con su metodología y artefacto
  workflows.js        Los 3 flujos del lienzo tipo n8n
  dash.js             Datos del panel de análisis
  chat.js             Guion del chat y del agente de prospección
  metrics.js          Cifras del inicio
  process.js          Los 3 pasos del método y los 4 pilares
  misc.js             Casos, valores, fundadores, FAQ y señales de confianza
  icons.js            Slugs de marca (Simple Icons)

modules/            Un módulo por bloque. Cada uno con su HTML, CSS y JS
  header/  intro/  hero/  metrics/  chat-demo/  integrations/  process/
  services/  workflow/  mockups/  cases/  about/  contact/  footer/  agent/

vendor/             Código de terceros, sin modificar
  broadsheet.css      Sistema de diseño Broadsheet, encapsulado bajo .bs
  brain-network.js    Motor del cerebro digital (Canvas 2D, sin dependencias)
  brain-network.css   Contenedor y velo del cerebro

aurea-demo.html            Demo del sistema Áurea (app externa, en iframe)
TwoscaleDashboard.dc.html  Dashboard ejecutivo (app externa, en iframe)
support.js                 Runtime que necesita el dashboard. No borrar.
```

---

## Cómo funciona un módulo

Cada carpeta de `modules/` tiene tres archivos con el mismo nombre:

- **`nombre.html`** — el marcado. Sin lógica. Dos convenciones:
  - `data-t="clave"` → `app.js` inyecta la traducción de esa clave.
  - `data-role="x"` → punto de anclaje que el JS del módulo rellena.
- **`nombre.css`** — sus estilos. Todas las clases van prefijadas para que
  ningún módulo pise a otro.
- **`nombre.js`** — exporta `{ name, mount(host, store) }`. `mount` recibe su
  propio contenedor y el store.

Ningún módulo importa a otro. Todos hablan con el store, y por eso se pueden
tocar en paralelo sin conflictos de merge.

### Añadir un módulo

1. Crea `modules/nuevo/` con los tres archivos.
2. Añade `<link rel="stylesheet" href="modules/nuevo/nuevo.css">` en `index.html`.
3. Añade `<div data-module="nuevo"></div>` donde deba aparecer.
4. Añade `'nuevo'` al array `MODULES` de `app.js`.

---

## El store

```js
store.state.lang    // 'es' | 'en', persistido en localStorage
store.state.page    // ruta activa
store.t('clave')    // traduce del diccionario de strings.js
store.pick(obj)     // devuelve obj.es u obj.en según el idioma
store.set({...})    // actualiza y notifica a los suscriptores
store.go('pagina')  // navega
store.subscribe(fn) // se ejecuta en cada cambio; devuelve la función de baja
```

---

## Decisiones que conviene no romper

**`support.js` es obligatorio.** Es el runtime del que depende
`TwoscaleDashboard.dc.html`. Si falta, la maqueta 02 carga en blanco.

**Las dos demos van en `<iframe>`, a propósito.** Áurea y el dashboard son
aplicaciones completas con su propia paleta, su propio CSS y sus propios
listeners de scroll. El iframe las aísla: su recorrido guiado no puede congelar
el scroll de la landing ni su CSS filtrarse. El dashboard se carga con
`?tour=off` justo por eso. No los conviertas en componentes del sitio.

**Broadsheet está encapsulado bajo `.bs`.** Su hoja pinta fondo claro sobre todo
el documento, así que se delimitó a los marcos de maqueta. Fuera de `.bs` manda
la identidad oscura de Twoscale.IA. Si actualizas `vendor/broadsheet.css`, vuelve
a aplicar ese encapsulado.

**Los logos de marca son máscaras CSS, no imágenes.** Se pintan desde Simple
Icons con `-webkit-mask`, lo que permite darles el color del sistema. Los slugs
están en `data/icons.js`; los que no existen en ese set caen a monograma.

**Cada animación respeta `prefers-reduced-motion`.** Si añades una, respétalo
también.

---

## Formulario de contacto

Hoy el `submit` solo muestra el estado de éxito: no hay backend. Para conectarlo,
cambia el manejador en `modules/contact/contact.js` y apúntalo a tu endpoint
(Formspree, Netlify Forms, tu propia API). Los campos ya traen `name` y
`autocomplete` correctos.

---

## Pendientes conocidos

- Los datos de contacto del pie y de la sección Contacto son de ejemplo.
- Las cifras de los casos y de las maquetas son ilustrativas.
- El dashboard y Áurea cargan React desde CDN; si necesitas que funcionen sin
  conexión, habría que incrustarlo.
