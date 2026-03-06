import { createSupabaseAdmin } from './supabase/server';

/**
 * Extract the storage file path from a Supabase Storage public URL.
 * URL format: https://<project>.supabase.co/storage/v1/object/public/wolf-avatars/wolves/<file>
 */
function extractStoragePath(imageUrl: string): string | null {
  const marker = '/wolf-avatars/';
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return null;
  return imageUrl.slice(idx + marker.length);
}

/**
 * Delete a wolf image from Supabase Storage and null out the DB record.
 */
export async function deleteWolfImage(wolfId: string): Promise<boolean> {
  const supabase = await createSupabaseAdmin();

  const { data: wolf } = await supabase
    .from('wolves')
    .select('image_url')
    .eq('id', wolfId)
    .single();

  if (!wolf?.image_url) return false;

  const storagePath = extractStoragePath(wolf.image_url);
  if (storagePath) {
    const { error } = await supabase.storage
      .from('wolf-avatars')
      .remove([storagePath]);

    if (error) {
      console.error(`Failed to delete storage file ${storagePath}:`, error.message);
      return false;
    }
  }

  await supabase
    .from('wolves')
    .update({ image_url: null, image_expires_at: null })
    .eq('id', wolfId);

  return true;
}

/**
 * Delete all expired wolf images (past image_expires_at).
 * Returns count of cleaned-up records.
 */
export async function cleanupExpiredImages(): Promise<number> {
  const supabase = await createSupabaseAdmin();

  const { data: expired } = await supabase
    .from('wolves')
    .select('id, image_url')
    .not('image_url', 'is', null)
    .lt('image_expires_at', new Date().toISOString());

  if (!expired || expired.length === 0) return 0;

  // Collect storage paths to batch-delete
  const storagePaths: string[] = [];
  for (const wolf of expired) {
    const path = extractStoragePath(wolf.image_url);
    if (path) storagePaths.push(path);
  }

  // Batch delete from storage
  if (storagePaths.length > 0) {
    const { error } = await supabase.storage
      .from('wolf-avatars')
      .remove(storagePaths);

    if (error) {
      console.error('Batch storage delete error:', error.message);
    }
  }

  // Null out DB records
  const ids = expired.map((w) => w.id);
  await supabase
    .from('wolves')
    .update({ image_url: null, image_expires_at: null })
    .in('id', ids);

  console.log(`Cleaned up ${expired.length} expired wolf images`);
  return expired.length;
}
