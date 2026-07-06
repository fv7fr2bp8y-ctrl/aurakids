// Custom mini icon set — replaces emoji in the core UI for a cleaner, premium feel.
// All icons inherit `currentColor` and scale with the `size` prop.

type IconProps = { size?: number; className?: string };

export function Sparkle({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2c.4 3.6 1.8 5 5.4 5.4C13.8 7.8 12.4 9.2 12 12.8c-.4-3.6-1.8-5-5.4-5.4C10.2 7 11.6 5.6 12 2Z" />
      <path d="M18.5 13c.2 1.9.9 2.6 2.8 2.8-1.9.2-2.6.9-2.8 2.8-.2-1.9-.9-2.6-2.8-2.8 1.9-.2 2.6-.9 2.8-2.8Z" opacity=".7" />
      <path d="M6 15c.15 1.5.7 2 2.2 2.2C6.7 17.3 6.15 17.9 6 19.4c-.15-1.5-.7-2-2.2-2.2C5.3 17 5.85 16.5 6 15Z" opacity=".5" />
    </svg>
  );
}

export function Comic({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 19.3 7.2 16.7l.9-5.4L4.2 7.5l5.4-.8L12 2Z" />
    </svg>
  );
}

export function Moon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

export function Library({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2 2 2 0 0 1 2-2h4.5A1.5 1.5 0 0 1 20 5.5V18a1 1 0 0 1-1 1h-5a2 2 0 0 0-2 2 2 2 0 0 0-2-2H5a1 1 0 0 1-1-1V5.5Z" />
      <path d="M12 6v15" />
    </svg>
  );
}

export function Check({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
