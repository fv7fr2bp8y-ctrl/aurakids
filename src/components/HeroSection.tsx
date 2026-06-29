"use client";

interface HeroSectionProps {
  onStart: () => void;
}

const FLOATING_EMOJIS = [
  { emoji: "⭐", style: "top-16 left-8 text-3xl delay-0" },
  { emoji: "🌙", style: "top-32 right-12 text-4xl delay-300" },
  { emoji: "✨", style: "top-48 left-1/4 text-2xl delay-700" },
  { emoji: "🦋", style: "bottom-32 left-16 text-3xl delay-500" },
  { emoji: "🌟", style: "bottom-16 right-1/4 text-4xl delay-200" },
  { emoji: "🪄", style: "top-24 right-1/3 text-3xl delay-900" },
];

export default function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4"
      style={{ background: "linear-gradient(135deg, #faf7f2 0%, #f0e6ff 50%, #fce7f3 100%)" }}>

      {/* Floating background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #ec4899, transparent)" }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />
      </div>

      {/* Floating emojis */}
      {FLOATING_EMOJIS.map(({ emoji, style }) => (
        <span
          key={emoji}
          className={`absolute animate-float select-none pointer-events-none ${style}`}
        >
          {emoji}
        </span>
      ))}

      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌟</span>
          <span className="text-xl font-bold" style={{ color: "#7c3aed" }}>AuraKids</span>
        </div>
        <button
          onClick={onStart}
          className="text-sm font-medium px-4 py-2 rounded-full transition-all"
          style={{ background: "rgba(124, 58, 237, 0.1)", color: "#7c3aed" }}
        >
          Създай приказка →
        </button>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium"
          style={{ background: "rgba(168, 85, 247, 0.12)", color: "#7c3aed" }}>
          <span>✨</span>
          <span>Магия, създадена специално за твоето дете</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span style={{ color: "#1a1a2e" }}>Приказка само</span>
          <br />
          <span className="shimmer-text">за твоето дете</span>
        </h1>

        <p className="text-xl md:text-2xl mb-10 leading-relaxed" style={{ color: "#4a4a6a" }}>
          Въведи името на детето и гледай как се ражда вълшебна история —
          <br className="hidden md:block" />
          с него като главен герой и уникални илюстрации.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onStart}
            className="group relative px-8 py-4 rounded-2xl text-lg font-semibold text-white transition-all duration-300 hover:scale-105 animate-pulse-glow"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
          >
            <span className="relative z-10 flex items-center gap-2">
              🪄 Създай безплатна приказка
            </span>
          </button>
        </div>

        <p className="mt-6 text-sm" style={{ color: "#9090a0" }}>
          Без регистрация · Безплатно · На български
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs" style={{ color: "#9090a0" }}>Разгледай</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12M4 10l6 6 6-6" stroke="#9090a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
