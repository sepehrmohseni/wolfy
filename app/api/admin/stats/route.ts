import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SECRET, MAX_GLOBAL_GENERATIONS_PER_DAY } from '@/lib/constants';
import { getGlobalCount } from '@/lib/rate-limit';
import { getCacheStats } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const secret =
    request.nextUrl.searchParams.get('secret') ||
    request.headers.get('x-admin-secret');

  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const totalToday = await getGlobalCount();
  const { cacheHits, cacheMisses } = getCacheStats();

  return NextResponse.json({
    totalToday,
    globalCapLeft: Math.max(0, MAX_GLOBAL_GENERATIONS_PER_DAY - totalToday),
    cacheHits,
    cacheMisses,
    perModelUsage: { model: process.env.OPENAI_MODEL || 'gpt-4o-mini' },
  });
}
