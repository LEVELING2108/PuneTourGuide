import { Router } from 'express';
import { z } from 'zod';
import { handle, ok } from '../../lib/http';
import { routingLimit } from '../../middleware/limits';
import { input, validate } from '../../middleware/validate';
import { routingService } from './routing.service';

const router = Router();

// India only: the routing quota is ours, and the app is for Pune.
const point = z
  .string()
  .regex(/^-?\d{1,2}(\.\d+)?,-?\d{1,3}(\.\d+)?$/, 'Use lat,lng')
  .transform((s) => {
    const [lat, lng] = s.split(',').map(Number);
    return { lat, lng };
  })
  .refine((p) => p.lat >= 6 && p.lat <= 37 && p.lng >= 68 && p.lng <= 98, 'Point must be in India');

const directionsQuery = z
  .object({
    from: point,
    to: point,
    via: z
      .string()
      .max(400)
      .optional()
      .transform((s) => (s ? s.split(';') : []))
      .pipe(z.array(point).max(10)),
    mode: z.enum(['walk', 'auto']).default('walk'),
  })
  .strict();

/** GET /directions?from=lat,lng&to=lat,lng[&via=lat,lng;lat,lng][&mode=walk|auto]: OSRM proxy with caching. */
router.get(
  '/directions',
  routingLimit,
  validate({ query: directionsQuery }),
  handle(async (_req, res) => {
    const q = input<unknown, z.infer<typeof directionsQuery>>(res).query;
    return ok(res, await routingService.directions([q.from, ...q.via, q.to], q.mode === 'walk' ? 'foot' : 'car'));
  })
);

export default router;
