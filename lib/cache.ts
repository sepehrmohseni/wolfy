import { Redis } from '@upstash/redis';
import { CACHE_TTL_HOURS } from './constants';

let redis: Redis | null = null;
const memoryCache = new Map<string, { value: string; expires: number }>();
let cacheHits = 0;
let cacheMisses = 0;

function getRedis(): Redis | null {
  if (redis) return redis;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    return redis;
  }
  return null;
}

export async function cacheGet(key: string): Promise<string | null> {
  const r = getRedis();
  if (r) {
    const val = await r.get<string>(key);
    if (val) {
      cacheHits++;
      return val;
    }
    cacheMisses++;
    return null;
  }
  // In-memory fallback for dev
  const entry = memoryCache.get(key);
  if (entry && entry.expires > Date.now()) {
    cacheHits++;
    return entry.value;
  }
  if (entry) memoryCache.delete(key);
  cacheMisses++;
  return null;
}

export async function cacheSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  const ttl = ttlSeconds || CACHE_TTL_HOURS * 3600;
  const r = getRedis();
  if (r) {
    await r.set(key, value, { ex: ttl });
    return;
  }
  memoryCache.set(key, { value, expires: Date.now() + ttl * 1000 });
}

export function getCacheStats() {
  return { cacheHits, cacheMisses };
}
