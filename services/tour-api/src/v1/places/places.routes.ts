import { Router } from 'express';
import { z } from 'zod';
import { handle, ok } from '../../lib/http';
import { visitLimit } from '../../middleware/limits';
import { maybeUserId, optionalAuth, requireAuth, userId } from '../../middleware/requireAuth';
import { idParam, input, validate } from '../../middleware/validate';
import { placeQuerySchema, type PlaceQuery } from './places.schemas';
import { placesService } from './places.service';

const router = Router();

router.get(
  '/',
  optionalAuth,
  validate({ query: placeQuerySchema }),
  handle(async (_req, res) => {
    const q = input<unknown, PlaceQuery>(res).query;
    const { items, nextCursor } = await placesService.list(q, maybeUserId(res));
    return ok(res, items, { nextCursor });
  })
);

/** Filters sheet: "Show N places". */
router.get(
  '/count',
  optionalAuth,
  validate({ query: placeQuerySchema }),
  handle(async (_req, res) => ok(res, { count: await placesService.count(input<unknown, PlaceQuery>(res).query, maybeUserId(res)) }))
);

/** Home collections ("12 places"). */
router.get('/categories', handle(async (_req, res) => ok(res, await placesService.categoryCounts())));

const detailQuery = z
  .object({ near: placeQuerySchema.shape.near })
  .strict();

router.get(
  '/:id',
  optionalAuth,
  validate({ params: idParam, query: detailQuery }),
  handle(async (_req, res) => {
    const { params, query } = input<unknown, { near?: { lat: number; lng: number } }, { id: number }>(res);
    return ok(res, await placesService.detail(params.id, maybeUserId(res), query.near));
  })
);

/** "Also nearby" + "Food nearby" on the Place screen. */
router.get(
  '/:id/nearby',
  optionalAuth,
  validate({ params: idParam }),
  handle(async (_req, res) => ok(res, await placesService.nearby(input<unknown, unknown, { id: number }>(res).params.id, maybeUserId(res))))
);

/** "Mark as visited": stamp + XP once per place; ticks it in the plan too. */
router.post(
  '/:id/visit',
  requireAuth,
  visitLimit,
  validate({ params: idParam }),
  handle(async (_req, res) => ok(res, await placesService.visit(userId(res), input<unknown, unknown, { id: number }>(res).params.id)))
);

router.put(
  '/:id/save',
  requireAuth,
  validate({ params: idParam }),
  handle(async (_req, res) => ok(res, await placesService.setSaved(userId(res), input<unknown, unknown, { id: number }>(res).params.id, true)))
);

router.delete(
  '/:id/save',
  requireAuth,
  validate({ params: idParam }),
  handle(async (_req, res) => ok(res, await placesService.setSaved(userId(res), input<unknown, unknown, { id: number }>(res).params.id, false)))
);

export default router;
