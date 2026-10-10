import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { router } from './app/router';
import { queryClient } from './lib/queryClient';
import { useAuthStore } from './stores/auth';
import './i18n';
import { startLanguageSync } from './features/preferences';
import './styles/fonts';
import './styles/base.css';
import { initMonitoring } from './lib/monitoring';

initMonitoring();

// Keyboard vs touch, for focus rings that only keyboard users need (base.css)
const root = document.documentElement;
window.addEventListener('keydown', (e) => e.key === 'Tab' && (root.dataset.input = 'keyboard'), true);
window.addEventListener('pointerdown', () => (root.dataset.input = 'pointer'), true);
startLanguageSync();

// Offline support (production builds only; the dev server never registers it)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => undefined);
  });
}

// Restore the session from the refresh cookie (no tokens in localStorage)
void useAuthStore.getState().bootstrap();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
