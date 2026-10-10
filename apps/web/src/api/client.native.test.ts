import { absoluteApiUrl } from '../lib/native';

// Inside the Android app: secure storage instead of the refresh cookie
const store: { token: string | null } = { token: null };
vi.mock('../lib/native', async (orig) => ({
  ...(await orig<typeof import('../lib/native')>()),
  isNative: () => true,
  nativeRefresh: {
    get: vi.fn(async () => store.token),
    set: vi.fn(async (t: string) => {
      store.token = t;
    }),
    clear: vi.fn(async () => {
      store.token = null;
    }),
  },
}));

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('API client in the Android app', () => {
  beforeEach(() => {
    store.token = null;
    vi.resetModules();
  });

  it('keeps the refresh token in secure storage and out of app state', async () => {
    const fetchMock = vi.fn(async () => json(200, { data: { accessToken: 'a1', user: { id: 1 }, refreshToken: 'r'.repeat(43) } }));
    vi.stubGlobal('fetch', fetchMock);
    const { api } = await import('./client');
    const data = await api<Record<string, unknown>>('/auth/login', { body: { email: 'a@b.co', password: 'x' } });
    expect(store.token).toBe('r'.repeat(43));
    expect(data.refreshToken).toBeUndefined();
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>)['X-Client']).toBe('native');
  });

  it('sends the stored token to refresh, and forgets it when the server rejects it', async () => {
    store.token = 's'.repeat(43);
    const fetchMock = vi.fn(async () => json(401, { error: { code: 'REFRESH_INVALID', message: 'no' } }));
    vi.stubGlobal('fetch', fetchMock);
    const { refreshSession } = await import('./client');
    expect(await refreshSession()).toBe(false);
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ refreshToken: 's'.repeat(43) });
    expect(store.token).toBeNull();
  });

  it('keeps the token when the phone is just offline', async () => {
    store.token = 't'.repeat(43);
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('offline'))));
    const { refreshSession } = await import('./client');
    expect(await refreshSession()).toBe(false);
    expect(store.token).toBe('t'.repeat(43));
  });
});

describe('absoluteApiUrl', () => {
  it('puts the API origin in front of paths only when the API is on another origin', () => {
    expect(absoluteApiUrl('/api/v1/avatars/a.webp', 'https://pune.example/api/v1')).toBe('https://pune.example/api/v1/avatars/a.webp');
    expect(absoluteApiUrl('/api/v1/avatars/a.webp', '/api/v1')).toBe('/api/v1/avatars/a.webp');
    expect(absoluteApiUrl(null, 'https://pune.example/api/v1')).toBeNull();
  });
});
