import { describe, expect, it } from 'vitest';
import { parseCaps, puneDay, takeGoogleBudget } from '../src/lib/googleBudget';
import { env } from '../src/config/env';

describe('google daily budget', () => {
  it('allows calls up to the cap for the Pune day, then refuses until the next day', async () => {
    const cap = parseCaps(env.GOOGLE_DAILY_CAPS).nearby;
    // A day far away so this never touches today's real count
    const day = new Date(Date.UTC(2099, 0, 1, 6) + Math.floor(Math.random() * 1e6) * 86_400_000);
    for (let i = 0; i < cap; i++) expect(await takeGoogleBudget('nearby', day)).toBe(true);
    expect(await takeGoogleBudget('nearby', day)).toBe(false);
    expect(await takeGoogleBudget('nearby', new Date(day.getTime() + 86_400_000))).toBe(true);
  });

  it('counts days in Pune time', () => {
    expect(puneDay(new Date('2026-10-20T19:00:00Z'))).toBe('2026-10-21');
  });
});
