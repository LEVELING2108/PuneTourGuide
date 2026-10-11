import { Router } from 'express';
import { handle, ok } from '../lib/http';
import { getCachedData, setCachedData } from '../services/cacheService';
import { itineraryService } from './itinerary/itinerary.service';

/** GET /routes: curated route tickets for Explore (public). */
const router = Router();

router.get(
  '/',
  handle(async (_req, res) => {
    const key = 'tour:routes:v1';
    let routes = await getCachedData<Awaited<ReturnType<typeof itineraryService.routes>>>(key);
    if (!routes) {
      routes = await itineraryService.routes();
      await setCachedData(key, routes, 600);
    }
    return ok(res, routes);
  })
);

export default router;
