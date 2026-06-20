import { Component } from './Component.js';

// ── SVG icons ──────────────────────────────────────────────────────
const BACK_ICON = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="15 18 9 12 15 6"></polyline>
</svg>`;

const STAR_FILL = `<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6">
  <path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 17.2 6.1 20.3l1.3-6.2L2.7 9.5l6.3-.7z"></path>
</svg>`;

const STAR_NONE = `<svg width="19" height="19" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="1.6">
  <path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 17.2 6.1 20.3l1.3-6.2L2.7 9.5l6.3-.7z"></path>
</svg>`;

const SUN_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="12" r="4.5"></circle>
  <line x1="12" y1="2.5" x2="12" y2="5"></line>
  <line x1="12" y1="19" x2="12" y2="21.5"></line>
  <line x1="2.5" y1="12" x2="5" y2="12"></line>
  <line x1="19" y1="12" x2="21.5" y2="12"></line>
  <line x1="5.2" y1="5.2" x2="6.9" y2="6.9"></line>
  <line x1="17.1" y1="17.1" x2="18.8" y2="18.8"></line>
  <line x1="5.2" y1="18.8" x2="6.9" y2="17.1"></line>
  <line x1="17.1" y1="6.9" x2="18.8" y2="5.2"></line>
</svg>`;

const MOON_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linejoin="round">
  <path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z"></path>
</svg>`;

const PLAY_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
  <path d="M7 5l12 7-12 7z"></path>
</svg>`;

const PAUSE_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
  <rect x="6" y="5" width="4" height="14" rx="1"></rect>
  <rect x="14" y="5" width="4" height="14" rx="1"></rect>
</svg>`;

const PREV_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="15 18 9 12 15 6"></polyline>
</svg>`;

const NEXT_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="9 18 15 12 9 6"></polyline>
</svg>`;

const MINUS_ICON = `<svg width="16" height="16" viewBox="0 0 24 24"
  stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
  <line x1="5" y1="12" x2="19" y2="12"></line>
</svg>`;

const PLUS_ICON = `<svg width="16" height="16" viewBox="0 0 24 24"
  stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
  <line x1="12" y1="5" x2="12" y2="19"></line>
  <line x1="5" y1="12" x2="19" y2="12"></line>
</svg>`;

const HEADPHONES_ICON = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"></path>
  <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
</svg>`;

// ── Component ────────────────────────────────────────────────────────
export class Viewer extends Component {
  constructor(el, actions) {
    super(el);
    this.actions    = actions;
    this._pdfDoc    = null;
    this._pdfUrl    = null;
    this._prevVm    = null;
    this._renderN   = 0;
    this._audioOpen = false;
  }

