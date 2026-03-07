'use client';

import { useState } from 'react';
import { Link2, Check, Download, Trash2 } from 'lucide-react';

interface Props {
  wolfId: string;
  archetypeName: string;
  hasImage: boolean;
  shareUrl: string;
}

export function WolfOwnerActions({ wolfId, archetypeName, hasImage, shareUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [imageDeleted, setImageDeleted] = useState(false);

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
      a.download = `${archetypeName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (res.headers.get('X-Image-Deleted') === 'true') {
        setImageDeleted(true);
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex gap-3 mt-6">
      {hasImage && !imageDeleted && (
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Downloading…' : 'Download'}
        </button>
      )}
      {imageDeleted && (
        <div className="flex-1 py-3 bg-amber-600/20 text-amber-300 font-medium rounded-xl flex items-center justify-center gap-1.5 text-sm">
          <Trash2 className="w-4 h-4" /> Image saved & removed from cloud
        </div>
      )}
      <button
        onClick={handleCopy}
        className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" /> Copied!
          </>
        ) : (
          <>
            <Link2 className="w-4 h-4" /> Share Link
          </>
        )}
      </button>
    </div>
  );
}
