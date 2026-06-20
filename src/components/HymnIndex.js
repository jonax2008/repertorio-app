import { Component } from './Component.js';

const STAR_FILL = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 17.2 6.1 20.3l1.3-6.2L2.7 9.5l6.3-.7z"></path>
</svg>`;

const STAR_OUTLINE = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
  stroke="#cfc9ba" stroke-width="1.6">
  <path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 17.2 6.1 20.3l1.3-6.2L2.7 9.5l6.3-.7z"></path>
</svg>`;

export class HymnIndex extends Component {
  constructor(el, actions) {
    super(el);
    this.actions = actions;
    // El listener de delegación se registra una sola vez en el constructor
    // (this.el persiste entre renders, el DOM interno se reemplaza con innerHTML)
    this.el.addEventListener('click', e => this._onClick(e));
  }

  html({ groups, letters, isEmpty }) {
    if (isEmpty) {
      return `
        <div class="index-inner">
          <div class="empty-state">
            <div class="empty-state__title">Sin resultados</div>
            <div>No se encontraron himnos para esta búsqueda.</div>
          </div>
        </div>
        <div class="az-rail"></div>
      `;
    }

    const groupsHtml = groups.map(g => `
      <section class="letter-group" id="grp-${CSS.escape(g.letter)}">
        <div class="letter-header">
          <span class="letter-char">${g.letter}</span>
          <span class="letter-rule"></span>
        </div>
        <div class="hymn-grid">
          ${g.items.map(h => this._cardHtml(h)).join('')}
        </div>
      </section>
    `).join('');

    const railHtml = letters.map(L => `
      <button class="az-btn" data-letter="${L}">${L}</button>
    `).join('');

    return `
      <div class="index-inner">
        ${groupsHtml}
      </div>
      <div class="az-rail">${railHtml}</div>
    `;
  }

  _cardHtml(h) {
    const star = h.isFav ? STAR_FILL : STAR_OUTLINE;
    return `
      <div class="hymn-card" data-id="${h.id}">
        <div class="card-top">
          <span class="card-tag" style="color:${h.color}; background:${h.tagBg}">
            <span class="card-tag__dot" style="background:${h.color}"></span>
            ${h.category}
          </span>
          <button class="fav-btn" data-fav="${h.id}" aria-label="Favorito">${star}</button>
        </div>
        <div class="card-title">${h.title}</div>
        <div class="card-footer">
          <span class="card-arreglos">${h.arreglos}</span>
          <span class="card-page">
            <span class="card-page__label">pág.</span>
            <span class="card-page__num">${h.page}</span>
          </span>
        </div>
      </div>
    `;
  }

  // bind() no se necesita aquí; el listener vive en el constructor
  bind() {}

  _onClick(e) {
    // Botón favorito
    const favBtn = e.target.closest('.fav-btn');
    if (favBtn) {
      e.stopPropagation();
      this.actions.toggleFav(Number(favBtn.dataset.fav));
      return;
    }

    // Tarjeta completa → abrir visor
    const card = e.target.closest('.hymn-card');
    if (card && this.vm) {
      const hymn = this.vm.groups
        .flatMap(g => g.items)
        .find(h => h.id === Number(card.dataset.id));
      if (hymn) this.actions.openViewer(hymn);
      return;
    }

    // Botón A-Z
    const azBtn = e.target.closest('.az-btn');
    if (azBtn) this._jumpTo(azBtn.dataset.letter);
  }

  _jumpTo(letter) {
    const section = this.el.querySelector(`#grp-${CSS.escape(letter)}`);
    if (!section) return;
    // El contenedor scroll es this.el (app-index con overflow-y:auto)
    this.el.scrollTop += section.getBoundingClientRect().top
      - this.el.getBoundingClientRect().top - 4;
  }
}
