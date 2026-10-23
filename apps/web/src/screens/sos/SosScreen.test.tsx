import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import SosScreen from './SosScreen';

vi.mock('../../api/safety', () => ({
  trackingApi: { create: vi.fn(async () => ({ session_id: 'sess-1', publish_token: 't' })), close: vi.fn() },
}));
vi.mock('../../api/sos', () => ({ sosApi: { alert: vi.fn(async () => ({ contactsAlerted: 0 })), cancel: vi.fn(async () => undefined) } }));
vi.mock('../../features/live', () => ({
  LivePublisher: class {
    start() {}
    stop() {}
  },
}));
vi.mock('../../features/contacts', () => ({
  useContacts: () => ({ data: undefined }),
  cachedContacts: () => [
    { name: 'Aai', phone: '+919876543210', isPrimary: true },
    { name: 'Rahul', phone: '+919876500000', isPrimary: false },
  ],
}));
vi.mock('../../features/location', () => ({ useCurrentPosition: () => ({ lat: 0, lng: 0, known: false }) }));
vi.mock('../../features/help', () => ({ useHelpNearby: () => ({ data: [] }), isMedical: () => true }));
vi.mock('../../features/permissions', () => ({
  getPosition: vi.fn(async () => ({ coords: { latitude: 18.5195, longitude: 73.8553, accuracy: 10 } })),
  rememberPosition: vi.fn(),
  lastPosition: () => ({ lat: 0, lng: 0, known: false }),
}));

let visibility: DocumentVisibilityState = 'visible';
const href = { value: '' };

beforeEach(() => {
  sessionStorage.clear();
  visibility = 'visible';
  href.value = '';
  vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility);
  vi.stubGlobal('location', {
    origin: 'https://puneexplorer.dev',
    get href() {
      return href.value;
    },
    set href(v: string) {
      href.value = v;
    },
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const setVisible = (v: DocumentVisibilityState) => {
  visibility = v;
  document.dispatchEvent(new Event('visibilitychange'));
};

describe('SOS texts from the phone', () => {
  it('dials 112, then on coming back opens the messaging app with every contact and the alert', async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/sos']}>
          <SosScreen />
        </MemoryRouter>
      </QueryClientProvider>
    );
    fireEvent.click(screen.getByRole('link', { name: /Call 112 now/ }));
    expect(href.value).toBe('tel:112');

    act(() => setVisible('hidden')); // the call screen
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    act(() => setVisible('visible'));

    expect(href.value.startsWith('sms:+919876543210,+919876500000?&body=')).toBe(true);
    const text = decodeURIComponent(href.value.slice(href.value.indexOf('body=') + 5));
    expect(text).toContain('SOS: I need help now.');
    expect(text).toContain('/track/sess-1');
    expect(text).toContain('Map: https://maps.google.com/?q=18.51950,73.85530');

    // Only once by itself; the button opens it again
    href.value = '';
    act(() => setVisible('hidden'));
    act(() => setVisible('visible'));
    expect(href.value).toBe('');
    fireEvent.click(screen.getByRole('link', { name: /Text my contacts/ }));
    expect(href.value.startsWith('sms:+919876543210,+919876500000')).toBe(true);
  });
});
