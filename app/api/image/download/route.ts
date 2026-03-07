import { NextRequest, NextResponse } from 'next/server';
import { requireVerifiedUser } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { deleteWolfImage } from '@/lib/storage';
import { IMAGE_DELETE_ON_DOWNLOAD } from '@/lib/constants';

export async function GET(request: NextRequest) {
  // Auth: only the wolf owner can download
  const authResult = await requireVerifiedUser();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const wolfId = request.nextUrl.searchParams.get('id');
  if (!wolfId) {
    return NextResponse.json({ error: 'Missing wolf ID' }, { status: 400 });
  }

  const supabase = await createSupabaseAdmin();
  const { data: wolf } = await supabase
    .from('wolves')
    .select('id, user_id, image_url, archetype_name')
    .eq('id', wolfId)
    .single();

  if (!wolf) {
    return NextResponse.json({ error: 'Wolf not found' }, { status: 404 });
  }

  // Only the owner can download
  if (wolf.user_id !== authResult.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (!wolf.image_url) {
    return NextResponse.json({ error: 'No image available for this wolf' }, { status: 404 });
  }

  // Fetch the image
  const imageResponse = await fetch(wolf.image_url);
  if (!imageResponse.ok) {
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  const contentType = imageResponse.headers.get('content-type') || 'image/png';
  const safeName = wolf.archetype_name.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-');

  // Conditionally delete the image from storage after download
  let imageDeleted = false;
  if (IMAGE_DELETE_ON_DOWNLOAD) {
    imageDeleted = await deleteWolfImage(wolfId);
  }

  return new NextResponse(imageBuffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${safeName}.png"`,
      'Cache-Control': 'no-store',
      ...(imageDeleted && { 'X-Image-Deleted': 'true' }),
    },
  });
}
