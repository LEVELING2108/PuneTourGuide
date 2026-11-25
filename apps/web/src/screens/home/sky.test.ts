import { describe, expect, it } from 'vitest';
import { puneHour, skyAt } from './sky';

describe('Home sky', () => {
  it('follows the hour', () => {
    expect([4, 5, 6, 7, 12, 16, 17, 18, 19, 23, 0].map((h) => skyAt(h))).toEqual([
      'night', 'dawn', 'dawn', 'day', 'day', 'day', 'dusk', 'dusk', 'night', 'night', 'night',
    ]);
  });

  it('shows rain at any hour, and falls back to the clock without weather', () => {
    expect(skyAt(12, true)).toBe('rain');
    expect(skyAt(2, true)).toBe('rain');
    expect(skyAt(12, undefined)).toBe('day');
  });

  it("reads Pune's clock, whatever the phone's time zone", () => {
    expect(puneHour(new Date('2026-11-25T18:45:00Z'))).toBe(0);
    expect(puneHour(new Date('2026-11-25T01:00:00Z'))).toBe(6);
  });
});
