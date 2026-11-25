import { describe, expect, it } from 'vitest';
import { isRain } from '../src/clients/weather';

describe('weather', () => {
  it('counts drizzle, rain, showers and thunderstorms as rain', () => {
    for (const code of [51, 61, 67, 80, 82, 95, 96, 99]) expect(isRain(code)).toBe(true);
  });

  it('does not count clear, cloud, fog or snow', () => {
    for (const code of [0, 3, 45, 48, 71, 77]) expect(isRain(code)).toBe(false);
  });
});
