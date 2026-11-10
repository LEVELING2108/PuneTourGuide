import { Router } from 'express';
import { z } from 'zod';
import { handle, ok } from '../../lib/http';
import { googleReadLimit, visitLimit } from '../../middleware/limits';
import { maybeUserId, optionalAuth, requireAuth, userId } from '../../middleware/requireAuth';
import { idParam, input, validate } from '../../middleware/validate';
import { GOOGLE_ID, googleService, PHOTO_NAME } from './google.service';

const router = Router();

// Google content must not be stored: not by browsers, proxies or the app's offline cache
router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

const spotParam = z.object({ googleId: z.string().regex(GOOGLE_ID, 'Not a Google place id') });
const photoQuery = z.object({ name: z.string().regex(PHOTO_NAME, 'Not a Google photo'), w: z.coerce.number().int().min(80).max(1600).default(800) }).strict();

/** Rating, open now and a photo for one of our places. */
router.get(
  '/places/:id',
  optionalAuth,
  googleReadLimit,
  validate({ params: idParam }),
  handle(async (_req, res) => ok(res, await googleService.place(input<unknown, unknown, { id: number }>(res).params.id)))
);

/** Side quests + food near one of our places. */
router.get(
  '/places/:id/nearby',
  optionalAuth,
  googleReadLimit,
  validate({ params: idParam }),
  handle(async (_req, res) => ok(res, await googleService.nearby(input<unknown, unknown, { id: number }>(res).params.id, maybeUserId(res))))
);

/** A side quest's page. */
router.get(
  '/spots/:googleId',
  optionalAuth,
  googleReadLimit,
  validate({ params: spotParam }),
  handle(async (_req, res) => ok(res, await googleService.spot(input<unknown, unknown, { googleId: string }>(res).params.googleId, maybeUserId(res))))
);

/** "Been here?" on a side quest: +XP once. */
router.post(
  '/spots/:googleId/visit',
  requireAuth,
  visitLimit,
  validate({ params: spotParam }),
  handle(async (_req, res) => ok(res, await googleService.visitSpot(userId(res), input<unknown, unknown, { googleId: string }>(res).params.googleId)))
);

/** Photo: redirect to Google's short-lived image URL (the key stays here), or 404 when unavailable. */
router.get(
  '/photo',
  optionalAuth,
  googleReadLimit,
  validate({ query: photoQuery }),
  handle(async (_req, res) => {
    const { name, w } = input<unknown, { name: string; w: number }>(res).query;
    const url = await googleService.photoUrl(name, w);
    if (!url) return res.status(404).end();
    return res.redirect(302, url);
  })
);

export default router;
