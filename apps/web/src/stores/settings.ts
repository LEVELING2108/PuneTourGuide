import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LanguageId = string;

type SettingsState = {
  language: LanguageId;
  matchState: boolean;
  shakeToSos: boolean;
  smsWhenOffline: boolean;
  tripReminders: boolean;
  autoDownloadPacks: boolean;
  set: (patch: Partial<Omit<SettingsState, 'set'>>) => void;
};

/** Device-local preferences; synced to PATCH /users/me when logged in. */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      matchState: true,
      shakeToSos: true,
      smsWhenOffline: true,
      tripReminders: false,
      autoDownloadPacks: true,
      set: (patch) => set(patch),
    }),
    { name: 'pe_settings' }
  )
);
