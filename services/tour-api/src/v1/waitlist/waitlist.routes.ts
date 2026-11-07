import { Router } from 'express';
import { z } from 'zod';
import { handle, ok } from '../../lib/http';
import { waitlistLimit } from '../../middleware/limits';
import { input, validate } from '../../middleware/validate';
import { waitlistService } from './waitlist.service';

const router = Router();

const joinSchema = z.object({ email: z.string().trim().max(254).email().toLowerCase() }).strict();

/** Landing-page Android waitlist (same origin, no login). */
router.post(
  '/',
  waitlistLimit,
  validate({ body: joinSchema }),
  handle(async (_req, res) => ok(res, await waitlistService.join(input<z.infer<typeof joinSchema>>(res).body.email), undefined, 201))
);

export default router;
