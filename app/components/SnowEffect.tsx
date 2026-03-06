'use client';

export function SnowEffect() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${(i * 2.5) % 100}%`,
    delay: `${(i * 0.5) % 12}s`,
    duration: `${10 + (i % 8) * 3}s`,
    size: 1 + (i % 4),
    opacity: 0.1 + (i % 5) * 0.06,
  }));

  return (
    <div
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Snow particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white snow-particle"
          style={{
            left: p.left,
            top: '-10px',
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      {/* Fireflies / ambient glow */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={`ff-${i}`}
          className="absolute rounded-full firefly"
          style={{
            left: `${15 + i * 20}%`,
            top: `${30 + (i % 3) * 25}%`,
            width: 4,
            height: 4,
            backgroundColor: '#34d399',
            animationDelay: `${i * 1.5}s`,
          }}
        />
      ))}

      {/* Forest silhouette */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
        style={{ height: '80px' }}
      >
        <path
          d="M0,100 L0,70 L30,35 L60,65 L90,25 L120,55 L150,30 L180,60 L210,20 L240,50 L270,35 L300,65 L330,25 L360,55 L390,30 L420,60 L450,20 L480,50 L510,35 L540,65 L570,25 L600,50 L630,30 L660,55 L690,20 L720,50 L750,35 L780,60 L810,25 L840,55 L870,30 L900,60 L930,20 L960,50 L990,35 L1020,60 L1050,25 L1080,55 L1110,30 L1140,55 L1170,35 L1200,50 L1200,100 Z"
          fill="#071a0f"
        />
        <path
          d="M0,100 L0,80 L40,50 L80,75 L120,40 L160,70 L200,45 L240,72 L280,38 L320,65 L360,48 L400,75 L440,42 L480,68 L520,45 L560,72 L600,35 L640,65 L680,48 L720,70 L760,40 L800,68 L840,45 L880,72 L920,38 L960,65 L1000,48 L1040,70 L1080,42 L1120,65 L1160,48 L1200,60 L1200,100 Z"
          fill="#0d2818"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}
