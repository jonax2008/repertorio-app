# CLAUDE.md — Gestor de Repertorio del Coro (ORFEONES)

> Contexto y especificación para construir la web-app real. Este documento resume las
> decisiones de diseño y producto tomadas durante la fase de prototipado. Los archivos
> `Propuesta *.dc.html` y `hymns.js` en este repo son **prototipos de referencia visual y
> funcional** — NO son la base de código de producción, pero son la fuente de verdad para
> el diseño, los tokens y el comportamiento esperado.

---

## 1. Qué estamos construyendo

Una **SPA (Single Page Application)** para que los integrantes del coro consulten el
repertorio de himnos de ORFEONES (Ministerio de Cultura y Educación Cristiana).

Dos pantallas principales:

1. **Índice de himnos** — catálogo navegable de todos los himnos (más de 200, y crecen cada año).
2. **Visor de himno a pantalla completa** — muestra el PDF de la partitura + audios guía + video.

**Optimizada para tablet/iPad** (dispositivo principal de uso, p. ej. en atriles/escenario),
y totalmente funcional en **móvil**. El escritorio es secundario pero debe verse bien.

App de carácter **institucional**: color base **blanco**, sobria y elegante.

---

## 2. Dirección de diseño elegida

Se exploraron 3 propuestas. **La aprobada es la Propuesta C** (`Propuesta C - Clasico con Cards.dc.html`):

- **Estética**: clásica institucional — serif elegante para títulos, azul marino profundo y
  dorado sobre fondo papel/blanco.
- **Índice**: himnos presentados como **tarjetas (cards) en cuadrícula**, agrupadas por letra (A–Z).
- **Visor**: a pantalla completa, con PDF real, modo escenario (oscuro) y reproductor de voces.

Las Propuestas A (lista) y B (moderno sans) son referencia descartada; usar **solo la C** como guía.

---

## 3. Sistema visual (tokens)

### Tipografía
- **Títulos / nombres de himnos**: `Cormorant Garamond` (serif), pesos 600/700.
- **UI, cuerpo, etiquetas**: `Libre Franklin` (sans-serif), pesos 400/500/600/700.
- Cargar desde Google Fonts; en producción considerar self-host para offline/rendimiento.

### Colores
| Token | Hex | Uso |
|---|---|---|
| `navy` | `#16224d` | Color primario (títulos, botones activos, chips) |
| `gold` | `#b08a3a` | Acento (favoritos, detalles, letra de grupo, play) |
| `paper` | `#fcfbf6` | Fondo de cabecera y partitura |
| `bg` | `#f6f4ee` | Fondo general de la app |
| `ink` | `#23262e` | Texto principal |
| `line` | `#e6e1d4` | Bordes y separadores |
| texto sec. | `#9a9384` | Texto secundario / metadatos |

### Colores por categoría (chip + punto)
```
Adoración      #9a7a2e      Segunda Venida #3a4a8c
Elección       #1d2a5c      Consuelo       #566072
Consagración   #7a3b4c      Navidad        #3a6b4a
Oración        #2f6f6a      Comunión       #7d5a8c
Júbilo         #b06a1f      Despedida      #8a6a3a
```
El chip de categoría usa el color a ~8% de opacidad como fondo y el color pleno para texto/punto.

### Estilo de componentes
- **Tarjetas**: fondo blanco, borde `1px line`, `border-radius:14px`, padding ~16px.
  Hover: borde dorado + sombra suave + `translateY(-2px)`.
- **Botones/inputs**: `border-radius:10–12px`, altura ≥44px (objetivo táctil mínimo).
- **Sombras** sutiles, nada de gradientes llamativos. Sin emojis.
- Espaciado generoso; usar `display:grid`/`flex` con `gap`.

---

## 4. Modelo de datos

Cada himno (ver `hymns.js` para el shape exacto y datos de ejemplo):

