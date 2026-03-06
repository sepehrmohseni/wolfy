import { NextRequest, NextResponse } from 'next/server';
import { CRON_SECRET } from '@/lib/constants';
import { cleanupExpiredImages } from '@/lib/storage';

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this as Authorization header)
  const authHeader = request.headers.get('authorization');
  const querySecret = request.nextUrl.searchParams.get('secret');
  const providedSecret = authHeader?.replace('Bearer ', '') || querySecret;

  if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cleaned = await cleanupExpiredImages();

  return NextResponse.json({
    ok: true,
    cleaned,
    timestamp: new Date().toISOString(),
  });
}
