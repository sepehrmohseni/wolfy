export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a0f] via-[#0d1117] to-[#0a0f1a] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 animate-spin" />
          <svg viewBox="0 0 32 32" className="absolute inset-2 w-12 h-12" aria-hidden="true">
            <path d="M7 25 L10 10 L14 17 L16 7 L18 17 L22 10 L25 25 Z" fill="#10b981" opacity="0.6" />
            <circle cx="12.5" cy="19" r="1.8" fill="#fbbf24" opacity="0.6" />
            <circle cx="19.5" cy="19" r="1.8" fill="#fbbf24" opacity="0.6" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm animate-pulse">Loading…</p>
      </div>
    </div>
  );
}
