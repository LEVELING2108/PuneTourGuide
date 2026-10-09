import { Router } from 'express';
import { z } from 'zod';
import { geocode } from '../clients/nominatim';
import { puneWeather } from '../clients/weather';
import { handle, ok } from '../lib/http';
import { input, validate } from '../middleware/validate';
import { getCachedData, setCachedData } from '../services/cacheService';

/** Public helpers for the Home header and Explore search fallback. */
const router = Router();

router.get(
  '/weather',
  handle(async (_req, res) => {
    const key = 'tour:weather:pune';
    let w = await getCachedData<Awaited<ReturnType<typeof puneWeather>>>(key);
    if (!w) {
      try {
        w = await puneWeather();
        await setCachedData(key, w, 15 * 60);
      } catch {
        // Weather is decoration; never fail the Home screen over it
        return ok(res, null);
      }
    }
    return ok(res, w);
  })
);

router.get(
  '/geocode',
  validate({ query: z.object({ q: z.string().trim().min(2).max(80) }).strict() }),
  handle(async (_req, res) => {
    const { q } = input<unknown, { q: string }>(res).query;
    const key = `tour:geocode:${q.toLowerCase()}`;
    const cached = await getCachedData<{ hit: Awaited<ReturnType<typeof geocode>> }>(key);
    if (cached) return ok(res, cached.hit);
    let hit: Awaited<ReturnType<typeof geocode>> = null;
    try {
      hit = await geocode(q);
    } catch {
      return ok(res, null);
    }
    await setCachedData(key, { hit }, 24 * 3600);
    return ok(res, hit);
  })
);

export default router;