```ts
interface Hymn {
  id: number;
  title: string;            // "A Él Oíd y Recibid"
  page: number;             // nº de página en el repertorio impreso
  category: string;         // una de las 10 categorías
  pdf: string | null;       // URL al PDF de la partitura
  arreglos: string;         // créditos de arreglos
  autor: string;            // autor/compositor
  tempo: number;            // ♩ = N
  compas: string;           // "4/4", "3/4", "6/8", "2/4"
  voces: string[];          // ["Soprano","Contralto","Tenor","Bajo","Ensamble"]
  // --- AÑADIR EN PRODUCCIÓN: ---
  audios?: { voice: string; url: string }[];   // audio guía por voz
  youtube?: string;         // link a video-partitura (YouTube)
}
```

Las **categorías** son una lista fija con nombre + color (ver tabla arriba), administrable.

### Requisitos reales de contenido (importante)
- **+200 himnos**, y se **añaden más cada año** → el catálogo debe crecer sin tocar código.
- La mayoría tendrá **audios guía por cada voz** (Soprano, Contralto, Tenor, Bajo) **y ensamble**.
- Muchos tendrán **link a YouTube** con video-partitura guía por voz.
- Cada himno tiene un **PDF** de partitura.

> ⚠️ Por el volumen y crecimiento, NO hardcodear los datos. Necesitamos una **capa de datos
> administrable**: un backend/CMS o, como mínimo, archivos de datos + almacenamiento de assets
> (PDFs y audios) gestionables sin redeploy. Ver sección 7.

---

## 5. Funcionalidades

### Índice
- [x] Cuadrícula de tarjetas, agrupadas por letra inicial (A, B, C…).
- [x] **Buscador** por nombre del himno y por número de página (sin distinción de acentos/mayúsculas).
- [x] **Filtro por categoría** (chips horizontales con contador por categoría + "Todas").
- [x] **Riel A–Z** lateral que salta a cada grupo de letra.
- [x] **Favoritos**: marcar/desmarcar (estrella) y filtro "solo favoritos".
      Persistir en `localStorage` (clave usada en el prototipo: `orfeones.favs`). En producción,
      idealmente por usuario si hay login.
- [x] Contador total de himnos mostrados.

### Visor de himno (pantalla completa)
- [x] **PDF real** de la partitura.
- [x] **Modo claro / oscuro (escenario)** — invierte el PDF para lectura con poca luz.
      (Implementado con filtro CSS `invert` sobre el contenedor del PDF.)
- [x] **Zoom y desplazamiento** de la partitura.
- [x] **Pasar páginas** (anterior/siguiente) para partituras multipágina.
- [x] **Botón volver al índice** rápido.
- [x] **Navegar al himno anterior/siguiente** desde el visor.
- [x] **Reproductor de audio guía por voz**: selector Soprano/Contralto/Tenor/Bajo/Ensamble +
      play/pausa + barra de progreso. (En el prototipo el audio está simulado — conectar a archivos reales.)
- [x] **Enlace a YouTube** (video-partitura).
- [x] Metadatos: categoría, página, compás, tempo, arreglos, autor.

### Sobre el visor de PDF (decisión técnica — IMPLEMENTADO)
El demo usa **PDF.js 3.11.174** (`pdfjs-dist`) cargado desde CDN, con render a `<canvas>`.

```html
<!-- index.html -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script>
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
</script>
```

Comportamiento implementado en `src/components/Viewer.js → _loadAndRenderPage()`:
- El canvas se escala automáticamente para ajustarse al área visible (`fitScale = min(cw/w, ch/h) * zoom`).
- Cambio de página con **deslizamiento horizontal** (izquierda/derecha) mediante clases CSS
  `.slide-from-right` / `.slide-from-left` — evoca pasar hojas del repertorio físico.
