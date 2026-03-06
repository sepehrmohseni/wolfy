import { NextResponse } from 'next/server';
import { requireVerifiedUser } from '@/lib/auth';
import { checkUserRate, checkGlobalRate } from '@/lib/rate-limit';

export async function GET() {
  const authResult = await requireVerifiedUser();
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const [userCheck, globalCheck] = await Promise.all([
    checkUserRate(authResult.id),
    checkGlobalRate(),
  ]);

  return NextResponse.json({
    userAllowed: userCheck.allowed,
    userRemaining: userCheck.remaining,
    globalAllowed: globalCheck.allowed,
    globalRemaining: globalCheck.remaining,
  });
}
