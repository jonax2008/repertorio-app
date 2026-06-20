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

### Sobre el visor de PDF (decisión técnica)
En el prototipo se probaron dos caminos:
1. **Render con PDF.js en `<canvas>`** — control total de páginas/zoom/miniaturas, pero más código.
2. **Visor nativo del navegador** vía `<iframe>` (lo que quedó en el prototipo por simplicidad).

**Recomendación para producción: usar PDF.js** (`pdfjs-dist`) con render a canvas. Permite:
control unificado de zoom/página, miniaturas, el modo escenario por inversión, y comportamiento
consistente entre iOS Safari / Android / escritorio (el visor nativo en iframe es inconsistente
en iPad). El modo oscuro se logra con `filter: invert(0.9) hue-rotate(180deg)` sobre el canvas.

---

## 6. Responsive / UX

- **Tablet-first**: la cuadrícula de tarjetas usa `repeat(auto-fill, minmax(~244px, 1fr))`.
  En móvil cae a 1–2 columnas; en iPad 2–3; en escritorio 3–4.
- Objetivos táctiles ≥ 44px.
- El visor debe aprovechar toda la altura disponible; en iPad horizontal la partitura se ve grande.
- Tener en cuenta `env(safe-area-inset-*)` para notch/barras en iOS.
- Considerar **PWA** (instalable + offline de los himnos consultados) — encaja muy bien con el uso en atril.

---

## 7. Recomendaciones técnicas (stack)

Decisión abierta — el equipo elige. Recomendación por defecto:

- **Framework**: React + TypeScript + Vite. (o el que el equipo prefiera)
- **Routing**: React Router — rutas `/` (índice) y `/himno/:id` (visor) para deep-linking/compartir.
- **Estado**: ligero (Zustand o Context). Favoritos en `localStorage` (o por usuario si hay auth).
- **PDF**: `pdfjs-dist`.
- **Estilos**: CSS Modules / Tailwind / styled — respetar los tokens de la sección 3.
- **Datos y assets** (la parte clave por el volumen y crecimiento):
  - Opción A (recomendada para crecer fácil): backend gestionado tipo **Supabase** o **Firebase**
    — tabla/colección de himnos + Storage para PDFs y audios + panel admin para altas anuales.
  - Opción B (MVP rápido): JSON estático de himnos + PDFs/audios en un bucket (S3/Cloud Storage/CDN),
    actualizable sin redeploy. Migrar a backend cuando se necesite el panel de administración.
- **Admin**: hará falta una forma de **dar de alta himnos nuevos cada año** (PDF + audios por voz +
  YouTube + metadatos) sin tocar código. Definir esto pronto.

---

## 8. Estructura de datos sugerida (assets)

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

## 9. Archivos de referencia en este repo

- `Propuesta C - Clasico con Cards.dc.html` → **diseño y comportamiento objetivo** (fuente de verdad visual).
- `hymns.js` → shape de datos + ~85 himnos reales del índice impreso como ejemplo + categorías + colores.
- `uploads/A El Oid y Recibid.pdf` → ejemplo de PDF real de partitura.
- `Propuestas - Inicio.dc.html` → portada comparativa de las 3 propuestas (solo histórico).
- `Propuesta A` / `Propuesta B` → exploraciones descartadas (no usar como base).

> Los `.dc.html` son prototipos hechos con un runtime propio; en producción se reescribe la UI
> en el stack elegido, **replicando el diseño de la Propuesta C**, no copiando ese runtime.

---

## 10. Cosas a definir con el cliente antes/durante el build

- ¿Habrá **login / usuarios**? (afecta a favoritos, listas personales, permisos de admin).
- ¿Quién y cómo **administra** las altas anuales de himnos? (panel propio vs. Supabase/Firebase console).
- ¿Se quieren **listas/programas** por evento (set lists)? (se mencionó como posible organización).
- Formato y origen de los **audios** por voz (mp3 grabados, etc.).
- ¿**PWA / offline**? (recomendado para uso en escenario sin buena señal).
