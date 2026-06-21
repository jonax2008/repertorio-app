import { Header }     from './Header.js';
import { Toolbar }    from './Toolbar.js';
import { HymnIndex }  from './HymnIndex.js';
import { Viewer }     from './Viewer.js';

const EDITION = 'Edición 2025';
const FAVS_KEY = 'orfeones.favs';

// convierte hex a rgba(r,g,b,alpha)
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export class App {
  /** @param {HTMLElement} root */
  constructor(root) {
    this.root = root;

    // Módulos de datos (cargados en loadData)
    this.HYMNS      = [];
    this.CATEGORIES = [];
    this.norm       = s => s;

    this.state = {
      ready:        false,
      query:        '',
      cat:          null,      // nombre de categoría activa o null (todas)
      favOnly:      false,
      favs:         {},        // { [id]: true }
      current:      null,      // himno abierto en el visor
      pageIndex:    0,
      pdfPageCount: null,      // número real de páginas del PDF cargado
      zoom:         1,
      dark:         false,
      fullscreen:   false,
      voice:        'Ensamble',
      playing:      false,
      progress:     0,
    };

    this._timer = null;
    this._audio = new Audio();
    this._currentAudioUrl = null;
    this._audio.addEventListener('timeupdate', () => {
      if (!this._audio.duration) return;
      this.setState({ progress: (this._audio.currentTime / this._audio.duration) * 100 });
    });
    this._audio.addEventListener('ended', () => {
      this._currentAudioUrl = null;
      this.setState({ progress: 100, playing: false });
    });

    // Componentes (se instancian después de cargar datos)
    this.header    = null;
    this.toolbar   = null;
    this.hymnIndex = null;
    this.viewer    = null;
  }

  // ─── Helpers de audio ────────────────────────────────────────────

  _audioUrlFor(hymn, voice) {
    return hymn?.audios?.find(a => a.voice === voice.toLowerCase())?.url || null;
  }

  _stopAudio() {
    clearInterval(this._timer);
    this._audio.pause();
    this._currentAudioUrl = null;
  }

  // ─── Routing ─────────────────────────────────────────────────────

  /** Devuelve { id, fs } del hash, o null. */
  _hymnIdFromHash() {
    const m = location.hash.match(/^#himno\/(\d+)(\/fs)?$/);
    return m ? { id: parseInt(m[1], 10), fs: !!m[2] } : null;
  }

  /** Actualiza el hash sin disparar hashchange artificial. */
  _setHash(hymn, fullscreen = false) {
    const next = hymn ? `#himno/${hymn.id}${fullscreen ? '/fs' : ''}` : '#';
    if (location.hash !== next) history.pushState(null, '', next);
  }

  /** Reacciona al hash actual: abre el himno correspondiente o cierra el visor. */
  _applyRoute() {
    const parsed = this._hymnIdFromHash();
    if (parsed !== null) {
      const { id, fs } = parsed;
      const hymn = this.HYMNS.find(h => h.id === id);
      if (hymn) {
        if (this.state.current?.id !== id) {
          this._stopAudio();
          this.setState({ current: hymn, pageIndex: 0, pdfPageCount: null, progress: 0, playing: false, voice: 'Ensamble', zoom: 1, fullscreen: fs });
        } else if (this.state.fullscreen !== fs) {
          this.setState({ fullscreen: fs });
        }
        return;
      }
    }
    if (!parsed && this.state.current) {
      this._stopAudio();
      this.setState({ current: null, playing: false, fullscreen: false });
    }
  }

  // ─── Ciclo de vida ───────────────────────────────────────────────

  mount() {
    this.root.innerHTML = `
      <div class="loading-screen" id="loading">
        <div class="loading-screen__title">ORFEONES</div>
        <div class="loading-screen__sub">Cargando repertorio…</div>
      </div>
      <div class="app-main" id="app-main" style="display:none">
        <div id="slot-header"></div>
        <div id="slot-toolbar"></div>
        <div id="slot-index" class="app-index"></div>
      </div>
      <div id="slot-viewer"></div>
    `;

    this._loadingEl = this.root.querySelector('#loading');
    this._mainEl    = this.root.querySelector('#app-main');

    window.addEventListener('popstate', () => this._applyRoute());

    this._loadData();
  }

  async _loadData() {
    const mod = await import('../data/hymns.js');
    this.HYMNS      = mod.HYMNS;
    this.CATEGORIES = mod.CATEGORIES;
    this.norm       = mod.norm;

    let favs = {};
    try { favs = JSON.parse(localStorage.getItem(FAVS_KEY) || '{}'); } catch {}

    // Instanciar componentes con sus elementos raíz y las acciones
    const actions = this._buildActions();
    this.header    = new Header   (this.root.querySelector('#slot-header'),   actions);
    this.toolbar   = new Toolbar  (this.root.querySelector('#slot-toolbar'),  actions);
    this.hymnIndex = new HymnIndex(this.root.querySelector('#slot-index'),    actions);
    this.viewer    = new Viewer   (this.root.querySelector('#slot-viewer'),   actions);

    this.state.favs  = favs;
    this.state.ready = true;

    this._loadingEl.style.display = 'none';
    this._mainEl.style.display    = '';

    // Restaurar vista desde URL antes del primer render
    const initParsed = this._hymnIdFromHash();
    if (initParsed !== null) {
      const hymn = this.HYMNS.find(h => h.id === initParsed.id);
      if (hymn) {
        this.state.current    = hymn;
        this.state.fullscreen = initParsed.fs;
      }
    }

    this._update();
  }

  // ─── Estado ──────────────────────────────────────────────────────

  /** Actualiza state (acepta objeto parcial o función updater). */
  setState(updater) {
    if (typeof updater === 'function') {
      this.state = { ...this.state, ...updater(this.state) };
    } else {
      this.state = { ...this.state, ...updater };
    }
    this._update();
  }

  _update() {
    if (!this.state.ready) return;
    const vm = this._buildViewModel();
    this.header.render(vm);
    this.toolbar.render(vm);
    this.hymnIndex.render(vm);
    this.viewer.render(vm);
  }

  _saveFavs(favs) {
    try { localStorage.setItem(FAVS_KEY, JSON.stringify(favs)); } catch {}
  }

  // ─── Acciones ────────────────────────────────────────────────────

  _buildActions() {
    return {
      setQuery:     (q) => this.setState({ query: q }),
      clearQuery:   ()  => this.setState({ query: '' }),
      setCat:       (c) => this.setState({ cat: c }),
      toggleFavOnly: () => this.setState(s => ({ favOnly: !s.favOnly })),

      toggleFav: (id) => this.setState(s => {
        const favs = { ...s.favs };
        if (favs[id]) delete favs[id]; else favs[id] = true;
        this._saveFavs(favs);
        return { favs };
      }),

      openViewer: (hymn) => {
        this._stopAudio();
        this._setHash(hymn, false);
        this.setState({ current: hymn, pageIndex: 0, pdfPageCount: null, progress: 0, playing: false, voice: 'Ensamble', zoom: 1, fullscreen: false });
      },

      toggleFullscreen: () => {
        const isFs = !this.state.fullscreen;
        this._setHash(this.state.current, isFs);
        this.setState({ fullscreen: isFs });
      },

      exitFullscreen: () => {
        this._setHash(this.state.current, false);
        this.setState({ fullscreen: false });
      },

      setPdfPageCount: (n) => this.setState({ pdfPageCount: n }),

      closeViewer: () => {
        this._stopAudio();
        this._setHash(null);
        this.setState({ current: null, playing: false });
      },

      toggleDark: () => this.setState(s => ({ dark: !s.dark })),

      setVoice: (v) => {
        clearInterval(this._timer);
        this._audio.pause();
        this._currentAudioUrl = null;
        this.setState({ voice: v, progress: 0, playing: false });
        const url = this._audioUrlFor(this.state.current, v);
        if (url) {
          this._audio.src = url;
          this._currentAudioUrl = url;
          this._audio.play().catch(e => console.error('[Audio]', e));
          this.setState({ playing: true });
        }
      },

      togglePlay: () => {
        const s = this.state;
        const playing = !s.playing;
        if (playing) {
          const url = this._audioUrlFor(s.current, s.voice);
          if (url) {
            if (this._currentAudioUrl !== url) {
              this._audio.src = url;
              this._currentAudioUrl = url;
            }
            this._audio.play().catch(e => console.error('[Audio]', e));
          } else {
            // Fallback simulado para himnos sin audio real
            clearInterval(this._timer);
            this._timer = setInterval(() => {
              this.setState(st => {
                const p = st.progress + 0.7;
                if (p >= 100) { clearInterval(this._timer); return { progress: 100, playing: false }; }
                return { progress: p };
              });
            }, 90);
          }
        } else {
          clearInterval(this._timer);
          this._audio.pause();
        }
        this.setState({ playing });
      },

      prevHymn: () => {
        const idx = this.HYMNS.findIndex(h => h.id === this.state.current?.id);
        if (idx > 0) {
          this._stopAudio();
          this._setHash(this.HYMNS[idx - 1], this.state.fullscreen);
          this.setState({ current: this.HYMNS[idx - 1], pageIndex: 0, progress: 0, playing: false, voice: 'Ensamble', zoom: 1 });
        }
      },

      nextHymn: () => {
        const idx = this.HYMNS.findIndex(h => h.id === this.state.current?.id);
        if (idx < this.HYMNS.length - 1) {
          this._stopAudio();
          this._setHash(this.HYMNS[idx + 1], this.state.fullscreen);
          this.setState({ current: this.HYMNS[idx + 1], pageIndex: 0, progress: 0, playing: false, voice: 'Ensamble', zoom: 1 });
        }
      },

      prevPage: () => this.setState(s => ({ pageIndex: Math.max(0, s.pageIndex - 1) })),

      nextPage: () => {
        const { current, pdfPageCount } = this.state;
        if (!current) return;
        let count;
        if (current.pdf && pdfPageCount) {
          count = pdfPageCount;
        } else {
          const idx  = this.HYMNS.findIndex(h => h.id === current.id);
          const next = this.HYMNS[idx + 1];
          count = Math.max(1, next ? (next.page - current.page) : 2);
        }
        this.setState(s => ({ pageIndex: Math.min(count - 1, s.pageIndex + 1) }));
      },

      zoomIn:  () => this.setState(s => ({ zoom: Math.min(2.4,  parseFloat((s.zoom + 0.2).toFixed(2))) })),
      zoomOut: () => this.setState(s => ({ zoom: Math.max(0.6,  parseFloat((s.zoom - 0.2).toFixed(2))) })),
    };
  }

  // ─── View-model ──────────────────────────────────────────────────

  _buildViewModel() {
    const S = this.state;
    const { HYMNS, CATEGORIES, norm } = this;

    // Chips de categoría
    const cats = [
      { name: 'Todas', color: '#b08a3a', active: S.cat === null, count: HYMNS.length },
      ...CATEGORIES.map(c => ({
        name:   c.name,
        color:  c.color,
        active: S.cat === c.name,
        count:  HYMNS.filter(h => h.category === c.name).length,
      })),
    ];

    // Lista filtrada
    let list = [...HYMNS];
    if (S.cat)     list = list.filter(h => h.category === S.cat);
    if (S.favOnly) list = list.filter(h => S.favs[h.id]);
    const q = norm(S.query.trim());
    if (q) list = list.filter(h => norm(h.title).includes(q) || String(h.page).includes(q));
    list.sort((a, b) => a.title.localeCompare(b.title, 'es'));

    // Grupos A-Z
    const map = {};
    list.forEach(h => {
      const L = h.title.replace(/^[¡¿"'(]+/, '')[0].toUpperCase();
      (map[L] = map[L] || []).push({
        ...h,
        isFav:  !!S.favs[h.id],
        tagBg:  hexA(h.color, 0.08),
      });
    });
    const groups = Object.keys(map)
      .sort((a, b) => a.localeCompare(b, 'es'))
      .map(L => ({ letter: L, items: map[L] }));

    // Visor
    let viewer = null;
    if (S.current) {
      const cur   = S.current;
      const idx   = HYMNS.findIndex(h => h.id === cur.id);
      const prev  = HYMNS[idx - 1] || null;
      const next  = HYMNS[idx + 1] || null;
      const hasPdf    = !!cur.pdf;
      const pageCount = hasPdf
        ? (S.pdfPageCount || 1)
        : Math.max(1, next ? (next.page - cur.page) : 2);
      const pi    = Math.min(S.pageIndex, pageCount - 1);

      viewer = {
        hymn:       cur,
        hasPdf,
        pdfUrl:     hasPdf ? cur.pdf + '#view=FitH&toolbar=0' : '',
        isFav:      !!S.favs[cur.id],
        dark:       S.dark,
        fullscreen: S.fullscreen,
        sheetFilter: S.dark ? 'invert(0.9) hue-rotate(180deg) brightness(1.05)' : 'none',
        sheetW:     Math.round(640 * S.zoom),
        zoom:       S.zoom,
        pageNum:    pi + 1,
        pageCount,
        repPage:    cur.page + pi,
        canPrevPage: pi > 0,
        canNextPage: pi < pageCount - 1,
        prev,
        next,
        voices:     cur.voces.map(v => ({ name: v, active: v === S.voice })),
        voice:      S.voice,
        playing:    S.playing,
        progress:   S.progress,
        youtube:    cur.youtube || null,
      };
    }

    return {
      edition:     EDITION,
      shownCount:  list.length,
      query:       S.query,
      favOnly:     S.favOnly,
      favs:        S.favs,
      cats,
      groups,
      letters:     groups.map(g => g.letter),
      isEmpty:     list.length === 0,
      viewer,
    };
  }
}
