import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { router } from './app/router';
import { queryClient } from './lib/queryClient';
import { useAuthStore } from './stores/auth';
import './i18n';
import { startLanguageSync } from './features/preferences';
import './styles/base.css';


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
