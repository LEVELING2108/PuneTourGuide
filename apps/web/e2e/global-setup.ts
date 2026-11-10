import { readFileSync } from 'fs';
import Redis from 'ioredis';

/** The Redis the dev API uses (services/tour-api/.env), else the docker-compose one. */
function devRedisUrl() {
  if (process.env.REDIS_URL) return process.env.REDIS_URL;
  try {
    const env = readFileSync(new URL('../../../services/tour-api/.env', import.meta.url), 'utf8');
    return env.match(/^REDIS_URL="?([^"\r\n]+)/m)?.[1] ?? 'redis://127.0.0.1:6390';
  } catch {
    return 'redis://127.0.0.1:6390';
  }
}

/**
 * Rate limits are shared through Redis (as in production), so repeated local runs would hit
 * the sign-up limit. Reset the counters on the dev Redis before the suite. Never point E2E at production.
 */
export default async function globalSetup() {
  const redis = new Redis(devRedisUrl(), { lazyConnect: true, maxRetriesPerRequest: 1 });
  try {
    await redis.connect();
    let cursor = '0';
    do {
      const [next, keys] = await redis.scan(cursor, 'MATCH', 'tour:rl:*', 'COUNT', 500);
      cursor = next;
      if (keys.length) await redis.unlink(...keys);
    } while (cursor !== '0');
  } catch {
    // No Redis: the API counts in memory and a restart resets it.
  } finally {
    redis.disconnect();
  }
}
