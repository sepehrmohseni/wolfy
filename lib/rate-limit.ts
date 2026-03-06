import { Redis } from '@upstash/redis';
import {
  MAX_GENERATIONS_PER_USER,
  MAX_GLOBAL_GENERATIONS_PER_DAY,
  IP_RATE_LIMIT_PER_MINUTE,
} from './constants';

let redis: Redis | null = null;
const memCounters = new Map<string, { count: number; expires: number }>();

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

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function secondsUntilMidnightUTC(): number {
  const now = new Date();
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  return Math.ceil((tomorrow.getTime() - now.getTime()) / 1000);
}

async function increment(key: string, ttlSeconds: number): Promise<number> {
  const r = getRedis();
  if (r) {
    const count = await r.incr(key);
    if (count === 1) await r.expire(key, ttlSeconds);
    return count;
  }
  const entry = memCounters.get(key);
  if (entry && entry.expires > Date.now()) {
    entry.count++;
    return entry.count;
  }
  memCounters.set(key, { count: 1, expires: Date.now() + ttlSeconds * 1000 });
  return 1;
}

async function getCount(key: string): Promise<number> {
  const r = getRedis();
  if (r) {
    return (await r.get<number>(key)) || 0;
  }
  const entry = memCounters.get(key);
  if (entry && entry.expires > Date.now()) return entry.count;
  return 0;
}

/** Token-bucket style IP throttle: max N requests per minute. */
export async function checkIPRate(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rl:ip:${ip}:${Math.floor(Date.now() / 60000)}`;
  const count = await increment(key, 60);
  return {
    allowed: count <= IP_RATE_LIMIT_PER_MINUTE,
    remaining: Math.max(0, IP_RATE_LIMIT_PER_MINUTE - count),
  };
}

/** Per-user daily cap (check before generating). */
export async function checkUserRate(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rl:user:${userId}:${todayKey()}`;
  const count = await getCount(key);
  return {
    allowed: count < MAX_GENERATIONS_PER_USER,
    remaining: Math.max(0, MAX_GENERATIONS_PER_USER - count),
  };
}

export async function incrementUserRate(userId: string): Promise<void> {
  const key = `rl:user:${userId}:${todayKey()}`;
  await increment(key, secondsUntilMidnightUTC());
}

/** Global daily cap across all users. */
export async function checkGlobalRate(): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rl:global:${todayKey()}`;
  const count = await getCount(key);
  return {
    allowed: count < MAX_GLOBAL_GENERATIONS_PER_DAY,
    remaining: Math.max(0, MAX_GLOBAL_GENERATIONS_PER_DAY - count),
  };
}

export async function incrementGlobalRate(): Promise<void> {
  const key = `rl:global:${todayKey()}`;
  await increment(key, secondsUntilMidnightUTC());
}

export async function getGlobalCount(): Promise<number> {
  return getCount(`rl:global:${todayKey()}`);
}
