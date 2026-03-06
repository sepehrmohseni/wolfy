import { createHmac } from 'crypto';
import { APP_SECRET } from './constants';

export type Rarity = 'common' | 'rare' | 'legendary';

/** Deterministic seed from quiz answers + APP_SECRET via HMAC-SHA256. */
export function computeSeed(quizAnswers: Record<string, string>): string {
  const sorted = Object.keys(quizAnswers)
    .sort()
    .map((k) => `${k}:${quizAnswers[k]}`)
    .join('|');
  return createHmac('sha256', APP_SECRET).update(sorted).digest('hex');
}

/** Map seed → rarity bucket. last byte mod 100: <75 common, 75–95 rare, 96–99 legendary. */
export function computeRarity(seed: string): Rarity {
  const lastByte = parseInt(seed.slice(-2), 16);
  const val = lastByte % 100;
  if (val >= 96) return 'legendary';
  if (val >= 75) return 'rare';
  return 'common';
}

/** Cache key for identical quiz answers. */
export function cacheKey(quizAnswers: Record<string, string>): string {
  return `wolf:cache:${computeSeed(quizAnswers)}`;
}
