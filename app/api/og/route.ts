import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { generateWolfSVG } from '@/lib/svg-generator';

export async function GET(request: NextRequest) {
  const wolfId = request.nextUrl.searchParams.get('w');
  if (!wolfId) {
    return new NextResponse('Missing wolf ID', { status: 400 });
  }

  const supabase = await createSupabaseAdmin();
  const { data: wolf } = await supabase
    .from('wolves')
    .select('archetype_name, rarity, seed, quiz_answers')
    .eq('id', wolfId)
    .single();

  if (!wolf) {
    return new NextResponse('Wolf not found', { status: 404 });
  }

  const svg = generateWolfSVG({
    archetypeName: wolf.archetype_name,
    rarity: wolf.rarity,
    seed: wolf.seed,
    terrain: wolf.quiz_answers?.terrain,
  });

  // Try rendering to PNG with sharp
  try {
    const sharp = (await import('sharp')).default;
    const png = await sharp(Buffer.from(svg))
      .resize(600, 800)
      .png()
      .toBuffer();

    return new NextResponse(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch {
    // Fallback: return SVG directly
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  }
}
