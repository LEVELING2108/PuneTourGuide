import { describe, expect, it } from 'vitest';
import { chipColors, paletteFor, toggleColors } from './palette';

describe('palette', () => {
  it('uses ink for a selected Classic chip', () => {
    expect(chipColors(paletteFor('classic'), true)).toMatchObject({ bg: '#111614', fg: '#F6F6F3', pressed: 'true' });
  });

  it('uses Deccan colours when the theme is Deccan', () => {
    expect(chipColors(paletteFor('deccan'), false)).toMatchObject({ bg: '#FFFBF3', bd: '#DCCDB6', pressed: 'false' });
  });

  it('moves the toggle knob right when on', () => {
    expect(toggleColors(paletteFor('classic'), true)).toEqual({ pressed: 'true', track: '#0F4C42', knob: '24px' });
    expect(toggleColors(paletteFor('deccan'), false).knob).toBe('4px');
  });
});
