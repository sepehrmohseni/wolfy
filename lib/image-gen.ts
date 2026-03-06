import OpenAI from 'openai';
import { createSupabaseAdmin } from './supabase/server';
import { IMAGE_RETENTION_DAYS } from './constants';

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

const IMAGE_MODEL = process.env.IMAGE_MODEL || 'dall-e-3';
const IMAGE_SIZE = (process.env.IMAGE_SIZE || '1024x1024') as '1024x1024' | '1024x1792' | '1792x1024';

function buildImagePrompt(archetype: {
  archetypeName: string;
  personality: string;
  rarity: string;
}, terrain: string, element: string): string {
  const rarityStyle: Record<string, string> = {
    common: 'subtle cyan and green neon accents, soft ambient glow',
    rare: 'vivid indigo and purple neon accents, prominent ethereal glow, aurora-like light trails',
    legendary: 'intense gold and amber neon accents, blazing radiance, cosmic aurora backdrop with particle effects',
  };

  const terrainDesc: Record<string, string> = {
    'deep forest': 'ancient dense pine forest with towering dark trees, thick canopy with light filtering through',
    'snowy mountain': 'snow-covered mountain peaks, frozen cliffs, ice crystals catching neon light',
    'misty valley': 'fog-filled valley between dark mountains, layers of mist with depth',
    'open plains': 'vast snowy tundra under a starlit sky, sparse frost-covered vegetation',
  };

  const elementDesc: Record<string, string> = {
    fire: 'faint embers and warm neon sparks drifting around the wolf',
    ice: 'crystalline frost patterns and ice shards reflecting neon light',
    shadow: 'dark wisps and shadow tendrils merging with the environment',
    storm: 'crackling energy arcs and electric neon bolts in the atmosphere',
  };

  return `A majestic, photorealistic wolf portrait titled "${archetype.archetypeName}". The wolf stands in a ${terrainDesc[terrain] || 'dark winter forest'} setting. The scene has a distinctly neon-forest-winter atmosphere: dark moody environment with ${rarityStyle[archetype.rarity] || rarityStyle.common}. ${elementDesc[element] || ''} The wolf's expression and posture embody: ${archetype.personality}. Snowflakes drift gently through the air. Neon-colored bioluminescent plants and mushrooms dot the forest floor. The overall mood is mystical, powerful, and wintry. Digital art, cinematic lighting, high detail, vertical composition suitable for a trading card. No text, no watermarks, no logos.`;
}

async function uploadToSupabaseStorage(
  imageBuffer: ArrayBuffer,
  seed: string,
): Promise<string | null> {
  try {
    const supabase = await createSupabaseAdmin();
    const fileName = `${seed}-${Date.now()}.png`;
    const filePath = `wolves/${fileName}`;

    const { error } = await supabase.storage
      .from('wolf-avatars')
      .upload(filePath, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '31536000',
        upsert: false,
      });

    if (error) {
      console.error('Supabase Storage upload failed:', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('wolf-avatars')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload to storage failed:', error);
    return null;
  }
}

export async function generateWolfImage(
  archetype: {
    archetypeName: string;
    personality: string;
    rarity: string;
    seed: string;
  },
  terrain: string,
  element: string,
): Promise<{ imageUrl: string; imageExpiresAt: string } | null> {
  if (process.env.IMAGE_ENABLED === 'false') return null;

  const prompt = buildImagePrompt(archetype, terrain, element);

  try {
    const response = await getOpenAI().images.generate({
      model: IMAGE_MODEL,
      prompt,
      n: 1,
      size: IMAGE_SIZE,
      quality: 'standard',
    });

    const tempUrl = response.data?.[0]?.url;
    if (!tempUrl) {
      console.error('DALL-E returned no image URL');
      return null;
    }

    // Download the image and upload to Supabase Storage for a permanent URL
    const imageResponse = await fetch(tempUrl);
    if (!imageResponse.ok) {
      console.error('Failed to download DALL-E image');
      return null;
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const permanentUrl = await uploadToSupabaseStorage(imageBuffer, archetype.seed);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + IMAGE_RETENTION_DAYS);
    const imageExpiresAt = expiresAt.toISOString();

    if (permanentUrl) {
      return { imageUrl: permanentUrl, imageExpiresAt };
    }

    // Fall back to temporary DALL-E URL if storage upload fails
    console.warn('Storage upload failed, using temporary DALL-E URL');
    return { imageUrl: tempUrl, imageExpiresAt };
  } catch (error) {
    console.error('Image generation failed:', error);
    return null;
  }
}
