import Link from 'next/link';
import Image from 'next/image';
import { Star, ArrowLeft, AlertTriangle } from 'lucide-react';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { generateWolfSVG } from '@/lib/svg-generator';
import { notFound } from 'next/navigation';
import { WolfOwnerActions } from '@/app/components/WolfOwnerActions';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createSupabaseAdmin();
  const { data: wolf } = await supabase
    .from('wolves')
    .select('archetype_name, rarity, motto')
    .eq('id', id)
    .single();

  if (!wolf) return { title: 'Wolf Not Found — Wolfy' };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wolfy.vercel.app';
  return {
    title: `${wolf.archetype_name} — Wolfy`,
    description: wolf.motto,
    openGraph: {
      title: `${wolf.archetype_name} | ${wolf.rarity.toUpperCase()}`,
      description: wolf.motto,
      images: [{ url: `${appUrl}/api/og?w=${id}`, width: 600, height: 800 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${wolf.archetype_name} | ${wolf.rarity.toUpperCase()}`,
      description: wolf.motto,
      images: [`${appUrl}/api/og?w=${id}`],
    },
  };
}

export default async function WolfSharePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseAdmin();
  const { data: wolf } = await supabase
    .from('wolves')
    .select('*')
    .eq('id', id)
    .single();

  if (!wolf) notFound();

  // Check if the current user is the owner
  let isOwner = false;
  try {
    const serverSupabase = await createSupabaseServer();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (user && user.id === wolf.user_id) {
      isOwner = true;
    }
  } catch {
    // Not authenticated
  }

  const now = +new Date();
  const hasImage = !!wolf.image_url;
  const imageExpired = wolf.image_expires_at
    ? new Date(wolf.image_expires_at).getTime() < now
    : false;
  const showImage = hasImage && !imageExpired;
  const svg = showImage
    ? ''
    : generateWolfSVG({
        archetypeName: wolf.archetype_name,
        rarity: wolf.rarity,
        seed: wolf.seed,
        terrain: wolf.quiz_answers?.terrain,
      });

  const daysLeft = wolf.image_expires_at && showImage
    ? Math.max(0, Math.ceil((new Date(wolf.image_expires_at).getTime() - now) / 86400000))
    : null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wolfy.vercel.app';
  const shareUrl = `${appUrl}/wolf/${id}`;

  const rarityStyle: Record<string, { text: string; badge: string; glow: string }> = {
    common: { text: 'text-green-400', badge: 'bg-green-600/20 border-green-500/40', glow: 'shadow-[0_0_30px_rgba(74,222,128,0.15)]' },
    rare: { text: 'text-indigo-400', badge: 'bg-indigo-600/20 border-indigo-500/40', glow: 'shadow-[0_0_30px_rgba(129,140,248,0.15)]' },
    legendary: { text: 'text-amber-400', badge: 'bg-amber-600/20 border-amber-500/40', glow: 'shadow-[0_0_40px_rgba(245,158,11,0.2)]' },
  };
  const rs = rarityStyle[wolf.rarity] || rarityStyle.common;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a0f] via-[#0d1117] to-[#0a0f1a] flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-md w-full">
        {/* Back button for owner */}
        {isOwner && (
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/profile"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <span className="text-sm text-gray-500">Back to My Wolves</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {wolf.archetype_name}
          </h1>
          <div className={`inline-flex items-center gap-1 mt-2 px-4 py-1 rounded-full border text-xs font-bold uppercase tracking-[0.2em] ${rs.text} ${rs.badge}`}>
            <Star className="w-3 h-3" /> {wolf.rarity} <Star className="w-3 h-3" />
          </div>
        </div>

        {/* Wolf Image */}
        {showImage ? (
          <div className={`relative aspect-square mb-4 rounded-2xl overflow-hidden ${rs.glow}`}>
            <Image
              src={wolf.image_url}
              alt={wolf.archetype_name}
              fill
              loading="lazy"
              className="object-cover rounded-2xl"
              sizes="(max-width: 448px) 100vw, 448px"
            />
          </div>
        ) : (
          <div
            className={`flex justify-center mb-4 rounded-2xl overflow-hidden ${rs.glow}`}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}

        {/* Image retention disclaimer for owner */}
        {isOwner && showImage && daysLeft !== null && (
          <div className="flex items-start gap-2 mb-4 px-3 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/90 leading-relaxed">
              This image will be <strong>auto-deleted in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong> to save storage.
              Download it to keep it forever.
            </p>
          </div>
        )}

        {/* Details */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-emerald-400 mb-1.5">
              Personality
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              {wolf.personality}
            </p>
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-widest text-emerald-400 mb-1.5">
              Origin Story
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              {wolf.origin_story}
            </p>
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-widest text-emerald-400 mb-1.5">
              Motto
            </h2>
            <p className="text-white italic font-medium">
              &ldquo;{wolf.motto}&rdquo;
            </p>
          </div>
        </div>

        {/* Owner actions (download + share) vs visitor CTA */}
        {isOwner ? (
          <WolfOwnerActions
            wolfId={id}
            archetypeName={wolf.archetype_name}
            hasImage={showImage}
            shareUrl={shareUrl}
          />
        ) : (
          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
              Find Your Inner Wolf
            </Link>
          </div>
        )}

        {/* Branding */}
        <div className="text-center mt-6">
          <span className="text-xs text-gray-600">
            Generated by{' '}
            <Link href="/" className="text-emerald-600 hover:text-emerald-400 transition-colors">
              Wolfy
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
