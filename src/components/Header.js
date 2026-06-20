import { Component } from './Component.js';

export class Header extends Component {
  html({ edition, shownCount }) {
    return `
      <header class="app-header">
        <div class="header-inner">
          <div class="header-brand">
            <div class="header-logo">O</div>
            <div class="header-titles">
              <div class="header-title">Repertorio Universal del Coro</div>
              <div class="header-meta">
                <span class="header-orfeones">ORFEONES</span>
                <span class="header-sep"></span>
                <span class="header-edition">${edition}</span>
              </div>
            </div>
          </div>
          <div class="header-count">
            <div class="header-count__num">${shownCount}</div>
            <div class="header-count__label">himnos</div>
          </div>
        </div>
      </header>
    `;
  }
}
