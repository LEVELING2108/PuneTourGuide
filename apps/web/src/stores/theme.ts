import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeName = 'classic' | 'deccan';

type ThemeState = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

export const applyThemeToDocument = (theme: ThemeName) => {
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', theme === 'deccan' ? '#7A1F4E' : '#0F4C42');
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'classic',
      setTheme: (theme) => {
        applyThemeToDocument(theme);
        set({ theme });
      },
    }),
    {
      name: 'pe_theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeToDocument(state.theme);
      },
    }
  )
);

export const useTheme = () => useThemeStore((s) => s.theme);
