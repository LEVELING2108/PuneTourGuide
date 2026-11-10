import { z } from 'zod';

export const CATEGORIES = ['Heritage', 'Temple', 'Fort', 'Museum', 'Nature', 'Food'] as const;

const bool = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1')
  .optional();

const latLng = z
  .string()
  .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, 'Use near=lat,lng')
  .transform((s) => {
    const [lat, lng] = s.split(',').map(Number);
    return { lat, lng };
  })
  .refine((p) => Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180, 'Out of range');

const list = <T extends z.ZodTypeAny>(item: T) =>
  z
    .string()
    .transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean))
    .pipe(z.array(item).max(10));

/** GET /places and /places/count (TECH_DESIGN §7). */
export const placeQuerySchema = z
  .object({
    q: z.string().trim().max(80).optional(),
    category: list(z.enum(CATEGORIES)).optional(),
    kind: list(z.string().max(30)).optional(),
    near: latLng.optional(),
    radiusKm: z.coerce.number().positive().max(200).optional(),
    openNow: bool,
    free: bool,
    accessible: bool,
    helpWithinKm: z.coerce.number().positive().max(50).optional(),
    saved: bool,
    cursor: z.coerce.number().int().min(0).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export type PlaceQuery = z.infer<typeof placeQuerySchema>;
