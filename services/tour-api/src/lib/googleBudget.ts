import { env } from '../config/env';
import { sharedRedis } from '../services/cacheService';

/**
 * Daily caps on paid Google Maps Platform calls. Google's own quotas can't be lowered on this
 * account, so every server call takes a unit here first. Counted in Redis (shared by all
 * instances) per Pune day; if Redis is down, each instance counts in memory instead.
 */
export type GoogleKind = 'details' | 'nearby' | 'photo' | 'thumb';

export function parseCaps(spec: string): Record<GoogleKind, number> {
  const caps: Record<GoogleKind, number> = { details: 0, nearby: 0, photo: 0, thumb: 0 };
  for (const part of spec.split(',')) {
    const [k, v] = part.split('=').map((x) => x.trim());
    if (k in caps && /^\d+$/.test(v ?? '')) caps[k as GoogleKind] = Number(v);
  }
  return caps;
}

const caps = parseCaps(env.GOOGLE_DAILY_CAPS);

/** Widths up to this are row thumbnails; wider ones are the big photo at the top of a page. */
export const THUMB_MAX_W = 480;

/**
 * Thumbnails take their own share ("thumb") so a long scroll through side quests can never use up
 * the main photos. With no thumb share set (thumb=0 or left out), they count against "photo".
 */
export const photoKind = (width: number, c = caps): GoogleKind => (width <= THUMB_MAX_W && c.thumb > 0 ? 'thumb' : 'photo');

/** "2026-10-21" in Pune time. */
export const puneDay = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);

const memory = new Map<string, number>();

/** Take one unit of today's budget; false when the cap is reached (the caller skips Google). */
export async function takeGoogleBudget(kind: GoogleKind, now = new Date()): Promise<boolean> {
  const cap = caps[kind];
  if (cap <= 0) return false;
  const key = `tour:google:cap:${kind}:${puneDay(now)}`;
  const redis = sharedRedis();
  if (redis) {
    try {
      const [[, used]] = (await redis.multi().incr(key).expire(key, 2 * 24 * 3600).exec()) as [[null, number], unknown];
      return used <= cap;
    } catch {
      // Fall back to this instance's count
    }
  }
  const used = (memory.get(key) ?? 0) + 1;
  memory.set(key, used);
  return used <= cap;
}

/** Test helper: forget in-memory counts. */
export const resetGoogleBudgetMemory = () => memory.clear();
