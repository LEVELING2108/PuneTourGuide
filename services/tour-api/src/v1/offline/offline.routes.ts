import { Router } from 'express';
import { z } from 'zod';
import { handle, ok } from '../../lib/http';
import { maybeUserId, optionalAuth } from '../../middleware/requireAuth';
import { input, validate } from '../../middleware/validate';
import { offlineService } from './offline.service';

const router = Router();

/** GET /offline-packs: public; logged-in users also see which packs cover their plan. */
router.get('/', optionalAuth, handle(async (_req, res) => ok(res, await offlineService.list(maybeUserId(res)))));

/** GET /offline-packs/:id: the JSON bundle (places, help points, numbers, tile list). */
router.get(
  '/:id',
  validate({ params: z.object({ id: z.string().regex(/^[a-z0-9-]{2,40}$/) }) }),
  handle(async (_req, res) => {
    res.set('Cache-Control', 'public, max-age=600');
    return ok(res, await offlineService.bundle(input<unknown, unknown, { id: string }>(res).params.id));
  })
);

export default router;
