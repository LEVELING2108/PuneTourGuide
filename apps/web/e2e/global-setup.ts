import Redis from 'ioredis';

/**
 * Rate limits are shared through Redis (as in production), so repeated local runs would hit
 * the sign-up limit. Reset the counters on the dev Redis before the suite. Never point E2E at production.
 */
export default async function globalSetup() {
  const redis = new Redis(process.env.REDIS_URL ?? 'redis://127.0.0.1:6379', { lazyConnect: true, maxRetriesPerRequest: 1 });
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
