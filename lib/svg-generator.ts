export function generateWolfSVG(params: {
  archetypeName: string;
  rarity: string;
  seed: string;
  terrain?: string;
}): string {
  const { archetypeName, rarity, seed, terrain } = params;

  // Deterministic values from seed hex
  const h1 = parseInt(seed.slice(0, 2), 16) % 360;
  const h2 = parseInt(seed.slice(2, 4), 16) % 360;
  const size1 = 20 + (parseInt(seed.slice(4, 6), 16) % 30);
  const size2 = 15 + (parseInt(seed.slice(6, 8), 16) % 25);
  const eyeColor =
    parseInt(seed.slice(8, 10), 16) % 2 === 0 ? '#fbbf24' : '#60a5fa';
  const earOffset = 10 + (parseInt(seed.slice(10, 12), 16) % 10);

  const rarityColors: Record<string, { glow: string; border: string; label: string }> = {
    common: { glow: '#4ade80', border: '#22c55e', label: '#86efac' },
    rare: { glow: '#818cf8', border: '#6366f1', label: '#a5b4fc' },
    legendary: { glow: '#f59e0b', border: '#d97706', label: '#fcd34d' },
  };
  const rc = rarityColors[rarity] || rarityColors.common;

  const terrainBgs: Record<string, [string, string]> = {
    'deep forest': ['#064e3b', '#022c22'],
    'snowy mountain': ['#1e3a5f', '#0f172a'],
    'misty valley': ['#312e81', '#1e1b4b'],
    'open plains': ['#365314', '#1a2e05'],
  };
  const [bgStart, bgEnd] =
    terrainBgs[terrain || 'deep forest'] || terrainBgs['deep forest'];

  // Deterministic snowflake/star positions from seed
  const particles = Array.from({ length: 12 }, (_, i) => {
    const px =
      ((parseInt(seed.slice(i % 16, i % 16 + 2), 16) || 50) / 255) * 280 + 10;
    const py =
      ((parseInt(seed.slice((i + 3) % 16, (i + 3) % 16 + 2), 16) || 50) /
        255) *
        120 +
      10;
    const pr =
      1 + ((parseInt(seed.slice((i + 5) % 16, (i + 5) % 16 + 1), 16) || 1) % 3);
    return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${pr}" fill="white" opacity="${(0.2 + (i % 4) * 0.15).toFixed(2)}"/>`;
  }).join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400" role="img" aria-label="Wolf avatar: ${escapeXml(archetypeName)}">
  <defs>
    <linearGradient id="bg-${seed.slice(0, 6)}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${bgStart}"/>
      <stop offset="100%" stop-color="${bgEnd}"/>
    </linearGradient>
    <radialGradient id="glow-${seed.slice(0, 6)}" cx="50%" cy="60%" r="50%">
      <stop offset="0%" stop-color="${rc.glow}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${rc.glow}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fur-${seed.slice(0, 6)}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${h1}, 30%, 35%)"/>
      <stop offset="100%" stop-color="hsl(${h2}, 25%, 20%)"/>
    </linearGradient>
    <filter id="shadow-${seed.slice(0, 6)}">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="${rc.glow}" flood-opacity="0.5"/>
    </filter>
  </defs>
  <rect width="300" height="400" rx="16" fill="url(#bg-${seed.slice(0, 6)})"/>
  <rect width="300" height="400" rx="16" fill="url(#glow-${seed.slice(0, 6)})"/>
  <g>
    ${particles}
  </g>
  <polygon points="30,280 40,200 50,280" fill="#0d3320" opacity="0.5"/>
  <polygon points="250,280 260,210 270,280" fill="#0d3320" opacity="0.5"/>
  <polygon points="15,280 28,220 41,280" fill="#0a2818" opacity="0.3"/>
  <polygon points="260,280 270,230 280,280" fill="#0a2818" opacity="0.3"/>
  <polygon points="60,280 70,230 80,280" fill="#0d3320" opacity="0.35"/>
  <polygon points="220,280 232,225 244,280" fill="#0d3320" opacity="0.35"/>
  <ellipse cx="150" cy="310" rx="120" ry="15" fill="rgba(255,255,255,0.05)"/>
  <g filter="url(#shadow-${seed.slice(0, 6)})" transform="translate(150, 180)">
    <polygon points="${-35 - earOffset},${-size1 - 40} ${-20},${-size1} ${-50},${-size1 + 5}" fill="url(#fur-${seed.slice(0, 6)})" stroke="${rc.border}" stroke-width="1"/>
    <polygon points="${35 + earOffset},${-size1 - 40} ${20},${-size1} ${50},${-size1 + 5}" fill="url(#fur-${seed.slice(0, 6)})" stroke="${rc.border}" stroke-width="1"/>
    <ellipse cx="0" cy="0" rx="${size1 + 15}" ry="${size1}" fill="url(#fur-${seed.slice(0, 6)})" stroke="${rc.border}" stroke-width="1.5"/>
    <ellipse cx="0" cy="${size2}" rx="${size2 - 5}" ry="${size2 - 8}" fill="hsl(${h1}, 20%, 28%)" opacity="0.8"/>
    <circle cx="-15" cy="-5" r="5" fill="${eyeColor}"/>
    <circle cx="15" cy="-5" r="5" fill="${eyeColor}"/>
    <circle cx="-15" cy="-5" r="2.5" fill="#000"/>
    <circle cx="15" cy="-5" r="2.5" fill="#000"/>
    <circle cx="-13" cy="-7" r="1.5" fill="white" opacity="0.8"/>
    <circle cx="17" cy="-7" r="1.5" fill="white" opacity="0.8"/>
    <ellipse cx="0" cy="${size2 - 2}" rx="5" ry="3.5" fill="#1a1a2e"/>
  </g>
  <rect x="95" y="290" width="110" height="24" rx="12" fill="${rc.border}" opacity="0.9"/>
  <text x="150" y="307" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="${rc.label}">${rarity.toUpperCase()}</text>
  <text x="150" y="345" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="white">${escapeXml(archetypeName)}</text>
  <rect width="300" height="400" rx="16" fill="none" stroke="${rc.border}" stroke-width="2" opacity="0.6"/>
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
