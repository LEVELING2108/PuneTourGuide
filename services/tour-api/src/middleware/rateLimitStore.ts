import { createHash } from 'crypto';
import { MemoryStore, type ClientRateLimitInfo, type Options, type Store } from 'express-rate-limit';
import { sharedRedis } from '../services/cacheService';

// INCR the counter and start its window on the first hit, atomically.
const INCR_SCRIPT = `
local hits = redis.call('INCR', KEYS[1])
if hits == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
return { hits, redis.call('PTTL', KEYS[1]) }`;

/**
 * Fixed-window counter in Redis, so a limit holds across every API instance.
 * If Redis is down, each instance counts in memory: limits get looser but
 * nothing is blocked (SOS alerts must never fail because the cache is down).
 */
export class SharedStore implements Store {
  readonly localKeys = false;
  private windowMs = 60_000;
  private readonly memory = new MemoryStore();

  constructor(readonly prefix: string) {}

  init(options: Options) {
    this.windowMs = options.windowMs;
    this.memory.init(options);
  }

  // Keys can hold an email or phone number; hash them so Redis never stores either in clear.
  private key(key: string) {
    return `tour:rl:${this.prefix}:${createHash('sha256').update(key).digest('base64url')}`;
  }

  async increment(key: string): Promise<ClientRateLimitInfo> {
    const redis = sharedRedis();
    if (redis) {
      try {
        const [hits, ttl] = (await redis.eval(INCR_SCRIPT, 1, this.key(key), this.windowMs)) as [number, number];
        return { totalHits: hits, resetTime: new Date(Date.now() + (ttl > 0 ? ttl : this.windowMs)) };
      } catch {
        // fall through to memory
      }
    }
    return this.memory.increment(key);
  }

  async decrement(key: string) {
    const redis = sharedRedis();
    if (redis) {
      try {
        await redis.decr(this.key(key));
        return;
      } catch {
        // fall through to memory
      }
    }
    await this.memory.decrement(key);
  }

  async resetKey(key: string) {
    const redis = sharedRedis();
    if (redis) await redis.unlink(this.key(key)).catch(() => undefined);
    await this.memory.resetKey(key);
  }

  shutdown() {
    this.memory.shutdown();
  }
}
