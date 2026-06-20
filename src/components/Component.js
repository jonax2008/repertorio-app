/**
 * Clase base para todos los componentes de la app.
 *
 * Cada subclase recibe el elemento raíz del DOM en el constructor,
 * implementa `html(vm)` para generar el markup y `bind(vm)` para
 * adjuntar los event listeners después de cada render.
 *
 * El ciclo de actualización es siempre:
 *   render(vm) → this.el.innerHTML = this.html(vm) → this.bind(vm)
 */
export class Component {
  /**
   * @param {HTMLElement} el  Elemento raíz que gestiona este componente.
   */
  constructor(el) {
    this.el = el;
    this.vm = null;
  }

  /**
   * Renderiza el componente con el view-model dado.
   * Llama a html() para generar el markup y a bind() para los eventos.
   *
   * @param {object} vm  View-model derivado por App.
   */
  render(vm) {
    this.vm = vm;
    this.el.innerHTML = this.html(vm);
    this.bind(vm);
  }

  /** Devuelve el HTML string del componente. Debe ser sobreescrito. */
  html(vm) { return ''; }

  /** Adjunta event listeners después del render. Puede ser sobreescrito. */
  bind(vm) {}

  /** Shorthand para querySelector dentro del elemento raíz. */
  $(sel) { return this.el.querySelector(sel); }

  /** Shorthand para querySelectorAll dentro del elemento raíz. */
  $$(sel) { return Array.from(this.el.querySelectorAll(sel)); }
}
