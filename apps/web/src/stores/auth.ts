import { create } from 'zustand';
import { API_BASE, api, onSession, refreshSession, setAccessToken } from '../api/client';
import { absoluteApiUrl, isNative, nativeRefresh } from '../lib/native';
import { queryClient } from '../lib/queryClient';
import type { SessionResponse, User } from '../api/types';
import { useSettingsStore } from './settings';
import { useThemeStore } from './theme';

type AuthState = {
  user: User | null;
  /** false until the first refresh attempt on app start has finished */
  ready: boolean;
  setSession: (s: SessionResponse) => void;
  setUser: (u: User) => void;
  signOut: () => Promise<void>;
  /** Forget the session on this device without telling the server (it already ended it). */
  endLocalSession: () => Promise<void>;
  bootstrap: () => Promise<void>;
};

/** Paths from the API (profile photo) must point at the API's origin inside the Android app. */
const withUrls = (u: User): User => ({ ...u, avatarUrl: absoluteApiUrl(u.avatarUrl, API_BASE) });

/** Server values win on log-in (TECH_DESIGN §9.10). */
function adoptServerPrefs(u: User) {
  if (u.theme && u.theme !== useThemeStore.getState().theme) useThemeStore.getState().setTheme(u.theme);
  useSettingsStore.getState().set({
    language: u.language,
    shakeToSos: u.shakeToSos,
    smsWhenOffline: u.smsWhenOffline,
    tripReminders: u.tripReminders,
  });
}

/** Access token lives only in memory (client.ts); the refresh token is an httpOnly cookie. */
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  ready: false,
  setSession: (s) => {
    const prev = useAuthStore.getState().user;
    if (prev && prev.id !== s.user.id) queryClient.clear();
    setAccessToken(s.accessToken);
    adoptServerPrefs(s.user);
    set({ user: withUrls(s.user), ready: true });
  },
  setUser: (user) => set({ user: withUrls(user) }),
  signOut: async () => {
    try {
      await api('/auth/logout', { method: 'POST', body: {} });
    } catch {
      /* offline: still sign out locally */
    }
    await useAuthStore.getState().endLocalSession();
  },
  endLocalSession: async () => {
    if (isNative()) await nativeRefresh.clear();
    setAccessToken(null);
    set({ user: null });
    // Plans, contacts and medical info of this account must not stay in memory for the next person.
    // (The SOS contact copy and offline packs stay on the device on purpose: FEATURES, Sign out.)
    queryClient.clear();
  },
  bootstrap: async () => {
    // The server sets pe_session alongside the httpOnly refresh cookie; guests have neither.
    // In the Android app the token sits in secure storage instead.
    const maybeSignedIn = isNative() ? !!(await nativeRefresh.get()) : /(?:^|;\s*)pe_session=1/.test(document.cookie);
    if (maybeSignedIn) await refreshSession();
    set({ ready: true });
  },
}));

onSession((token, user) => {
  if (!token) {
    if (useAuthStore.getState().user) queryClient.clear();
    useAuthStore.setState({ user: null });
    return;
  }
  const u = user as User;
  const prev = useAuthStore.getState().user;
  if (prev && prev.id !== u.id) queryClient.clear();
  adoptServerPrefs(u);
  useAuthStore.setState({ user: withUrls(u) });
});

export const useUser = () => useAuthStore((s) => s.user);
export const useIsLoggedIn = () => useAuthStore((s) => !!s.user);
