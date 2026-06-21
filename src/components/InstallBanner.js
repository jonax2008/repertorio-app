const DISMISS_KEY = 'orfeones.pwa-banner-dismissed';

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function wasDismissed() {
  try { return !!localStorage.getItem(DISMISS_KEY); } catch { return false; }
}

export function mountInstallBanner() {
  if (!isIOS() || isStandalone() || wasDismissed()) return;

  const el = document.createElement('div');
  el.className = 'install-banner';
  el.innerHTML = `
    <div class="install-banner__icon">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
        <polyline points="16 6 12 2 8 6"/>
        <line x1="12" y1="2" x2="12" y2="15"/>
      </svg>
    </div>
    <p class="install-banner__text">
      Para instalar la app, toca
      <svg class="install-banner__share-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
        <polyline points="16 6 12 2 8 6"/>
        <line x1="12" y1="2" x2="12" y2="15"/>
      </svg>
      en Safari y selecciona <strong>"Añadir a pantalla de inicio"</strong>.
    </p>
    <button class="install-banner__close" aria-label="Cerrar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;

  el.querySelector('.install-banner__close').addEventListener('click', () => {
    el.classList.add('install-banner--hiding');
    el.addEventListener('animationend', () => el.remove(), { once: true });
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch {}
  });

  document.body.appendChild(el);
}
