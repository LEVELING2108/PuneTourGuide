import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let hasLoggedRedisError = false;

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 3) return null; // Stop retrying if unavailable, fallback to DB
    return Math.min(times * 200, 1000);
  },
});

redis.on('connect', () => {
  hasLoggedRedisError = false;
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  if (!hasLoggedRedisError) {
    console.warn(`[Cache] Redis unavailable at ${redisUrl} (${err.message}). Falling back to direct database queries.`);
    hasLoggedRedisError = true;
  }
});

export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Error getting cache for key ${key}:`, err);
    return null;
  }
};

export const setCachedData = async (key: string, data: any, ttlSeconds: number = 3600): Promise<void> => {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (err) {
    console.error(`Error setting cache for key ${key}:`, err);
  }
};

export const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error(`Error invalidating cache for pattern ${pattern}:`, err);
  }
};

export default redis;
