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

// ── Component ───────────────────────────────────────────────────────
export class Viewer extends Component {
  constructor(el, actions) {
    super(el);
    this.actions = actions;
  }

  render(vm) {
    const v = vm.viewer;
    const isOpen = !!v;

    // Sólo re-renderizar cuando el visor está abierto o acaba de cerrarse
    const wasOpen = this.el.classList.contains('viewer');
    if (!isOpen && !wasOpen) return;

    this.vm = vm;

    if (!isOpen) {
      // Cerrar: limpiar y ocultar
      this.el.className = '';
      this.el.innerHTML = '';
      return;
    }

    this.el.className = `viewer open${v.dark ? ' dark' : ''}`;
    this.el.innerHTML = this._html(v);
    this._bind(v);
  }

  // Sobreescribimos render completo; html/bind base no se usan
  html() { return ''; }

  _html(v) {
    return `
      ${this._topbar(v)}
      ${this._sheet(v)}
      ${this._bottom(v)}
    `;
  }

  // ── Top bar ──────────────────────────────────────────────────────
  _topbar(v) {
    const darkToggleIcon = v.dark ? SUN_ICON : MOON_ICON;
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
          ${darkToggleIcon}
        </button>
      </div>
    `;
  }

  // ── Sheet ────────────────────────────────────────────────────────
  _sheet(v) {
    const content = v.hasPdf ? this._pdfSheet(v) : this._placeholderSheet(v);
    return `
      <div class="viewer-sheet">
        <div style="filter:${v.sheetFilter}; ${v.hasPdf ? 'width:100%;height:100%;align-self:stretch;' : `width:${v.sheetW}px;flex:none;`}">
          ${content}
        </div>
      </div>
    `;
  }

  _pdfSheet(v) {
    return `
      <div class="sheet-pdf">
        <iframe src="${v.pdfUrl}" title="Partitura PDF"></iframe>
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

  // ── Bottom bar ───────────────────────────────────────────────────
  _bottom(v) {
    return `
      <div class="viewer-bottom">
        ${this._audioPlayer(v)}
        ${this._controlsRow(v)}
        ${this._hymnNav(v)}
      </div>
    `;
  }

  _audioPlayer(v) {
    const playIcon  = v.playing ? PAUSE_ICON : PLAY_ICON;
    const progress  = v.progress.toFixed(1);
    const ytLink    = v.youtube
      ? `<a href="${v.youtube}" target="_blank" rel="noopener">▷ Video-partitura YouTube</a>`
      : `<span style="opacity:.5">▷ Video-partitura YouTube</span>`;

    return `
      <div class="audio-player">
        <button class="audio-play-btn" id="v-play">${playIcon}</button>
        <div class="audio-track-wrap">
          <div class="audio-labels">
            <span>Audio guía · <b>${v.voice}</b></span>
            <span class="audio-yt">${ytLink}</span>
          </div>
          <div class="audio-track">
            <div class="audio-progress" style="width:${progress}%"></div>
          </div>
        </div>
      </div>
    `;
  }

  _controlsRow(v) {
    const voicesHtml = v.voices.map(voice => `
      <button class="voice-btn${voice.active ? ' active' : ''}" data-voice="${voice.name}">
        ${voice.name}
      </button>
    `).join('');

    // Controles de página y zoom sólo en modo placeholder (sin PDF real)
    const pageAndZoom = !v.hasPdf ? `
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
    ` : `<span class="pdf-hint">PDF real · pellizca o desplaza para zoom</span>`;

    return `
      <div class="controls-row">
        <div class="voice-selector">${voicesHtml}</div>
        ${pageAndZoom}
      </div>
    `;
  }

  _hymnNav(v) {
    const prevTitle = v.prev ? v.prev.title : '—';
    const nextTitle = v.next ? v.next.title : '—';
    return `
      <div class="hymn-nav">
        <button class="hymn-nav-btn" id="v-prev-hymn" ${!v.prev ? 'disabled' : ''}>
          ${PREV_ICON}<span>${prevTitle}</span>
        </button>
        <button class="hymn-nav-btn" id="v-next-hymn" ${!v.next ? 'disabled' : ''}>
          <span>${nextTitle}</span>${NEXT_ICON}
        </button>
      </div>
    `;
  }

  // ── Event binding ────────────────────────────────────────────────
  _bind(v) {
    const on = (id, fn) => {
      const el = this.$(`#${id}`);
      if (el) el.addEventListener('click', fn);
    };

    on('v-close',     () => this.actions.closeViewer());
    on('v-fav',       () => this.actions.toggleFav(v.hymn.id));
    on('v-dark',      () => this.actions.toggleDark());
    on('v-play',      () => this.actions.togglePlay());
    on('v-prev-page', () => this.actions.prevPage());
    on('v-next-page', () => this.actions.nextPage());
    on('v-zoom-in',   () => this.actions.zoomIn());
    on('v-zoom-out',  () => this.actions.zoomOut());
    on('v-prev-hymn', () => this.actions.prevHymn());
    on('v-next-hymn', () => this.actions.nextHymn());

    this.$$('.voice-btn').forEach(btn => {
      btn.addEventListener('click', () => this.actions.setVoice(btn.dataset.voice));
    });
  }
}
