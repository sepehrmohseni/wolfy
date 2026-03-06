import Link from 'next/link';
import Image from 'next/image';
import { Star, ArrowLeft, Clock } from 'lucide-react';
import { createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Wolves — Wolfy',
  description: 'View all your generated wolf archetypes.',
};

export default async function ProfilePage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/');

  const { data: wolves } = await supabase
    .from('wolves')
    .select('id, archetype_name, rarity, motto, image_url, image_expires_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const rarityStyle: Record<string, { text: string; border: string; glow: string }> = {
    common: {
      text: 'text-green-400',
      border: 'border-green-500/30',
      glow: 'shadow-[0_0_20px_rgba(74,222,128,0.1)]',
    },
    rare: {
      text: 'text-indigo-400',
      border: 'border-indigo-500/30',
      glow: 'shadow-[0_0_20px_rgba(129,140,248,0.1)]',
    },
    legendary: {
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a0f] via-[#0d1117] to-[#0a0f1a] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pt-4">
          <Link
            href="/"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              My Wolves
            </h1>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>
        </div>

        {/* Wolf list */}
        {!wolves || wolves.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">
              You haven&apos;t generated any wolves yet.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
            >
              Find Your Inner Wolf
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {wolves.map((wolf) => {
              const rs = rarityStyle[wolf.rarity] || rarityStyle.common;
              const now = +new Date();
              const daysLeft = wolf.image_expires_at
                ? Math.max(0, Math.ceil((new Date(wolf.image_expires_at).getTime() - now) / 86400000))
                : null;
              const imageExpired = daysLeft !== null && daysLeft === 0;
              const showImage = wolf.image_url && !imageExpired;
              return (
                <Link
                  key={wolf.id}
                  href={`/wolf/${wolf.id}`}
                  className={`block bg-white/5 backdrop-blur-xl border ${rs.border} ${rs.glow} rounded-2xl p-4 sm:p-5 hover:bg-white/10 transition-all duration-200 hover:scale-[1.01]`}
                >
                  <div className="flex gap-4 items-center">
                    {/* Thumbnail */}
                    {showImage ? (
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={wolf.image_url}
                          alt={wolf.archetype_name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true">
                          <path
                            d="M7 25 L10 10 L14 17 L16 7 L18 17 L22 10 L25 25 Z"
                            fill="#10b981"
                          />
                          <circle cx="12.5" cy="19" r="1.8" fill="#fbbf24" />
                          <circle cx="19.5" cy="19" r="1.8" fill="#fbbf24" />
                        </svg>
                      </div>
                    )}

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold text-white truncate">
                        {wolf.archetype_name}
                      </h2>
                      <div className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider mt-1 ${rs.text}`}>
                        <Star className="w-3 h-3" /> {wolf.rarity}
                      </div>
                      <p className="text-sm text-gray-400 mt-1 italic truncate">
                        &ldquo;{wolf.motto}&rdquo;
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(wolf.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      {showImage && daysLeft !== null && (
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span className="text-[10px] text-amber-400">
                            Image expires in {daysLeft}d
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
