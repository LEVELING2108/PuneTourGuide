import { useTheme, type ThemeName } from '../stores/theme';

/**
 * Colours the mockups compute in their screen logic (renderVals), per theme.
 * Static colours live in the views / themes.css; these are the state-dependent ones.
 */
const palettes = {
  classic: {
    ink: '#111614',
    onInk: '#F6F6F3',
    surface: '#FFFFFF',
    muted: '#5E6763',
    primary: '#0F4C42',
    chipBd: '#E1E4E0',
    trackOff: '#C9D0CC',
    ctaOff: '#93AFA8',
    boxBd: '#B9C1BD',
    ringOff: '1.5px solid #B9C1BD',
    line: '#E4E6E2',
    softBg: '#E8F0ED',
    softBd: '#B9D3CC',
    permOnBg: '#F1F6F4',
    segOff: '#DDE1DD',
    dotOff: '#C3CAC6',
    slideDotOff: '#B9C1BD',
    otpFilled: '#9AB5AE',
    otpShadow: '0 0 0 3px rgba(15,76,66,0.12)',
    primaryShadow: '0 18px 30px -20px rgba(15,76,66,0.6)',
    testBd: '#D5DAD6',
    addBd: '#D5DAD6',
    avatarPhoto: '#26303B',
    displayFont: "'Instrument Serif', serif",
    stopRingOff: '#9AA6A2',
    routeDone: '#9AA6A2',
    shield: '#26303B',
  },
  deccan: {
    ink: '#231C17',
    onInk: '#F3EADB',
    surface: '#FFFBF3',
    muted: '#6B5D50',
    primary: '#7A1F4E',
    chipBd: '#DCCDB6',
    trackOff: '#D3C3A8',
    ctaOff: '#B98DA3',
    boxBd: '#C9B79C',
    ringOff: '1.5px solid #C9B79C',
    line: '#E2D4BE',
    softBg: '#F5E6EE',
    softBd: '#E3B9CE',
    permOnBg: '#FAF0F4',
    segOff: '#DCCDB6',
    dotOff: '#CDBDA3',
    slideDotOff: '#CDBDA3',
    otpFilled: '#C79AB1',
    otpShadow: '0 0 0 3px rgba(122,31,78,0.12)',
    primaryShadow: '0 18px 30px -20px rgba(122,31,78,0.6)',
    testBd: '#D8C6A6',
    addBd: '#D8C6A6',
    avatarPhoto: '#0E5B5E',
    displayFont: "'DM Serif Display', serif",
    stopRingOff: '#CDB894',
    routeDone: '#B3A28A',
    shield: '#0E5B5E',
  },
} as const;

export type Palette = (typeof palettes)[ThemeName];

export const paletteFor = (theme: ThemeName): Palette => palettes[theme];

export const usePalette = () => paletteFor(useTheme());

/** Chip / segmented pill colours (selected = ink fill). */
export const chipColors = (p: Palette, on: boolean) => ({
  pressed: on ? 'true' : 'false',
  checked: on ? 'true' : 'false',
  bg: on ? p.ink : p.surface,
  fg: on ? p.onInk : p.ink,
  bd: on ? p.ink : p.chipBd,
});

/** iOS-style toggle (track colour + knob offset). */
export const toggleColors = (p: Palette, on: boolean) => ({
  pressed: on ? 'true' : 'false',
  track: on ? p.primary : p.trackOff,
  knob: on ? '24px' : '4px',
});
