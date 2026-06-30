export default function AuraLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ background: "transparent", display: "block" }}>
      <defs>
        <radialGradient id="portal-inner" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2D0A5E" />
          <stop offset="100%" stopColor="#0D0024" />
        </radialGradient>
        <linearGradient id="portal-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="40%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#FFD93D" />
        </linearGradient>
        <radialGradient id="portal-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9B6FE8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#9B6FE8" stopOpacity="0" />
        </radialGradient>
        <clipPath id="portal-clip">
          <circle cx="28" cy="28" r="21" />
        </clipPath>
      </defs>

      {/* Outer glow */}
      <circle cx="28" cy="28" r="28" fill="url(#portal-glow)" />

      {/* Ring */}
      <circle cx="28" cy="28" r="24" stroke="url(#portal-ring)" strokeWidth="3" fill="none" />

      {/* Inner space */}
      <circle cx="28" cy="28" r="21" fill="url(#portal-inner)" />

      {/* Stars inside */}
      <g clipPath="url(#portal-clip)">
        <circle cx="18" cy="18" r="1" fill="white" opacity="0.9" />
        <circle cx="36" cy="14" r="0.8" fill="white" opacity="0.7" />
        <circle cx="40" cy="24" r="1" fill="white" opacity="0.8" />
        <circle cx="14" cy="32" r="0.7" fill="white" opacity="0.6" />
        <circle cx="38" cy="36" r="0.8" fill="white" opacity="0.7" />
        <circle cx="22" cy="38" r="0.6" fill="white" opacity="0.5" />
        <circle cx="32" cy="40" r="0.5" fill="white" opacity="0.4" />

        {/* Castle silhouette */}
        <path d="M21 36 L21 30 L23 30 L23 28 L25 28 L25 26 L27 26 L27 28 L29 28 L29 26 L31 26 L31 28 L33 28 L33 30 L35 30 L35 36 Z"
          fill="rgba(255,255,255,0.25)" />
        <path d="M24 30 L24 26 L26 26 L26 30 Z" fill="rgba(255,255,255,0.15)" />
        <path d="M30 30 L30 26 L32 26 L32 30 Z" fill="rgba(255,255,255,0.15)" />

        {/* Golden center star */}
        <path d="M28 18 L28.9 21 L32 21 L29.5 22.8 L30.4 25.8 L28 24 L25.6 25.8 L26.5 22.8 L24 21 L27.1 21 Z"
          fill="#FFD93D" opacity="0.95" />
      </g>

      {/* Inner ring shimmer */}
      <circle cx="28" cy="28" r="21" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" fill="none" />
    </svg>
  );
}
