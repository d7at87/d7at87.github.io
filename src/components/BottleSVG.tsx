import { useId } from 'react'

interface Props {
  variant: 0 | 1 | 2
  accent: string
  liquid: string
  className?: string
}

const BODIES = [
  'M45,112 Q45,92 65,90 L135,90 Q155,92 155,112 L155,260 Q155,286 129,286 L71,286 Q45,286 45,260 Z',
  'M63,96 Q63,84 75,84 L125,84 Q137,84 137,96 L137,266 Q137,282 121,282 L79,282 Q63,282 63,266 Z',
  'M100,86 C141,86 163,120 163,172 C163,234 139,284 100,284 C61,284 37,234 37,172 C37,120 59,86 100,86 Z',
]

const LIQUIDS = [
  'M53,152 L147,152 L147,258 Q147,278 127,278 L73,278 Q53,278 53,258 Z',
  'M71,142 L129,142 L129,266 Q129,274 121,274 L79,274 Q71,274 71,266 Z',
  'M100,142 C128,142 149,162 149,192 C149,234 128,272 100,272 C72,272 51,234 51,192 C51,162 72,142 100,142 Z',
]

export default function BottleSVG({ variant, accent, liquid, className }: Props) {
  const uid = useId().replace(/:/g, '')
  const glassId = `glass-${uid}`
  const liquidId = `liquid-${uid}`
  const capId = `cap-${uid}`
  const glowId = `glow-${uid}`
  const studsId = `studs-${uid}`
  const clipId = `clip-${uid}`
  const blurId = `blur-${uid}`

  return (
    <svg viewBox="0 0 200 320" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id={glassId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={liquidId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={accent} />
          <stop offset="1" stopColor={liquid} />
        </linearGradient>
        <linearGradient id={capId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4a4a" />
          <stop offset="1" stopColor="#121212" />
        </linearGradient>
        <radialGradient id={glowId}>
          <stop offset="0" stopColor={accent} stopOpacity="0.45" />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <pattern id={studsId} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M10 0 L20 10 L10 20 L0 10 Z" fill="rgba(8,8,8,0.42)" stroke="rgba(255,255,255,0.30)" strokeWidth="1" />
        </pattern>
        <clipPath id={clipId}>
          <path d={BODIES[variant]} />
        </clipPath>
        <filter id={blurId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      <ellipse cx="100" cy="302" rx="58" ry="9" fill="#000" opacity="0.45" />
      <circle cx="100" cy="185" r="95" fill={`url(#${glowId})`} opacity="0.6" />

      <rect x="76" y="16" width="48" height="36" rx="6" fill={`url(#${capId})`} stroke="#00000066" />
      <line x1="76" y1="28" x2="124" y2="28" stroke="#ffffff14" />
      <line x1="76" y1="40" x2="124" y2="40" stroke="#ffffff14" />

      <path d="M72,52 L128,52 L136,86 L64,86 Z" fill={`url(#${capId})`} stroke="#00000066" />
      {[84, 100, 116].map((x) => (
        <g key={x} transform={`translate(${x} 68) rotate(45)`}>
          <rect x="-5" y="-5" width="10" height="10" fill="#2e2e2e" stroke="#6b6b6b" strokeWidth="0.8" />
        </g>
      ))}

      <path d={BODIES[variant]} fill={`url(#${glassId})`} stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />

      <g clipPath={`url(#${clipId})`}>
        <path d={LIQUIDS[variant]} fill={`url(#${liquidId})`} />
        <path d={LIQUIDS[variant]} fill={accent} opacity="0.4" filter={`url(#${blurId})`} />
        <rect x="30" y="80" width="140" height="210" fill={`url(#${studsId})`} />
        <rect x="58" y="98" width="9" height="168" rx="4.5" fill="#ffffff" opacity="0.16" />
        <rect x="72" y="98" width="4" height="168" rx="2" fill="#ffffff" opacity="0.1" />
      </g>
    </svg>
  )
}
