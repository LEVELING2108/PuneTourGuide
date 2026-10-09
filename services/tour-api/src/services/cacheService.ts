import Redis from 'ioredis';
import { env } from '../config/env';

const redisUrl = env.REDIS_URL;

// ── In-Memory Fallback Cache ──────────────────────────────
interface CacheEntry {
  data: any;
  expiresAt: number;
}
const memoryCache = new Map<string, CacheEntry>();

const cleanExpiredMemory = () => {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt <= now) {
      memoryCache.delete(key);
    }
  }
};
// Periodically prune expired entries every 60 seconds
setInterval(cleanExpiredMemory, 60000).unref();

let isRedisConnected = false;
let hasLoggedRedisNotice = false;

let redis: Redis | null = null;

try {
  // Tests share the developer's Redis; keep them on the in-memory cache instead
  if (env.isTest) throw new Error('memory cache in tests');
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false, // Never block or queue commands when offline
    lazyConnect: true,
    // Production keeps reconnecting with backoff; development gives up fast and uses memory.
    retryStrategy: (times) => (env.isProd ? Math.min(times * 200, 5000) : times > 2 ? null : 500),
  });

  redis.on('connect', () => {
    isRedisConnected = true;
    console.log('[Cache] Connected to Redis successfully.');
  });

  redis.on('ready', () => {
    isRedisConnected = true;
  });

  redis.on('close', () => {
    isRedisConnected = false;
  });

  redis.on('error', (err) => {
    isRedisConnected = false;
    if (!hasLoggedRedisNotice) {
      // Never print the URL: it can carry a password.
      const msg = `[Cache] Redis unavailable (${err.message}). Falling back to per-process memory.`;
      if (env.isProd) console.error(`${msg} Rate limits and cooldowns are NOT shared across instances until Redis is back.`);
      else console.warn(msg);
      hasLoggedRedisNotice = true;
    }
  });

  // Attempt initial non-blocking connection
  redis.connect().catch(() => {
    isRedisConnected = false;
  });
} catch {
  isRedisConnected = false;
}

export const getCachedData = async <T>(key: string): Promise<T | null> => {
  if (isRedisConnected && redis) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      // Fall through to memory cache
    }
  }

  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
};

export const setCachedData = async (key: string, data: any, ttlSeconds: number = 3600): Promise<void> => {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  memoryCache.set(key, { data, expiresAt });

  if (isRedisConnected && redis) {
    try {
      await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    } catch {
      // Memory cache is already updated
    }
  }
};

export const invalidateCache = async (pattern: string): Promise<void> => {
  // Convert glob-like pattern (e.g., 'places:*') to regex
  const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  for (const key of memoryCache.keys()) {
    if (regexPattern.test(key)) {
      memoryCache.delete(key);
    }
  }

  if (isRedisConnected && redis) {
    try {
      // SCAN, never KEYS: KEYS blocks Redis for every client while it walks the keyspace.
      let cursor = '0';
      do {
        const [next, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 200);
        cursor = next;
        if (keys.length > 0) await redis.unlink(...keys);
      } while (cursor !== '0');
    } catch {
      // Invalidation handled in memory
    }
  }
};

export const getCooldown = async (key: string): Promise<boolean> => {
  if (isRedisConnected && redis) {
    try {
      const val = await redis.get(key);
      return !!val;
    } catch {
      // Fall through to memory
    }
  }

  const entry = memoryCache.get(key);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return false;
  }
  return true;
};

export const setCooldown = async (key: string, ttlSeconds: number): Promise<void> => {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  memoryCache.set(key, { data: true, expiresAt });

  if (isRedisConnected && redis) {
    try {
      await redis.set(key, 'true', 'EX', ttlSeconds);
    } catch {
      // Saved in memory
    }
  }
};

/** The shared Redis connection when it is up, else null (callers fall back to memory). */
export const sharedRedis = (): Redis | null => (isRedisConnected && redis ? redis : null);

export const closeCache = async () => {
  if (redis) await redis.quit().catch(() => redis?.disconnect());
};

export default redis;
