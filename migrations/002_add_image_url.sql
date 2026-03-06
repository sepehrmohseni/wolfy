-- Add image columns to store AI-generated wolf card images
ALTER TABLE wolves ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE wolves ADD COLUMN IF NOT EXISTS image_expires_at timestamptz;

-- Index for cleanup cron to find expired images efficiently
CREATE INDEX IF NOT EXISTS idx_wolves_image_expires
  ON wolves (image_expires_at)
  WHERE image_url IS NOT NULL;

-- Create the storage bucket for wolf avatar images
INSERT INTO storage.buckets (id, name, public)
VALUES ('wolf-avatars', 'wolf-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to wolf avatars
CREATE POLICY "Public read wolf avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wolf-avatars');

-- Allow service role to upload wolf avatars
CREATE POLICY "Service role upload wolf avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'wolf-avatars');

-- Allow service role to delete wolf avatars (cleanup + download-delete)
CREATE POLICY "Service role delete wolf avatars"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'wolf-avatars');
