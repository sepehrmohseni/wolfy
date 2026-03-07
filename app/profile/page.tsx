import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WolfList } from '@/app/components/WolfList';
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
            <p className="text-sm text-gray-500 mt-1 truncate">{user.email}</p>
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
          <WolfList wolves={wolves} />
        )}
      </div>
    </div>
  );
}