  render(vm) {
    const v       = vm.viewer;
    const isOpen  = !!v;
    const wasOpen = this.el.classList.contains('viewer');

    if (!isOpen && !wasOpen) return;

    this.vm = vm;

    if (!isOpen) {
      this.el.className  = '';
      this.el.innerHTML  = '';
      this._pdfDoc       = null;
      this._pdfUrl       = null;
      this._prevVm       = null;
      this._audioOpen    = false;
      return;
    }

    const prev        = this._prevVm;
    const hymnChanged = !prev || prev.hymn.id !== v.hymn.id;

    // ── Render completo: primera apertura o cambio de himno ──────────
    if (!wasOpen || hymnChanged) {
      this.el.className  = `viewer open${v.dark ? ' dark' : ''}`;
      this.el.innerHTML  = this._html(v);
      this._bindAll(v);
      if (v.hasPdf) this._loadAndRenderPage(v, null);
      this._prevVm = v;
      return;
    }

    // ── Actualizaciones parciales ────────────────────────────────────
    this.el.className = `viewer open${v.dark ? ' dark' : ''}`;

    // Modo oscuro — clase ya actualizada; sincronizar icono y filtro
    if (prev.dark !== v.dark) {
      const btn = this.$('#v-dark');
      if (btn) btn.innerHTML = v.dark ? SUN_ICON : MOON_ICON;

      if (v.hasPdf) {
        const canvas = this.$('#pdf-canvas');
        if (canvas) canvas.style.filter = v.dark
          ? 'invert(0.9) hue-rotate(180deg) brightness(1.05)' : 'none';
      } else {
        const wrap = this.$('#sheet-wrap');
        if (wrap) wrap.style.filter = v.dark
          ? 'invert(0.9) hue-rotate(180deg) brightness(1.05)' : 'none';
      }
    }

    // Favorito
    if (prev.isFav !== v.isFav) {
      const btn = this.$('#v-fav');
      if (btn) btn.innerHTML = v.isFav ? STAR_FILL : STAR_NONE;
    }

    // Cambio de página
    if (prev.pageNum !== v.pageNum) {
      const dir = v.pageNum > prev.pageNum ? 'right' : 'left';
      if (v.hasPdf) {
        this._loadAndRenderPage(v, dir);
      } else {
        const pn = this.$('.placeholder-page-num');
        if (pn) pn.textContent = v.repPage;
      }
    }

    // Cambio de zoom
    if (prev.zoom !== v.zoom) {
      if (v.hasPdf) {
        this._loadAndRenderPage(v, null);
      } else {
        const wrap = this.$('#sheet-wrap');
        if (wrap) wrap.style.width = `${v.sheetW}px`;
      }
      const zoomLbl = this.$('.zoom-label');
      if (zoomLbl) zoomLbl.textContent = `${Math.round(v.zoom * 100)}%`;
    }

    // Conteo de páginas (recibido async desde PDF.js)
    if (prev.pageCount !== v.pageCount || prev.canPrevPage !== v.canPrevPage || prev.canNextPage !== v.canNextPage) {
      this._patchPageNav(v);
    }

    // Audio / voz / progreso
    const audioChanged = prev.playing !== v.playing
      || Math.abs(prev.progress - v.progress) > 0.1
      || prev.voice !== v.voice;
    if (audioChanged) this._patchAudio(v);

    this._prevVm = v;
  }

  // Base no usada — render() está completamente sobreescrito
  html() { return ''; }

  // ── HTML completo ─────────────────────────────────────────────────
  _html(v) {
    return `
      ${this._topbar(v)}
      ${this._sheet(v)}
      ${this._bottom(v)}
    `;
  }

  // ── Top bar ───────────────────────────────────────────────────────
  _topbar(v) {
    return `
      <div class="viewer-topbar">
        <button class="viewer-btn viewer-btn--back" id="v-close">
          ${BACK_ICON} Índice
        </button>
        <div class="viewer-center">
          <div class="viewer-title">${v.hymn.title}</div>
          <div class="viewer-meta">
            ${v.hymn.category} · pág. ${v.hymn.page} · ${v.hymn.compas} · ♩=${v.hymn.tempo}
          </div>
        </div>
        <button class="viewer-btn viewer-btn--icon" id="v-fav" aria-label="Favorito">
          ${v.isFav ? STAR_FILL : STAR_NONE}
        </button>
        <button class="viewer-btn viewer-btn--icon" id="v-dark" aria-label="Modo escenario">
          ${v.dark ? SUN_ICON : MOON_ICON}
        </button>
      </div>
    `;
  }

  // ── Sheet ─────────────────────────────────────────────────────────
  _sheet(v) {
    if (v.hasPdf) {
      return `
        <div class="viewer-sheet">
          <canvas id="pdf-canvas"></canvas>
        </div>
      `;
    }
    return `
      <div class="viewer-sheet">
        <div id="sheet-wrap" style="width:${v.sheetW}px; flex:none; filter:${v.sheetFilter}">
          ${this._placeholderSheet(v)}
        </div>
      </div>
    `;
  }

  _placeholderSheet(v) {
    const staves = Array.from({ length: 6 }, () => `
      <div class="staff">
        <div class="staff-lines"></div>
        <div class="staff-bar-l"></div>
        <div class="staff-bar-r"></div>
      </div>
    `).join('');

    return `
      <div class="sheet-placeholder">
        <div class="placeholder-title">${v.hymn.title}</div>
        <div class="placeholder-cat">(${v.hymn.category})</div>
        <div class="placeholder-credits">
          <div><strong>Arreglos:</strong><br>${v.hymn.arreglos}</div>
          <div class="placeholder-credits-right"><strong>Autor:</strong><br>${v.hymn.autor}</div>
        </div>
        <div class="placeholder-tempo">♩ = ${v.hymn.tempo} &nbsp;·&nbsp; Compás ${v.hymn.compas}</div>
        <div class="placeholder-staves">${staves}</div>
        <div class="placeholder-watermark">MCEC</div>
        <div class="placeholder-page-num">${v.repPage}</div>
        <div class="placeholder-footer-label">PARTITURA · PDF (marcador)</div>
      </div>
    `;
  }

