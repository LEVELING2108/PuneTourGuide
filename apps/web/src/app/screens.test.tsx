import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { useThemeStore } from '../stores/theme';
import { router } from './router';

const ROUTES = [
  '/', '/explore', '/explore/filters', '/map', '/directions', '/plan', '/place/1', '/sos', '/profile', '/settings',
  '/settings/profile', '/settings/contacts', '/settings/contacts/new', '/settings/contacts/1', '/settings/medical',
  '/settings/offline', '/settings/language', '/settings/theme', '/settings/sign-out', '/welcome', '/intro',
  '/permissions', '/login', '/signup', '/otp', '/almost-there', '/first-contact', '/forgot',
];

describe.each(['classic', 'deccan'] as const)('every screen renders (%s)', (theme) => {
  it.each(ROUTES)('%s', async (path) => {
    localStorage.setItem('pe_onboarded', '1');
    useThemeStore.getState().setTheme(theme);
    const memory = createMemoryRouter(router.routes, { initialEntries: [path] });
    const { findAllByText, container } = render(
      <QueryClientProvider client={new QueryClient()}>
        <RouterProvider router={memory} />
      </QueryClientProvider>
    );
    // Lazy screens resolve, then the themed view root appears
    await findAllByText(/./, {}, { timeout: 4000 });
    await expect.poll(() => container.querySelector(`.scr[class*="scr-${theme}-"]`)).not.toBeNull();
  });
});
