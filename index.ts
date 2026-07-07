import { getSettings } from './utils/settingsHelper';

// Apply settings dynamically
const settings = getSettings();
const appLogo = document.getElementById('app-logo') as HTMLImageElement;

if (appLogo) {
  // Comentamos esta linha para a logo vir direto do HTML e não do settings temporariamente
  // appLogo.src = settings.logo; 
}

const iconHymns = document.getElementById('icon-hymns');
const iconGifts = document.getElementById('icon-gifts');
// ... (o restante do seu código continua exatamente igual daqui para baixo)
const iconOther = document.getElementById('icon-other');
const iconSupport = document.getElementById('icon-support');

if (iconHymns) {
  iconHymns.className = `fas ${settings.icons.hymns} text-2xl`;
}
if (iconGifts) {
  iconGifts.className = `fas ${settings.icons.gifts} text-2xl`;
}
if (iconOther) {
  iconOther.className = `fas ${settings.icons.other} text-2xl`;
}
if (iconSupport) {
  iconSupport.className = `fas ${settings.icons.support} text-2xl`;
}

// Secret click handler to open login
let clickCount = 0;
let clickTimer: ReturnType<typeof setTimeout> | null = null;

if (appLogo) {
  appLogo.addEventListener('click', () => {
    if (clickTimer) {
      clearTimeout(clickTimer);
    }
    clickCount++;
    if (clickCount >= 10) {
      clickCount = 0;
      window.location.href = '/login.html';
    } else {
      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 1000);
    }
  });
}

// Service Worker PWA registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const isLocalhost = Boolean(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '[::1]' ||
      window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
    );

    if (window.location.protocol === 'https:' || isLocalhost) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('PWA: Service Worker registrado com sucesso:', registration.scope);
      }).catch(err => {
        if (err.message && err.message.includes('origin')) {
          console.warn('PWA: Service Worker não registrado (ambiente de desenvolvimento/sandbox).');
        } else {
          console.error('PWA: Falha ao registrar SW:', err);
        }
      });
    }
  });
}