  // ── Bottom bar ────────────────────────────────────────────────────
  _bottom(v) {
    const voicesHtml = v.voices.map(voice => `
      <button class="voice-btn${voice.active ? ' active' : ''}" data-voice="${voice.name}">
        ${voice.name}
      </button>
    `).join('');

    return `
      <div class="viewer-bottom">
        <div class="audio-panel${this._audioOpen ? ' audio-panel--open' : ''}">
          ${this._audioPlayer(v)}
          <div class="voice-selector">${voicesHtml}</div>
        </div>
        ${this._controlsRow(v)}
        ${this._hymnNav(v)}
      </div>
    `;
  }

  _audioPlayer(v) {
    const ytLink = v.youtube
      ? `<a href="${v.youtube}" target="_blank" rel="noopener">▷ YouTube</a>`
      : `<span style="opacity:.5">▷ YouTube</span>`;
    return `
      <div class="audio-player">
        <button class="audio-play-btn" id="v-play">
          ${v.playing ? PAUSE_ICON : PLAY_ICON}
        </button>
        <div class="audio-track-wrap">
          <div class="audio-labels">
            <span>Audio guía · <b>${v.voice}</b></span>
            <span class="audio-yt">${ytLink}</span>
          </div>
          <div class="audio-track">
            <div class="audio-progress" style="width:${v.progress.toFixed(1)}%"></div>
          </div>
        </div>
      </div>
    `;
  }

  _controlsRow(v) {
    return `
      <div class="controls-row">
        <div class="page-nav">
          <button class="page-nav-btn" id="v-prev-page" ${!v.canPrevPage ? 'disabled' : ''}>
            ${PREV_ICON}
          </button>
          <span class="page-nav-label">${v.pageNum} / ${v.pageCount}</span>
          <button class="page-nav-btn" id="v-next-page" ${!v.canNextPage ? 'disabled' : ''}>
            ${NEXT_ICON}
          </button>
        </div>
        <div class="zoom-controls">
          <button class="zoom-btn" id="v-zoom-out">${MINUS_ICON}</button>
          <span class="zoom-label">${Math.round(v.zoom * 100)}%</span>
          <button class="zoom-btn" id="v-zoom-in">${PLUS_ICON}</button>
        </div>
        <button class="viewer-btn viewer-btn--icon${this._audioOpen ? ' active' : ''}" id="v-audio-toggle" aria-label="Guías de audio">
          ${HEADPHONES_ICON}
        </button>
      </div>
    `;
  }

  _hymnNav(v) {
    return `
      <div class="hymn-nav">
        <button class="hymn-nav-btn" id="v-prev-hymn" ${!v.prev ? 'disabled' : ''}>
          ${PREV_ICON}<span>${v.prev ? v.prev.title : '—'}</span>
        </button>
        <button class="hymn-nav-btn" id="v-next-hymn" ${!v.next ? 'disabled' : ''}>
          <span>${v.next ? v.next.title : '—'}</span>${NEXT_ICON}
        </button>
      </div>
    `;
  }

