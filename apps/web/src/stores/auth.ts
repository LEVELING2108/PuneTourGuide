import { create } from 'zustand';
import { api, onSession, refreshSession, setAccessToken } from '../api/client';
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
  bootstrap: () => Promise<void>;
};

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
    setAccessToken(s.accessToken);
    adoptServerPrefs(s.user);
    set({ user: s.user, ready: true });
  },
  setUser: (user) => set({ user }),
  signOut: async () => {
    try {
      await api('/auth/logout', { method: 'POST', body: {} });
    } catch {
      /* offline: still sign out locally */
    }
    setAccessToken(null);
    set({ user: null });
  },
  bootstrap: async () => {
    await refreshSession();
    set({ ready: true });
  },
}));

onSession((token, user) => {
  if (!token) {
    useAuthStore.setState({ user: null });
    return;
  }
  const u = user as User;
  adoptServerPrefs(u);
  useAuthStore.setState({ user: u });
});

export const useUser = () => useAuthStore((s) => s.user);
export const useIsLoggedIn = () => useAuthStore((s) => !!s.user);
