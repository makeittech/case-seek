import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import { boot } from './app/boot';
import './ui/styles.css';

// PWA service worker (no-op in dev; auto-updates in production builds)
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => registerSW({ immediate: true }))
    .catch(() => {
      /* pwa plugin absent in some test environments */
    });
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root missing');

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

void boot().catch((err) => {
  console.error('boot failed', err);
});
