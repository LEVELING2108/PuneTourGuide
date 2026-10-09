import { z } from 'zod';

export const INTERESTS = ['Heritage', 'Treks', 'Temples', 'Food', 'Museums', 'Nature'] as const;

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(1).max(60),
    email: z.string().trim().toLowerCase().email().max(254).nullable(),
    interests: z.array(z.enum(INTERESTS)).max(INTERESTS.length),
    language: z.string().min(2).max(5),
    theme: z.enum(['classic', 'deccan']),
    shakeToSos: z.boolean(),
    smsWhenOffline: z.boolean(),
    tripReminders: z.boolean(),
  })
  .partial()
  .strict();

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
