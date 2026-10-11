import { Capacitor } from '@capacitor/core';

/**
 * The Android app (Capacitor) runs this same web build from https://localhost, so:
 * - API calls go to an absolute VITE_API_BASE_URL (set in .env.android),
 * - the refresh token can't be a cookie: it lives in the Android Keystore via secure storage
 *   (security rule: the refresh token lives in secure storage on Android), never in localStorage,
 * - URLs the API returns as paths (profile photos) need the API's origin in front.
 */
export const isNative = () => Capacitor.isNativePlatform();

const KEY = 'pe_refresh';

// Loaded only inside the app, so the web bundle never carries the plugin. Wrapped in an object:
// a Capacitor plugin proxy must never be a promise's result (await probes it for .then and it throws).
const storage = () => import('@aparajita/capacitor-secure-storage').then((m) => ({ plugin: m.SecureStorage }));

export const nativeRefresh = {
  async get(): Promise<string | null> {
    try {
      const v = await (await storage()).plugin.get(KEY);
      return typeof v === 'string' ? v : null;
    } catch {
      return null;
    }
  },
  async set(token: string) {
    await (await storage()).plugin.set(KEY, token);
  },
  async clear() {
    try {
      await (await storage()).plugin.remove(KEY);
    } catch {
      /* nothing stored */
    }
  },
};

/** "/api/v1/avatars/x.webp" → "https://your-domain/api/v1/avatars/x.webp" when the API is on another origin. */
export function absoluteApiUrl(pathOrUrl: string | null, apiBase: string): string | null {
  if (!pathOrUrl || !pathOrUrl.startsWith('/') || !/^https?:\/\//.test(apiBase)) return pathOrUrl;
  return new URL(pathOrUrl, apiBase).toString();
}
