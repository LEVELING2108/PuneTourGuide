import { Router } from 'express';
import { z } from 'zod';
import { handle, ok } from '../../lib/http';
import { optimiseLimit } from '../../middleware/limits';
import { requireAuth, userId } from '../../middleware/requireAuth';
import { idParam, input, validate } from '../../middleware/validate';
import { itineraryService } from './itinerary.service';

const router = Router();

const time = z.string().regex(/^\d{1,2}:\d{2} (AM|PM)$/, 'Use a time like 9:30 AM');

const addStopSchema = z
  .object({ placeId: z.number().int().positive(), dayId: z.number().int().positive().optional(), time: time.optional() })
  .strict();

const patchStopSchema = z
  .object({ done: z.boolean().optional(), time: time.optional(), dayId: z.number().int().positive().optional() })
  .strict()
  .refine((b) => b.done !== undefined || b.time !== undefined || b.dayId !== undefined, 'Nothing to change');

const optimiseSchema = z.object({ dayId: z.number().int().positive().optional() }).strict();

const fromRouteSchema = z.object({ dayId: z.number().int().positive().optional() }).strict();

router.use(requireAuth);

router.get('/', handle(async (_req, res) => ok(res, await itineraryService.plan(userId(res)))));

router.post(
  '/stops',
  validate({ body: addStopSchema }),
  handle(async (_req, res) => ok(res, await itineraryService.addStop(userId(res), input(res).body), undefined, 201))
);

router.patch(
  '/stops/:id',
  validate({ params: idParam, body: patchStopSchema }),
  handle(async (_req, res) => {
    const { params, body } = input<{ done?: boolean; time?: string; dayId?: number }, unknown, { id: number }>(res);
    return ok(res, await itineraryService.updateStop(userId(res), params.id, body));
  })
);

router.delete(
  '/stops/:id',
  validate({ params: idParam }),
  handle(async (_req, res) => ok(res, await itineraryService.removeStop(userId(res), input<unknown, unknown, { id: number }>(res).params.id)))
);

router.post(
  '/optimize',
  optimiseLimit,
  validate({ body: optimiseSchema }),
  handle(async (_req, res) => ok(res, await itineraryService.optimize(userId(res), input<{ dayId?: number }>(res).body.dayId)))
);

router.post(
  '/from-route/:id',
  validate({ params: idParam, body: fromRouteSchema }),
  handle(async (_req, res) => {
    const { params, body } = input<{ dayId?: number }, unknown, { id: number }>(res);
    return ok(res, await itineraryService.fromRoute(userId(res), params.id, body.dayId), undefined, 201);
  })
);

export default router;