  // ── Event binding (solo en render completo) ───────────────────────
  _bindAll(v) {
    const on = (id, fn) => {
      const el = this.$(`#${id}`);
      if (el) el.addEventListener('click', fn);
    };

    on('v-close',        () => this.actions.closeViewer());
    on('v-fav',          () => this.actions.toggleFav(v.hymn.id));
    on('v-dark',         () => this.actions.toggleDark());
    on('v-play',         () => this.actions.togglePlay());
    on('v-prev-page',    () => this.actions.prevPage());
    on('v-next-page',    () => this.actions.nextPage());
    on('v-zoom-in',      () => this.actions.zoomIn());
    on('v-zoom-out',     () => this.actions.zoomOut());
    on('v-prev-hymn',    () => this.actions.prevHymn());
    on('v-next-hymn',    () => this.actions.nextHymn());
    on('v-audio-toggle', () => {
      this._audioOpen = !this._audioOpen;
      const panel = this.$('.audio-panel');
      const btn   = this.$('#v-audio-toggle');
      if (panel) panel.classList.toggle('audio-panel--open', this._audioOpen);
      if (btn)   btn.classList.toggle('active', this._audioOpen);
    });

    this.$$('.voice-btn').forEach(btn => {
      btn.addEventListener('click', () => this.actions.setVoice(btn.dataset.voice));
    });
  }

  // ── Parches DOM dirigidos ─────────────────────────────────────────
  _patchAudio(v) {
    const bar = this.$('.audio-progress');
    if (bar) bar.style.width = `${v.progress.toFixed(1)}%`;

    const btn = this.$('#v-play');
    if (btn) btn.innerHTML = v.playing ? PAUSE_ICON : PLAY_ICON;

    // Etiqueta de voz activa
    const lbl = this.$('.audio-labels > span:first-child');
    if (lbl) lbl.innerHTML = `Audio guía · <b>${v.voice}</b>`;

    // Resaltar botón de voz activo
    this.$$('.voice-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.voice === v.voice);
    });
  }

  _patchPageNav(v) {
    const prevBtn = this.$('#v-prev-page');
    const nextBtn = this.$('#v-next-page');
    const lbl     = this.$('.page-nav-label');
    if (prevBtn) prevBtn.disabled = !v.canPrevPage;
    if (nextBtn) nextBtn.disabled = !v.canNextPage;
    if (lbl)     lbl.textContent  = `${v.pageNum} / ${v.pageCount}`;
  }

  // ── PDF.js: carga y render de página ─────────────────────────────
  async _loadAndRenderPage(v, direction) {
    // ID único para esta solicitud; cancela renders anteriores si llegó otro
    this._renderN++;
    const myN = this._renderN;

    try {
      // Cargar documento si cambió la URL
      if (v.hymn.pdf !== this._pdfUrl) {
        this._pdfDoc = await window.pdfjsLib.getDocument(v.hymn.pdf).promise;
        this._pdfUrl = v.hymn.pdf;
        // Informar el número real de páginas al estado global
        this.actions.setPdfPageCount(this._pdfDoc.numPages);
      }

      if (myN !== this._renderN) return;

      const canvas = this.$('#pdf-canvas');
      if (!canvas || !this._pdfDoc) return;

      const page = await this._pdfDoc.getPage(v.pageNum);
      if (myN !== this._renderN) return;

      // Escala: ajustar al área disponible respetando el zoom del usuario
      const sheet = this.$('.viewer-sheet');
      const rect  = sheet ? sheet.getBoundingClientRect() : { width: 640, height: 800 };
      const cw    = rect.width  - 48;
      const ch    = rect.height - 32;

      const dpr      = window.devicePixelRatio || 1;
      const vp0      = page.getViewport({ scale: 1 });
      const fitScale = Math.min(cw / vp0.width, ch / vp0.height);
      const viewport = page.getViewport({ scale: fitScale * v.zoom * dpr });

      canvas.width  = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width  = `${Math.floor(viewport.width  / dpr)}px`;
      canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;
      canvas.style.filter = v.dark
        ? 'invert(0.9) hue-rotate(180deg) brightness(1.05)' : 'none';

      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      if (myN !== this._renderN) return;

      // Animación de deslizamiento horizontal al cambiar página
      if (direction) {
        const cls = direction === 'right' ? 'slide-from-right' : 'slide-from-left';
        canvas.classList.remove('slide-from-right', 'slide-from-left');
        void canvas.offsetWidth; // forzar reflow para reiniciar la animación
        // Cortar overflow brevemente para que el slide no se vea fuera del marco
        if (sheet) {
          sheet.style.overflow = 'hidden';
          setTimeout(() => { sheet.style.overflow = ''; }, 260);
        }
        canvas.classList.add(cls);
      }
    } catch (err) {
      console.error('[PDF.js]', err);
    }
  }
}
