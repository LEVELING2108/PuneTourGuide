import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import { handle, ok } from '../../lib/http';
import { requireAuth, userId } from '../../middleware/requireAuth';
import { input, validate } from '../../middleware/validate';
import { BLOOD_GROUPS, medicalService, type MedicalInput } from './medical.service';

const router = Router();

const text = (max: number) => z.string().max(max).default('');
const putSchema = z
  .object({
    bloodGroup: z.enum(BLOOD_GROUPS).nullable(),
    allergies: text(300),
    medicines: text(300),
    notes: text(500),
    showOnLockScreen: z.boolean(),
  })
  .strict();

// Medical data must never sit in a browser, proxy or CDN cache.
const noStore = (_req: Request, res: Response, next: NextFunction) => {
  res.set('Cache-Control', 'no-store');
  next();
};

router.use(requireAuth, noStore);

router.get('/', handle(async (_req, res) => ok(res, await medicalService.get(userId(res)))));

router.put(
  '/',
  validate({ body: putSchema }),
  handle(async (_req, res) => ok(res, await medicalService.put(userId(res), input<MedicalInput>(res).body)))
);

router.delete('/', handle(async (_req, res) => ok(res, await medicalService.remove(userId(res)))));

export default router;
