import { Router } from 'express';
import { z } from 'zod';
import { badRequest } from '../../lib/errors';
import { handle, ok } from '../../lib/http';
import { sosLimit, tripShareLimit } from '../../middleware/limits';
import { maybeUserId, optionalAuth, requireAuth, userId } from '../../middleware/requireAuth';
import { input, validate } from '../../middleware/validate';
import { sosService } from './sos.service';

const router = Router();

const uuid = z.string().uuid();
const alertSchema = z
  .object({
    sessionId: uuid,
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    accuracy: z.number().min(0).max(100000).optional(),
  })
  .strict()
  .refine((b) => (b.lat === undefined) === (b.lng === undefined), 'Send both lat and lng, or neither');
const cancelSchema = z.object({}).strict();
// text: false = the app hands the link over from the phone itself (no server texts, no contacts needed)
const tripSchema = z.object({ sessionId: uuid, text: z.boolean().default(true) }).strict();

/** Idempotency-Key header (a UUID the phone generates once per SOS). */
const idemKey = (h: string | undefined) => {
  const parsed = uuid.safeParse(h);
  if (!parsed.success) throw badRequest('IDEMPOTENCY_KEY_REQUIRED', 'Send an Idempotency-Key header (UUID)');
  return parsed.data;
};

// SOS works logged out: auth is optional, the key ties retries and the cancel to this phone.
router.post(
  '/sos/alert',
  optionalAuth,
  sosLimit,
  validate({ body: alertSchema }),
  handle(async (req, res) => {
    const { sessionId, lat, lng } = input<z.infer<typeof alertSchema>>(res).body;
    const r = await sosService.alert(maybeUserId(res), { idempotencyKey: idemKey(req.get('Idempotency-Key')), sessionId, lat, lng });
    return ok(res, r, undefined, r.repeated ? 200 : 201);
  })
);

router.post(
  '/sos/cancel',
  optionalAuth,
  sosLimit,
  validate({ body: cancelSchema }),
  handle(async (req, res) => ok(res, await sosService.cancel(maybeUserId(res), idemKey(req.get('Idempotency-Key')))))
);

router.get('/share-trip', requireAuth, handle(async (_req, res) => ok(res, await sosService.activeTrip(userId(res)))));

router.post(
  '/share-trip',
  requireAuth,
  tripShareLimit,
  validate({ body: tripSchema }),
  handle(async (_req, res) => {
    const { sessionId, text } = input<z.infer<typeof tripSchema>>(res).body;
    return ok(res, await sosService.startTrip(userId(res), sessionId, text), undefined, 201);
  })
);

router.get(
  '/share-trip/:sessionId/delivery',
  requireAuth,
  validate({ params: z.object({ sessionId: uuid }) }),
  handle(async (_req, res) => ok(res, await sosService.tripDelivery(userId(res), input<unknown, unknown, { sessionId: string }>(res).params.sessionId)))
);

router.delete(
  '/share-trip/:sessionId',
  requireAuth,
  validate({ params: z.object({ sessionId: uuid }) }),
  handle(async (_req, res) => ok(res, await sosService.stopTrip(userId(res), input<unknown, unknown, { sessionId: string }>(res).params.sessionId)))
);

export default router;
