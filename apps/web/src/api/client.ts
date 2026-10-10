/**
 * Fetch wrapper for the Tour API (/api/v1):
 * - adds the in-memory access token
 * - on 401 refreshes once via the httpOnly cookie, then retries
 * - unwraps { data, meta } and turns { error } into ApiError
 */

export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
  get isOffline() {
    return this.status === 0;
  }
}

let accessToken: string | null = null;
let refreshing: Promise<boolean> | null = null;
let onSessionChange: ((token: string | null, user: unknown) => void) | null = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};
/** The auth store subscribes so a refreshed session updates the user too. */
export const onSession = (fn: typeof onSessionChange) => {
  onSessionChange = fn;
};

type Options = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Skip the refresh-and-retry dance (used by refresh itself) */
  noRetry?: boolean;
  form?: FormData;
  /** Let the request finish even if the page navigates away (SOS while the dialer opens). */
  keepalive?: boolean;
  /** Send a file as the raw request body (its type becomes the Content-Type). */
  blob?: Blob;
};

const buildUrl = (path: string, query?: Options['query']) => {
  const qs = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const s = qs.toString();
  return `${API_BASE}${path}${s ? `?${s}` : ''}`;
};

async function raw<T>(path: string, opts: Options = {}): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const headers: Record<string, string> = { Accept: 'application/json', ...opts.headers };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.blob) headers['Content-Type'] = opts.blob.type || 'application/octet-stream';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), {
      method: opts.method ?? (opts.body !== undefined || opts.form || opts.blob ? 'POST' : 'GET'),
      headers,
      body: opts.blob ?? opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
      credentials: 'include',
      signal: opts.signal,
      keepalive: opts.keepalive,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new ApiError(0, 'OFFLINE', 'You seem to be offline');
  }

  if (res.status === 401 && !opts.noRetry && path !== '/auth/refresh') {
    if (await refreshSession()) return raw<T>(path, { ...opts, noRetry: true });
  }

  const json = res.status === 204 ? {} : await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = (json as { error?: { code?: string; message?: string; details?: unknown } }).error;
    throw new ApiError(res.status, e?.code ?? 'HTTP_' + res.status, e?.message ?? 'Something went wrong', e?.details);
  }
  return json as { data: T; meta?: Record<string, unknown> };
}

export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  return (await raw<T>(path, opts)).data;
}

export async function apiWithMeta<T, M = Record<string, unknown>>(path: string, opts: Options = {}) {
  const r = await raw<T>(path, opts);
  return { data: r.data, meta: (r.meta ?? {}) as M };
}

/** Exchange the refresh cookie for a new access token. Concurrent callers share one request. */
export function refreshSession(): Promise<boolean> {
  if (!refreshing) {
    refreshing = raw<{ accessToken: string; user: unknown }>('/auth/refresh', { method: 'POST', body: {}, noRetry: true })
      .then(({ data }) => {
        accessToken = data.accessToken;
        onSessionChange?.(data.accessToken, data.user);
        return true;
      })
      .catch(() => {
        accessToken = null;
        onSessionChange?.(null, null);
        return false;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}
