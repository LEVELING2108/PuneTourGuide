import { Router } from 'express';
import { z } from 'zod';
import { handle, ok } from '../../lib/http';
import { contactsWriteLimit, testAlertLimit } from '../../middleware/limits';
import { requireAuth, userId } from '../../middleware/requireAuth';
import { idParam, input, validate } from '../../middleware/validate';
import { contactsService } from './contacts.service';

const router = Router();

const RELATIONS = ['Parent', 'Mother', 'Father', 'Partner', 'Spouse', 'Sibling', 'Child', 'Friend', 'Relative', 'Colleague', 'Other'] as const;
const name = z.string().trim().min(1, 'Enter a name').max(60);
const relation = z.enum(RELATIONS);
const phone = z.string().trim().min(6).max(20);

const createSchema = z.object({ name, relation, phone, isPrimary: z.boolean().optional() }).strict();
const updateSchema = z
  .object({ name: name.optional(), relation: relation.optional(), phone: phone.optional(), isPrimary: z.boolean().optional() })
  .strict()
  .refine((b) => Object.keys(b).length > 0, 'Nothing to change');

router.use(requireAuth);

router.get('/', handle(async (_req, res) => ok(res, await contactsService.list(userId(res)))));

router.post(
  '/',
  contactsWriteLimit,
  validate({ body: createSchema }),
  handle(async (_req, res) => ok(res, await contactsService.create(userId(res), input<z.infer<typeof createSchema>>(res).body), undefined, 201))
);

router.post('/test-alert', testAlertLimit, handle(async (_req, res) => ok(res, await contactsService.testAlert(userId(res)))));

router.patch(
  '/:id',
  contactsWriteLimit,
  validate({ params: idParam, body: updateSchema }),
  handle(async (_req, res) => {
    const { params, body } = input<z.infer<typeof updateSchema>, unknown, { id: number }>(res);
    return ok(res, await contactsService.update(userId(res), params.id, body));
  })
);

router.delete(
  '/:id',
  contactsWriteLimit,
  validate({ params: idParam }),
  handle(async (_req, res) => ok(res, await contactsService.remove(userId(res), input<unknown, unknown, { id: number }>(res).params.id)))
);

export default router;