- Modo escenario: `filter: invert(0.9) hue-rotate(180deg) brightness(1.05)` sobre el canvas.
- Número real de páginas: PDF.js reporta `pdfDoc.numPages` al estado global via `setPdfPageCount()`.
- Render parcial: el canvas **no** se destruye en actualizaciones de audio (progreso cada 90 ms);
  solo se re-renderiza cuando cambia la página, el zoom o el modo oscuro.

---

## 6. Responsive / UX

- **Tablet-first**: la cuadrícula de tarjetas usa `repeat(auto-fill, minmax(~244px, 1fr))`.
  En móvil cae a 1–2 columnas; en iPad 2–3; en escritorio 3–4.
- Objetivos táctiles ≥ 44px.
- El visor debe aprovechar toda la altura disponible; en iPad horizontal la partitura se ve grande.
- Tener en cuenta `env(safe-area-inset-*)` para notch/barras en iOS.
- Considerar **PWA** (instalable + offline de los himnos consultados) — encaja muy bien con el uso en atril.

---

## 7. Stack del demo actual y recomendaciones para producción

### Stack del demo (implementado)

El demo es una SPA sin framework ni bundler:

| Capa | Decisión |
|---|---|
| Markup | HTML5 — `index.html` solo como contenedor (`<div id="app">`) |
| Estilos | CSS plano con custom properties (`src/styles/main.css`) |
| Lógica | Vanilla JS · ES6 modules (`type="module"`) · clases ES6 como componentes |
| PDF | **PDF.js 3.11.174** · CDN (`cdnjs.cloudflare.com`) · acceso como `window.pdfjsLib` |
| Estado | Objeto central en `App` · método `setState()` · sin reactividad externa |
| Favoritos | `localStorage` · clave `orfeones.favs` · objeto `{ [id]: true }` |
| Servidor local | `python3 -m http.server <puerto>` (sin bundler, ES modules nativos) |

> **No hay `node_modules`, `package.json` ni paso de build.** Abrir directamente con servidor HTTP.

### Stack recomendado para producción

Cuando el demo se escale a la app real, migrar a:

- **Framework**: React + TypeScript + Vite.
- **Routing**: React Router — rutas `/` (índice) y `/himno/:id` para deep-linking/compartir.
- **Estado**: Zustand o Context.
- **PDF**: `pdfjs-dist` (npm) — misma librería, instalar en vez de CDN para offline/PWA.
- **Estilos**: CSS Modules o Tailwind — respetar los tokens de la sección 3.
- **Datos y assets** (clave por el volumen y crecimiento):
  - **Opción A** (recomendada): **Supabase** o **Firebase** — tabla de himnos + Storage para PDFs y
    audios + panel admin para altas anuales sin tocar código.
  - **Opción B** (MVP rápido): JSON estático + PDFs/audios en bucket (S3/CDN),
    actualizable sin redeploy. Migrar a backend cuando se necesite admin.
- **Admin**: definir cómo dar de alta himnos nuevos cada año (PDF + audios + YouTube + metadatos).

---

## 8. Arquitectura del demo (estructura de archivos)

```
repertorio-app/
├── index.html                      # Contenedor mínimo; carga PDF.js CDN + main.css + main.js
├── src/
│   ├── main.js                     # Punto de entrada: instancia App y llama mount()
│   ├── styles/
│   │   └── main.css                # Tokens CSS + todos los estilos de la app
│   ├── data/
│   │   └── hymns.js                # 85 himnos · 10 categorías · función norm() para búsqueda
│   └── components/
│       ├── Component.js            # Clase base: render(vm) → html(vm) + bind(vm)
│       ├── App.js                  # Controlador central: estado, acciones, view-model, orquestación
│       ├── Header.js               # Cabecera fija con logo, título y contador
│       ├── Toolbar.js              # Buscador + botón favoritos + chips de categoría
│       ├── HymnIndex.js            # Cuadrícula de cards A-Z + riel lateral
│       └── Viewer.js               # Visor a pantalla completa con PDF.js + audio + nav
└── assets/
    └── A El Oid y Recibid.pdf      # Único PDF real disponible en el demo
```

