import express, { Router } from 'express';
import { avatarLimit } from '../../middleware/limits';
import { handle, ok } from '../../lib/http';
import { requireAuth, userId } from '../../middleware/requireAuth';
import { input, validate } from '../../middleware/validate';
import { updateMeSchema, type UpdateMeInput } from './users.schemas';
import { usersService } from './users.service';

const router = Router();

/** Public avatar bytes; the URL key is random and changes on every upload. */
export const avatarRouter = Router();
avatarRouter.get(
  '/:key.webp',
  handle(async (req, res) => {
    const key = String(req.params.key);
    const a = /^[A-Za-z0-9_-]{20,40}$/.test(key) ? await usersService.avatar(key) : null;
    if (!a) return res.status(404).end();
    res.set({ 'Content-Type': a.mime, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' });
    return res.send(Buffer.from(a.data));
  })
);

router.use(requireAuth);

router.get('/me', handle(async (_req, res) => ok(res, await usersService.me(userId(res)))));

router.patch(
  '/me',
  validate({ body: updateMeSchema }),
  handle(async (_req, res) => ok(res, await usersService.updateMe(userId(res), input<UpdateMeInput>(res).body)))
);

// Raw image body (no multipart parser needed): Content-Type image/*, up to 5 MB
router.post(
  '/me/avatar',
  avatarLimit,
  express.raw({ type: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/avif'], limit: '5mb' }),
  handle(async (req, res) => {
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(415).json({ error: { code: 'IMAGE_REQUIRED', message: 'Upload a JPEG, PNG, WebP or HEIC photo up to 5 MB' } });
    }
    return ok(res, await usersService.setAvatar(userId(res), req.body));
  })
);

router.delete('/me/avatar', handle(async (_req, res) => ok(res, await usersService.removeAvatar(userId(res)))));

router.get('/me/stamps', handle(async (_req, res) => ok(res, await usersService.stamps(userId(res)))));

router.get('/me/stats', handle(async (_req, res) => ok(res, await usersService.stats(userId(res)))));

export default router;
