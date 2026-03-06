'use client';

import { useState } from 'react';

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
  wolfId: string;
}

interface Props {
  result: WolfResult;
}

export function WolfCard({ result }: Props) {
  const [copied, setCopied] = useState(false);
  const { archetype, svg, wolfId } = result;

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/wolf/${wolfId}`
      : `/wolf/${wolfId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          ✦ {archetype.rarity} ✦
        </p>
      </div>

      {/* Avatar SVG */}
      <div
        className={`flex justify-center mb-6 rounded-2xl overflow-hidden ${rs.glow}`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />

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
        <button
          onClick={handleCopy}
          className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-200"
        >
          {copied ? '✓ Copied!' : '🔗 Copy Share Link'}
        </button>
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors"
        >
          View
        </a>
      </div>
    </div>
  );
}
