import { z } from 'zod';

export const INTERESTS = ['Heritage', 'Treks', 'Temples', 'Food', 'Museums', 'Nature'] as const;

/** en, mr, hi, gu first (TECH_DESIGN §9.10), then the other Indian languages from RoadSoS. */
export const LANGUAGES = [
  'en', 'mr', 'hi', 'gu', 'as', 'bn', 'brx', 'doi', 'kn', 'ks', 'kok', 'mai', 'ml', 'mni', 'ne', 'or', 'pa', 'sa', 'sat', 'sd', 'ta', 'te', 'ur',
] as const;

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(1).max(60),
    email: z.string().trim().toLowerCase().email().max(254).nullable(),
    interests: z.array(z.enum(INTERESTS)).max(INTERESTS.length),
    language: z.enum(LANGUAGES),
    theme: z.enum(['classic', 'deccan']),
    shakeToSos: z.boolean(),
    smsWhenOffline: z.boolean(),
    tripReminders: z.boolean(),
  })
  .partial()
  .strict();

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
