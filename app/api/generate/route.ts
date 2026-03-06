import { NextRequest, NextResponse } from 'next/server';
import { requireVerifiedUser } from '@/lib/auth';
import { verifyTurnstile } from '@/lib/turnstile';
import {
  checkIPRate,
  checkUserRate,
  checkGlobalRate,
  incrementUserRate,
  incrementGlobalRate,
} from '@/lib/rate-limit';
import { cacheGet, cacheSet } from '@/lib/cache';
import { computeSeed, computeRarity, cacheKey } from '@/lib/rarity';
import { generateWolfArchetype, type WolfArchetype } from '@/lib/openai';
import { generateWolfSVG } from '@/lib/svg-generator';
import { createSupabaseAdmin } from '@/lib/supabase/server';

const VALID_ANSWERS: Record<string, string[]> = {
  danger: ['fight', 'hide', 'observe', 'adapt'],
  terrain: ['deep forest', 'snowy mountain', 'misty valley', 'open plains'],
  night: ['powerful', 'peaceful', 'restless', 'curious'],
  role: ['leader', 'guardian', 'scout', 'lone wolf'],
  element: ['fire', 'ice', 'shadow', 'storm'],
};

function validateAnswers(answers: unknown): answers is Record<string, string> {
  if (!answers || typeof answers !== 'object') return false;
  const a = answers as Record<string, unknown>;
  for (const [key, valid] of Object.entries(VALID_ANSWERS)) {
    if (typeof a[key] !== 'string' || !valid.includes(a[key] as string))
      return false;
  }
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const authResult = await requireVerifiedUser();
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    const user = authResult;

    // 2. Parse body
    const body = await request.json().catch(() => null);
    if (!body || !body.answers || !body.turnstileToken) {
      return NextResponse.json(
        { error: 'Missing required fields: answers, turnstileToken' },
        { status: 400 }
      );
    }

    // 3. Validate quiz answers
    if (!validateAnswers(body.answers)) {
      return NextResponse.json(
        { error: 'Invalid quiz answers' },
        { status: 400 }
      );
    }

    // 4. Turnstile verification
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const turnstileOk = await verifyTurnstile(body.turnstileToken, ip);
    if (!turnstileOk) {
      return NextResponse.json(
        { error: 'Captcha verification failed' },
        { status: 403 }
      );
    }

    // 5. IP rate limit
    const ipCheck = await checkIPRate(ip);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Try again in a minute.' },
        { status: 429 }
      );
    }

    // 6. User daily cap
    const userCheck = await checkUserRate(user.id);
    if (!userCheck.allowed) {
      return NextResponse.json(
        { error: 'Daily generation limit reached.', remaining: 0 },
        { status: 429 }
      );
    }

    // 7. Global daily cap
    const globalCheck = await checkGlobalRate();
    if (!globalCheck.allowed) {
      return NextResponse.json(
        { error: 'Global daily limit reached. Try again tomorrow.' },
        { status: 429 }
      );
    }

    // 8. Deterministic seed & rarity
    const seed = computeSeed(body.answers);
    const rarity = computeRarity(seed);

    // 9. Check deterministic cache
    const ck = cacheKey(body.answers);
    const cached = await cacheGet(ck);
    if (cached) {
      const archetype: WolfArchetype = JSON.parse(cached);
      const svg = generateWolfSVG({
        archetypeName: archetype.archetypeName,
        rarity: archetype.rarity,
        seed: archetype.seed,
        terrain: body.answers.terrain,
      });

      const supabase = await createSupabaseAdmin();
      const { data: wolf } = await supabase
        .from('wolves')
        .insert({
          user_id: user.id,
          archetype_name: archetype.archetypeName,
          personality: archetype.personality,
          origin_story: archetype.originStory,
          motto: archetype.motto,
          quiz_answers: body.answers,
          seed: archetype.seed,
          rarity: archetype.rarity,
          openai_response: archetype,
          openai_usage: { cached: true },
        })
        .select('id')
        .single();

      await incrementUserRate(user.id);
      await incrementGlobalRate();

      return NextResponse.json({
        archetype,
        svg,
        wolfId: wolf?.id,
        fromCache: true,
      });
    }

    // 10. Generate with OpenAI
    const { archetype, usage } = await generateWolfArchetype(
      body.answers,
      rarity,
      seed
    );
    const svg = generateWolfSVG({
      archetypeName: archetype.archetypeName,
      rarity: archetype.rarity,
      seed: archetype.seed,
      terrain: body.answers.terrain,
    });

    // 11. Cache the result
    await cacheSet(ck, JSON.stringify(archetype));

    // 12. Save to DB
    const supabase = await createSupabaseAdmin();
    const { data: wolf } = await supabase
      .from('wolves')
      .insert({
        user_id: user.id,
        archetype_name: archetype.archetypeName,
        personality: archetype.personality,
        origin_story: archetype.originStory,
        motto: archetype.motto,
        quiz_answers: body.answers,
        seed: archetype.seed,
        rarity: archetype.rarity,
        openai_response: archetype,
        openai_usage: usage,
      })
      .select('id')
      .single();

    // 13. Increment counters
    await incrementUserRate(user.id);
    await incrementGlobalRate();

    console.log(
      `Wolf generated: ${archetype.archetypeName} [${rarity}] tokens: ${usage.total_tokens}`
    );

    return NextResponse.json({
      archetype,
      svg,
      wolfId: wolf?.id,
      fromCache: false,
    });
  } catch (error: unknown) {
    console.error('Generate error:', error);
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('rate limit')) {
      return NextResponse.json({ error: message }, { status: 429 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
