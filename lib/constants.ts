export const MAX_GENERATIONS_PER_USER = parseInt(process.env.MAX_GENERATIONS_PER_USER || '1', 10);
export const MAX_GLOBAL_GENERATIONS_PER_DAY = parseInt(process.env.MAX_GLOBAL_GENERATIONS_PER_DAY || '50', 10);
export const IP_RATE_LIMIT_PER_MINUTE = parseInt(process.env.IP_RATE_LIMIT_PER_MINUTE || '5', 10);
export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
export const APP_SECRET = process.env.APP_SECRET || 'default-dev-secret';
export const ADMIN_SECRET = process.env.ADMIN_SECRET || '';
export const CACHE_TTL_HOURS = parseInt(process.env.CACHE_TTL_HOURS || '24', 10);
