import { App } from './components/App.js';
import { mountInstallBanner } from './components/InstallBanner.js';

const app = new App(document.getElementById('app'));
app.mount();

mountInstallBanner();
