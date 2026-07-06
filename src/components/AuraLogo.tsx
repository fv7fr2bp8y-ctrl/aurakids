export default function AuraLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ background: "transparent", display: "block", borderRadius: "50%" }}>
      <defs>
        <linearGradient id="ak-moon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFC93C" />
          <stop offset="100%" stopColor="#F2A61D" />
        </linearGradient>
        <linearGradient id="ak-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D8C8FA" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <radialGradient id="ak-bookglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE9A8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFE9A8" stopOpacity="0" />
        </radialGradient>
        <mask id="ak-crescent">
          <rect width="120" height="120" fill="white" />
          <circle cx="61" cy="33" r="24" fill="black" />
        </mask>
      </defs>

      {/* Cream disc */}
      <circle cx="60" cy="60" r="60" fill="#FFF8F0" />

      {/* Crescent moon */}
      <g mask="url(#ak-crescent)">
        <circle cx="43" cy="42" r="27" fill="url(#ak-moon)" />
        <circle cx="34" cy="36" r="4.5" fill="#E8930C" opacity="0.3" />
        <circle cx="29" cy="50" r="3" fill="#E8930C" opacity="0.3" />
        <circle cx="41" cy="23" r="2" fill="#E8930C" opacity="0.3" />
      </g>

      {/* Sparkles */}
      <path d="M86 18 C87.5 23 89 24.5 94 26 C89 27.5 87.5 29 86 34 C84.5 29 83 27.5 78 26 C83 24.5 84.5 23 86 18 Z" fill="#F5A623" />
      <path d="M76 41 C77 44.3 78 45.2 81 46 C78 46.8 77 47.7 76 51 C75 47.7 74 46.8 71 46 C74 45.2 75 44.3 76 41 Z" fill="#8B5CF6" />
      <circle cx="97" cy="40" r="3" fill="#F5A623" />

      {/* Glow rising from the pages */}
      <circle cx="60" cy="56" r="22" fill="url(#ak-bookglow)" />

      {/* Open book: pages */}
      <path d="M60 88 C50 79 40 77 32 80 L32 61 C40 55 52 57 60 65 Z" fill="#FFF3D6" />
      <path d="M60 88 C70 79 80 77 88 80 L88 61 C80 55 68 57 60 65 Z" fill="#FFEFC9" />
      <path d="M60 84 C51 76 42 74 35 76 L35 59 C42 54 53 56 60 63 Z" fill="#FFFBEA" />
      <path d="M60 84 C69 76 78 74 85 76 L85 59 C78 54 67 56 60 63 Z" fill="#FFF6DB" />

      {/* Open book: covers */}
      <path d="M60 94 C48 83 35 81 26 85 L26 63 C35 57 50 59 60 68 Z" fill="#3B1A6B" />
      <path d="M60 94 C72 83 85 81 94 85 L94 63 C85 57 70 59 60 68 Z" fill="#452080" />
      <rect x="58.4" y="66" width="3.2" height="27" rx="1.6" fill="#2B0E52" />

      {/* Gold star on the right cover */}
      <path d="M79 70 L81.2 74.6 L86.2 75.3 L82.6 78.8 L83.5 83.8 L79 81.4 L74.5 83.8 L75.4 78.8 L71.8 75.3 L76.8 74.6 Z" fill="#FFC93C" />

      {/* Fluffy cloud in front */}
      <ellipse cx="59" cy="94" rx="44" ry="13" fill="url(#ak-cloud)" />
      <circle cx="24" cy="88" r="10" fill="url(#ak-cloud)" />
      <circle cx="40" cy="94" r="12" fill="url(#ak-cloud)" />
      <circle cx="59" cy="97" r="12" fill="url(#ak-cloud)" />
      <circle cx="78" cy="94" r="12" fill="url(#ak-cloud)" />
      <circle cx="94" cy="88" r="9" fill="url(#ak-cloud)" />
    </svg>
  );
}
