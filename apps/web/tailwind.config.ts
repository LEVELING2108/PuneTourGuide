import type { Config } from 'tailwindcss';

// Screens are ported 1:1 from design-reference with inline styles. Preflight stays off so the
// browser defaults the mockups were designed against are preserved.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        primary: 'var(--primary)',
        gold: 'var(--gold)',
        sos: 'var(--sos)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        accent: 'var(--font-accent)',
      },
    },
  },
} satisfies Config;
