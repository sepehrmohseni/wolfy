'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, Link2, Check, Download, Eye } from 'lucide-react';

interface Wolf {
  id: string;
  archetype_name: string;
  rarity: string;
  motto: string;
  image_url: string | null;
  image_expires_at: string | null;
  created_at: string;
}

interface Props {
  wolves: Wolf[];
}

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

function WolfThumbnail({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 bg-white/5 animate-pulse rounded-xl">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="w-6 h-6 opacity-20" aria-hidden="true">
              <path d="M7 25 L10 10 L14 17 L16 7 L18 17 L22 10 L25 25 Z" fill="#10b981" />
              <circle cx="12.5" cy="19" r="1.8" fill="#fbbf24" />
              <circle cx="19.5" cy="19" r="1.8" fill="#fbbf24" />
            </svg>
          </div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        sizes="80px"
      />
    </>
  );
}

export function WolfList({ wolves }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletedImages, setDeletedImages] = useState<Set<string>>(new Set());

  const handleCopy = async (wolfId: string) => {
    const url = `${window.location.origin}/wolf/${wolfId}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(wolfId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = async (wolf: Wolf) => {
    setDownloadingId(wolf.id);
    try {
      const res = await fetch(`/api/image/download?id=${wolf.id}`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${wolf.archetype_name.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (res.headers.get('X-Image-Deleted') === 'true') {
        setDeletedImages((prev) => new Set(prev).add(wolf.id));
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="grid gap-4">
      {wolves.map((wolf) => {
        const rs = rarityStyle[wolf.rarity] || rarityStyle.common;
        const now = Date.now();
        const daysLeft = wolf.image_expires_at
          ? Math.max(0, Math.ceil((new Date(wolf.image_expires_at).getTime() - now) / 86400000))
          : null;
        const imageExpired = daysLeft !== null && daysLeft === 0;
        const imageDeletedByDownload = deletedImages.has(wolf.id);
        const showImage = !!wolf.image_url && !imageExpired && !imageDeletedByDownload;

        return (
          <div
            key={wolf.id}
            className={`bg-white/5 backdrop-blur-xl border ${rs.border} ${rs.glow} rounded-2xl p-4 sm:p-5 transition-all duration-200 overflow-hidden`}
          >
            <div className="flex gap-3 sm:gap-4 items-center min-w-0">
              {/* Thumbnail */}
              {showImage ? (
                <Link
                  href={`/wolf/${wolf.id}`}
                  className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0"
                >
                  <WolfThumbnail src={wolf.image_url!} alt={wolf.archetype_name} />
                </Link>
              ) : (
                <Link
                  href={`/wolf/${wolf.id}`}
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-emerald-900/30 flex items-center justify-center flex-shrink-0"
                >
                  <svg viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true">
                    <path
                      d="M7 25 L10 10 L14 17 L16 7 L18 17 L22 10 L25 25 Z"
                      fill="#10b981"
                    />
                    <circle cx="12.5" cy="19" r="1.8" fill="#fbbf24" />
                    <circle cx="19.5" cy="19" r="1.8" fill="#fbbf24" />
                  </svg>
                </Link>
              )}

              {/* Info */}
              <div className="min-w-0 flex-1">
                <Link href={`/wolf/${wolf.id}`}>
                  <h2 className="text-base sm:text-lg font-bold text-white truncate hover:text-emerald-400 transition-colors">
                    {wolf.archetype_name}
                  </h2>
                </Link>
                <div className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider mt-0.5 ${rs.text}`}>
                  <Star className="w-3 h-3 flex-shrink-0" /> {wolf.rarity}
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 italic truncate">
                  &ldquo;{wolf.motto}&rdquo;
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-gray-600">
                    {new Date(wolf.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  {showImage && daysLeft !== null && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] text-amber-400">
                        {daysLeft}d left
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions row */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
              <Link
                href={`/wolf/${wolf.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">View</span>
              </Link>
              <button
                onClick={() => handleCopy(wolf.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                {copiedId === wolf.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Share</span>
                  </>
                )}
              </button>
              {showImage && (
                <button
                  onClick={() => handleDownload(wolf)}
                  disabled={downloadingId === wolf.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-medium text-emerald-400 bg-emerald-600/10 hover:bg-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">
                    {downloadingId === wolf.id ? 'Saving…' : 'Download'}
                  </span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
