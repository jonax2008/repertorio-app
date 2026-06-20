import { Component } from './Component.js';

const SEARCH_ICON = `<svg width="19" height="19" viewBox="0 0 24 24" fill="none"
  stroke="#9a9384" stroke-width="2" stroke-linecap="round">
  <circle cx="11" cy="11" r="7"></circle>
  <line x1="21" y1="21" x2="16.6" y2="16.6"></line>
</svg>`;

const X_ICON = `<svg width="13" height="13" viewBox="0 0 24 24"
  stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
  <line x1="5" y1="5" x2="19" y2="19"></line>
  <line x1="19" y1="5" x2="5" y2="19"></line>
</svg>`;

const STAR_OUTLINE = `<svg width="17" height="17" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="1.6">
  <path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 17.2 6.1 20.3l1.3-6.2L2.7 9.5l6.3-.7z"></path>
</svg>`;

const STAR_FILL = `<svg width="17" height="17" viewBox="0 0 24 24"
  fill="currentColor" stroke="currentColor" stroke-width="1.6">
  <path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 17.2 6.1 20.3l1.3-6.2L2.7 9.5l6.3-.7z"></path>
</svg>`;

export class Toolbar extends Component {
  constructor(el, actions) {
    super(el);
    this.actions = actions;

    // Delegación desde el contenedor persistente — un solo registro
    this.el.addEventListener('input', e => {
      if (e.target.matches('input[type="search"]')) {
        this.actions.setQuery(e.target.value);
      }
    });

    this.el.addEventListener('click', e => {
      if (e.target.closest('.search-clear')) {
        this.actions.clearQuery();
        const inp = this.$('input[type="search"]');
        if (inp) inp.focus();
        return;
      }
      if (e.target.closest('.btn-favs')) {
        this.actions.toggleFavOnly();
        return;
      }
      const chip = e.target.closest('.cat-chip');
      if (chip) {
        const cat = chip.dataset.cat;
        this.actions.setCat(cat === '__all__' ? null : cat);
      }
    });
  }

  html({ query, favOnly, cats }) {
    const clearVisible = query.length > 0 ? ' visible' : '';
    const favActive    = favOnly ? ' active' : '';
    const starIcon     = favOnly ? STAR_FILL : STAR_OUTLINE;

    const chipsHtml = cats.map(c => {
      const active = c.active ? ' active' : '';
      // "Todas" siempre mapea a null (key especial __all__)
      const catKey = c.name === 'Todas' ? '__all__' : c.name;
      return `
        <button class="cat-chip${active}" data-cat="${catKey}">
          <span class="cat-chip__dot" style="background:${c.color}"></span>
          <span>${c.name}</span>
          <span class="cat-chip__count">${c.count}</span>
        </button>
      `;
    }).join('');

    return `
      <div class="app-toolbar">
        <div class="toolbar-inner">
          <div class="toolbar-row">
            <label class="search-box">
              ${SEARCH_ICON}
              <input
                type="search"
                placeholder="Buscar himno o número de página…"
                value="${this._esc(query)}"
                autocomplete="off"
                spellcheck="false"
              >
              <button class="search-clear${clearVisible}" aria-label="Limpiar búsqueda" type="button">
                ${X_ICON}
              </button>
            </label>
            <button class="btn-favs${favActive}" type="button">
              ${starIcon}
              <span>Favoritos</span>
            </button>
          </div>
          <div class="cats-row">${chipsHtml}</div>
        </div>
      </div>
    `;
  }

  // Después del render: restaurar foco y cursor si el usuario estaba escribiendo
  bind({ query }) {
    const input = this.$('input[type="search"]');
    if (!input) return;
    if (document.activeElement && document.activeElement.tagName === 'INPUT') {
      input.focus();
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }
  }

  _esc(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }
}
