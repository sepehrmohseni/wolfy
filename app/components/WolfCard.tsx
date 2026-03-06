'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Link2, Check, Star, Download, AlertTriangle, Trash2 } from 'lucide-react';

interface WolfResult {
  archetype: {
    archetypeName: string;
    personality: string;
    originStory: string;
    motto: string;
    rarity: string;
    seed: string;
  };
  svg: string;
  imageUrl: string | null;
  imageExpiresAt: string | null;
  wolfId: string;
}

interface Props {
  result: WolfResult;
}

export function WolfCard({ result }: Props) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [imageDeleted, setImageDeleted] = useState(false);
  const { archetype, svg, imageUrl, imageExpiresAt, wolfId } = result;

  const currentImageUrl = imageDeleted ? null : imageUrl;

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/wolf/${wolfId}`
      : `/wolf/${wolfId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!wolfId) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/image/download?id=${wolfId}`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${archetype.archetypeName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setImageDeleted(true);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const daysLeft = imageExpiresAt
    ? Math.max(0, Math.ceil((new Date(imageExpiresAt).getTime() - Date.now()) / 86400000))
    : null;

  const rarityStyle: Record<string, { text: string; border: string; glow: string }> = {
    common: {
      text: 'text-green-400',
      border: 'border-green-500/30',
      glow: 'shadow-[0_0_30px_rgba(74,222,128,0.15)]',
    },
    rare: {
      text: 'text-indigo-400',
      border: 'border-indigo-500/30',
      glow: 'shadow-[0_0_30px_rgba(129,140,248,0.15)]',
    },
    legendary: {
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      glow: 'shadow-[0_0_40px_rgba(245,158,11,0.2)]',
    },
  };
  const rs = rarityStyle[archetype.rarity] || rarityStyle.common;

  return (
    <div className="max-w-md w-full">
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {archetype.archetypeName}
        </h2>
        <p
          className={`text-sm font-bold uppercase tracking-[0.3em] mt-2 ${rs.text}`}
        >
        <Star className={`w-3 h-3 inline-block ${rs.text}`} /> {archetype.rarity} <Star className={`w-3 h-3 inline-block ${rs.text}`} />
        </p>
      </div>

      {/* Wolf Image */}
      {currentImageUrl ? (
        <div className={`relative aspect-square mb-4 rounded-2xl overflow-hidden ${rs.glow}`}>
          <Image
            src={currentImageUrl}
            alt={archetype.archetypeName}
            fill
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

      {/* Image retention disclaimer */}
      {currentImageUrl && daysLeft !== null && (
        <div className="flex items-start gap-2 mb-4 px-3 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300/90 leading-relaxed">
            This image will be <strong>auto-deleted in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong> to save storage.
            Download it to keep it forever.
          </p>
        </div>
      )}

      {/* Download deleted notice */}
      {imageDeleted && (
        <div className="flex items-start gap-2 mb-4 px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <Trash2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-300/90 leading-relaxed">
            Image downloaded and removed from our servers. It&apos;s saved on your device.
          </p>
        </div>
      )}

      {/* Details */}
      <div
        className={`bg-white/5 backdrop-blur-xl border ${rs.border} rounded-2xl p-6 space-y-4`}
      >
        <div>
          <h3 className="text-xs uppercase tracking-widest text-emerald-400 mb-1">
            Personality
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {archetype.personality}
          </p>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-widest text-emerald-400 mb-1">
            Origin Story
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {archetype.originStory}
          </p>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-widest text-emerald-400 mb-1">
            Motto
          </h3>
          <p className="text-white italic font-medium">
            &ldquo;{archetype.motto}&rdquo;
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        {currentImageUrl && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5"
            title="Download will remove the image from our servers"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Downloading...' : 'Download & Save'}
          </button>
        )}
        <button
          onClick={handleCopy}
          className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-200"
        >
          {copied ? <><Check className="w-4 h-4 inline-block mr-1" /> Copied!</> : <><Link2 className="w-4 h-4 inline-block mr-1" /> Share Link</>}
        </button>
      </div>

      {/* Download disclaimer */}
      {currentImageUrl && (
        <p className="text-[10px] text-gray-600 text-center mt-3 leading-relaxed">
          Downloading saves the image to your device and deletes it from our servers to reduce storage costs.
        </p>
      )}
    </div>
  );
}
