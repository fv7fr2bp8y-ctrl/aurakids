export default function AuraLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="auraLogoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="100%" stopColor="#FFD93D" />
        </linearGradient>
      </defs>
      {/* Open book */}
      <path d="M24 36 C24 36 10 30 6 18 L6 14 C6 14 10 12 24 18 C38 12 42 14 42 14 L42 18 C38 30 24 36 24 36Z"
        fill="url(#auraLogoGrad)" opacity="0.95" />
      <path d="M24 36 L24 18" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Star above */}
      <path d="M24 5 L25.7 10.2 L31.2 10.2 L26.8 13.3 L28.5 18.5 L24 15.4 L19.5 18.5 L21.2 13.3 L16.8 10.2 L22.3 10.2Z"
        fill="white" opacity="0.97" />
    </svg>
  );
}
