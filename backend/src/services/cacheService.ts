import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

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
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false, // Never block or queue commands when offline
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 2) return null; // Cease retries quickly in local development
      return 500;
    },
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
      console.warn(`[Cache] Redis unavailable at ${redisUrl} (${err.message}). Using high-performance in-memory cache.`);
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
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
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

export default redis;