### Patrón de componentes

Cada componente hereda de `Component` y recibe `(el, actions)` en el constructor:

```
App._buildViewModel() → vm (objeto derivado del estado)
     ↓
App._update() → component.render(vm)
     ↓
component.html(vm) → innerHTML del elemento raíz
component.bind(vm) → event listeners (o delegación registrada una sola vez)
```

`Viewer.js` sobreescribe `render()` directamente para aplicar **actualizaciones parciales** del DOM
en lugar de destruir y recrear el canvas en cada tick de audio.

### Acciones disponibles (App._buildActions)

| Acción | Descripción |
|---|---|
| `setQuery(q)` | Actualiza texto de búsqueda |
| `clearQuery()` | Limpia búsqueda |
| `setCat(c)` | Filtra por categoría (null = todas) |
| `toggleFavOnly()` | Alterna filtro de favoritos |
| `toggleFav(id)` | Marca/desmarca favorito y persiste en localStorage |
| `openViewer(hymn)` | Abre el visor y resetea estado de página/audio |
| `closeViewer()` | Cierra el visor |
| `toggleDark()` | Alterna modo escenario |
| `setVoice(v)` | Cambia voz del reproductor de audio |
| `togglePlay()` | Play/pausa del reproductor simulado |
| `prevHymn()` / `nextHymn()` | Navega al himno anterior/siguiente |
| `prevPage()` / `nextPage()` | Cambia página del PDF (usa `pdfPageCount` real) |
| `zoomIn()` / `zoomOut()` | Zoom ±0.2 (rango 0.6–2.4) |
| `setPdfPageCount(n)` | Llamado por Viewer cuando PDF.js carga el documento |

### Dependencia externa crítica: PDF.js

- **Versión**: 3.11.174
- **Carga**: CDN · `cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/`
- **Archivos**: `pdf.min.js` (main) + `pdf.worker.min.js` (worker en hilo separado)
- **Acceso en JS**: `window.pdfjsLib` (global UMD)
- **Para producción**: instalar `pdfjs-dist` via npm y servir el worker como asset estático
  (Vite copia `pdfjs-dist/build/pdf.worker.min.js` al bundle).

---

## 9. Estructura de datos sugerida (assets)

```
/himnos/{id}/partitura.pdf
/himnos/{id}/audio-soprano.mp3
/himnos/{id}/audio-contralto.mp3
/himnos/{id}/audio-tenor.mp3
/himnos/{id}/audio-bajo.mp3
/himnos/{id}/audio-ensamble.mp3
```
Nombrar por `id` estable (no por título, que puede tener acentos/cambios).

---

## 10. Archivos de referencia en este repo

- `Propuesta C - Clasico con Cards.dc.html` → **diseño y comportamiento objetivo** (fuente de verdad visual).
- `hymns.js` → shape de datos + ~85 himnos reales del índice impreso como ejemplo + categorías + colores.
- `uploads/A El Oid y Recibid.pdf` → ejemplo de PDF real de partitura.
- `Propuestas - Inicio.dc.html` → portada comparativa de las 3 propuestas (solo histórico).
- `Propuesta A` / `Propuesta B` → exploraciones descartadas (no usar como base).

> Los `.dc.html` son prototipos hechos con un runtime propio; en producción se reescribe la UI
> en el stack elegido, **replicando el diseño de la Propuesta C**, no copiando ese runtime.

---

## 11. Cosas a definir con el cliente antes/durante el build

- ¿Habrá **login / usuarios**? (afecta a favoritos, listas personales, permisos de admin).
- ¿Quién y cómo **administra** las altas anuales de himnos? (panel propio vs. Supabase/Firebase console).
- ¿Se quieren **listas/programas** por evento (set lists)? (se mencionó como posible organización).
- Formato y origen de los **audios** por voz (mp3 grabados, etc.).
- ¿**PWA / offline**? (recomendado para uso en escenario sin buena señal).
