import { Router } from 'express';
import { z } from 'zod';
import { handle, ok } from '../../lib/http';
import { input, validate } from '../../middleware/validate';
import { helpService } from './help.service';

const router = Router();

const helpQuery = z
  .object({
    near: z
      .string()
      .regex(/^-?\d{1,2}(\.\d+)?,-?\d{1,3}(\.\d+)?$/, 'Use lat,lng')
      .transform((s) => s.split(',').map(Number) as [number, number]),
    radiusKm: z.coerce.number().min(0.5).max(25).default(5),
    limit: z.coerce.number().int().min(1).max(50).default(30),
  })
  .strict();

/** GET /help?near=lat,lng[&radiusKm=5][&limit=30]: public, works logged out (FEATURES: Help works logged-out). */
router.get(
  '/',
  validate({ query: helpQuery }),
  handle(async (_req, res) => {
    const { near, radiusKm, limit } = input<unknown, z.infer<typeof helpQuery>>(res).query;
    return ok(res, await helpService.near(near[0], near[1], radiusKm, limit));
  })
);

export default router;
