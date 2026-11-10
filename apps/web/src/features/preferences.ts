import { usersApi, type MePatch } from '../api/auth';
import i18n, { PRIMARY_LANGUAGES } from '../i18n';
import { useAuthStore } from '../stores/auth';
import { useSettingsStore } from '../stores/settings';
import { useThemeStore, type ThemeName } from '../stores/theme';

/** <html lang> follows the chosen language (screen readers, fonts); UI strings fall back to English. */
export function applyLanguage(lang: string) {
  document.documentElement.lang = lang;
  const ui = (PRIMARY_LANGUAGES as readonly string[]).includes(lang) ? lang : 'en';
  if (i18n.language !== ui) void i18n.changeLanguage(ui);
}

/**
 * Save preferences: applied on the device at once, then PATCH /users/me when logged in
 * (TECH_DESIGN §9.10). If the server refuses, the device goes back to what it had.
 */
export async function savePrefs(patch: MePatch) {
  const settings = useSettingsStore.getState();
  const before = {
    language: settings.language,
    shakeToSos: settings.shakeToSos,
    smsWhenOffline: settings.smsWhenOffline,
    tripReminders: settings.tripReminders,
    theme: useThemeStore.getState().theme,
  };
  const { theme, ...local } = patch;
  const settingsPatch = Object.fromEntries(Object.entries(local).filter(([k]) => k in before)) as Partial<typeof before>;
  if (Object.keys(settingsPatch).length) settings.set(settingsPatch);
  if (theme) useThemeStore.getState().setTheme(theme as ThemeName);

  const { user, setUser } = useAuthStore.getState();
  if (!user) return;
  try {
    setUser(await usersApi.update(patch));
  } catch (err) {
    settings.set({ language: before.language, shakeToSos: before.shakeToSos, smsWhenOffline: before.smsWhenOffline, tripReminders: before.tripReminders });
    if (theme) useThemeStore.getState().setTheme(before.theme);
    throw err;
  }
}

/** Keep <html lang> and i18n in step with the stored setting (also after rehydration). */
export function startLanguageSync() {
  applyLanguage(useSettingsStore.getState().language);
  useSettingsStore.subscribe((s, prev) => {
    if (s.language !== prev.language) applyLanguage(s.language);
  });
}
