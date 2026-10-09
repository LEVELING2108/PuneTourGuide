import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type PermissionState = {
  location: boolean;
  motion: boolean;
  setLocation: (v: boolean) => void;
  setMotion: (v: boolean) => void;
};

/** Safety permissions the user granted (pe_perm_* in FEATURES.md). */
export const usePermissionStore = create<PermissionState>()(
  persist(
    (set) => ({
      location: false,
      motion: false,
      setLocation: (location) => set({ location }),
      setMotion: (motion) => set({ motion }),
    }),
    { name: 'pe_perm' }
  )
);

export const useSafetyReady = () => usePermissionStore((s) => s.location && s.motion);
