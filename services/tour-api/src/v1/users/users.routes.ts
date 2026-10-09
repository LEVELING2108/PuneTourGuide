import { Router } from 'express';
import { handle, ok } from '../../lib/http';
import { requireAuth, userId } from '../../middleware/requireAuth';
import { input, validate } from '../../middleware/validate';
import { updateMeSchema, type UpdateMeInput } from './users.schemas';
import { usersService } from './users.service';

const router = Router();

router.use(requireAuth);

router.get('/me', handle(async (_req, res) => ok(res, await usersService.me(userId(res)))));

router.patch(
  '/me',
  validate({ body: updateMeSchema }),
  handle(async (_req, res) => ok(res, await usersService.updateMe(userId(res), input<UpdateMeInput>(res).body)))
);

router.get('/me/stats', handle(async (_req, res) => ok(res, await usersService.stats(userId(res)))));

export default router;
