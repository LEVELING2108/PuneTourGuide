// Optional: the Signboard tokens as a Tailwind theme extension (the app already uses Tailwind).
// Merge into apps/web/tailwind.config.ts under theme.extend ONLY if you build the landing page with
// Tailwind classes. The reference HTML uses plain CSS variables, which work either way.
export const signboard = {
  colors: {
    pe: {
      ink: '#111111',
      paper: '#FFFFFF',
      yellow: '#FFD400',
      hill: '#E0B800',
      accent: '#C8410F',
      'accent-hover': '#8F2D09',
      sos: '#C81E16',
      'sos-map': '#A51A13',
      text: '#222222',
      'text-2': '#444444',
      muted: '#555555',
      rule: '#D0D0D0',
      'route-before': '#8A8A8A',
      'on-ink-2': '#CFCFCF',
      led: '#FF8A1E',
      'led-bg': '#0A0A0A',
    },
  },
  fontFamily: {
    'pe-display': ['Khand', 'Anek Devanagari', 'sans-serif'],
    'pe-body': ['Anek Latin', 'Anek Devanagari', 'system-ui', 'sans-serif'],
  },
  boxShadow: {
    'pe-hard': '4px 4px 0 #111111',
    'pe-stub': '3px 3px 0 #111111',
    'pe-phone': '10px 10px 0 #FFD400',
    'pe-pati': '8px 8px 0 #111111',
  },
  borderRadius: { 'pe-btn': '6px', 'pe-phone': '36px' },
  maxWidth: { 'pe-page': '1240px' },
};
