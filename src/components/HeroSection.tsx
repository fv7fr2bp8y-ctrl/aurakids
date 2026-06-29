"use client";

function AuraLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="100%" stopColor="#FFD93D" />
        </linearGradient>
      </defs>
      {/* Open book */}
      <path d="M24 36 C24 36 10 30 6 18 L6 14 C6 14 10 12 24 18 C38 12 42 14 42 14 L42 18 C38 30 24 36 24 36Z"
        fill="url(#logoGrad)" opacity="0.9" />
      <path d="M24 36 L24 18" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
      {/* Star above */}
      <path d="M24 6 L25.5 10 L30 10 L26.5 12.5 L28 16.5 L24 14 L20 16.5 L21.5 12.5 L18 10 L22.5 10Z"
        fill="white" opacity="0.95" />
    </svg>
  );
}

interface HeroSectionProps {
  onStart: () => void;
}

const STORY_LINES = [
  "Имало едно време храбро момче",
  "на име Александър, което живеело...",
  "в магическо кралство, пълно с дракони",
  "и вълшебни съкровища...",
];

export default function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(26,5,51,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <AuraLogo size={36} />
          <span className="text-xl font-bold text-white tracking-tight">AuraKids</span>
        </div>
        <button
          onClick={onStart}
          className="px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #FF6B6B, #FFD93D)", color: "#3B1A6B" }}
        >
          Създай приказка
        </button>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20"
        style={{ background: "linear-gradient(160deg, #1A0533 0%, #3B1A6B 50%, #6B35B8 100%)" }}>

        <div className="absolute inset-0 stars-bg pointer-events-none opacity-60" />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,107,107,0.12), transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,217,61,0.10), transparent)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
          {/* Left */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium"
              style={{ background: "rgba(255,217,61,0.15)", color: "#FFD93D", border: "1px solid rgba(255,217,61,0.3)" }}>
              Магически персонализирани приказки
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
              Приказка само
              <br />
              <span className="shimmer-text">за твоето дете</span>
            </h1>

            <p className="text-lg md:text-xl mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
              Въведи името му и за секунди се ражда вълшебна история — с него като герой, уникални илюстрации и глас.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <button
                onClick={onStart}
                className="px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #FF6B6B, #FFD93D)",
                  color: "#3B1A6B",
                  boxShadow: "0 8px 32px rgba(255,107,107,0.35)",
                }}
              >
                Създай безплатно
              </button>
              <div className="flex items-center gap-3 py-2">
                <div className="flex -space-x-2">
                  {["#FF6B6B", "#9B6FE8", "#4FC3F7"].map((c) => (
                    <div key={c} className="w-9 h-9 rounded-full border-2 border-purple-900"
                      style={{ background: c, opacity: 0.85 }} />
                  ))}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">1,200+ приказки</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>създадени тази седмица</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 mt-8">
              {[["Безплатно", "#FF6B6B"], ["На български", "#FFD93D"], ["30 секунди", "#4FC3F7"]].map(([label, color]) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: animated story card */}
          <div className="relative flex items-center justify-center animate-scale-in">
            <div className="relative w-full max-w-md"
              style={{ filter: "drop-shadow(0 32px 64px rgba(0,0,0,0.5))" }}>

              {/* Main card */}
              <div className="rounded-3xl overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, rgba(59,26,107,0.95), rgba(26,5,51,0.98))",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(20px)",
                }}>

                {/* Card header */}
                <div className="px-6 pt-6 pb-4 flex items-center justify-between"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center gap-2">
                    <AuraLogo size={22} />
                    <span className="text-sm font-semibold text-white/80">AuraKids</span>
                  </div>
                  <div className="flex gap-1.5">
                    {["#FF6B6B", "#FFD93D", "#4ADE80"].map((c) => (
                      <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.7 }} />
                    ))}
                  </div>
                </div>

                {/* Story illustration area */}
                <div className="relative mx-5 mt-5 rounded-2xl overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #2D0F55, #6B35B8)", height: 160 }}>
                  {/* Stars */}
                  {[[15, 20], [70, 15], [85, 50], [30, 70], [60, 80], [45, 35]].map(([x, y], i) => (
                    <div key={i} className="absolute animate-twinkle rounded-full bg-white"
                      style={{ left: `${x}%`, top: `${y}%`, width: i % 2 === 0 ? 3 : 2, height: i % 2 === 0 ? 3 : 2, animationDelay: `${i * 0.4}s` }} />
                  ))}
                  {/* Moon */}
                  <div className="absolute top-4 right-6 w-10 h-10 rounded-full animate-float-slow"
                    style={{ background: "radial-gradient(circle at 35% 35%, #FFD93D, #FF8C00)", opacity: 0.9 }} />
                  {/* Child silhouette */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    {/* Head */}
                    <div className="w-8 h-8 rounded-full mb-0"
                      style={{ background: "linear-gradient(135deg, #FFD093, #FFA07A)" }} />
                    {/* Body / cape */}
                    <div className="w-12 h-10 rounded-t-2xl"
                      style={{ background: "linear-gradient(180deg, #9B6FE8, #6B35B8)" }} />
                  </div>
                  {/* Dragon silhouette */}
                  <svg className="absolute left-4 bottom-2 animate-float" style={{ animationDelay: "1s" }}
                    width="48" height="40" viewBox="0 0 48 40" fill="none">
                    <path d="M8 32 C4 28 4 20 10 18 C8 14 12 10 16 12 C18 8 24 6 28 10 C32 6 38 8 40 14 C44 16 46 22 42 26 C40 30 36 32 30 30 L24 38 L18 30 C12 34 10 34 8 32Z"
                      fill="#4ADE80" opacity="0.7" />
                    <circle cx="32" cy="14" r="2" fill="#FFD93D" />
                  </svg>
                  {/* Sparkles */}
                  <svg className="absolute right-8 top-8 animate-twinkle" style={{ animationDelay: "0.8s" }}
                    width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill="#FFD93D" opacity="0.8" />
                  </svg>
                </div>

                {/* Story text lines */}
                <div className="px-6 py-5 space-y-2.5">
                  <div className="text-xs font-semibold mb-3" style={{ color: "#FFD93D" }}>
                    Приказката на Александър
                  </div>
                  {STORY_LINES.map((line, i) => (
                    <div key={i} className="h-3 rounded-full"
                      style={{
                        background: i < 2 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)",
                        width: i === 0 ? "90%" : i === 1 ? "75%" : i === 2 ? "85%" : "55%",
                      }} />
                  ))}
                </div>

                {/* Controls */}
                <div className="px-6 pb-6 flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                    style={{ background: "linear-gradient(135deg, #FF6B6B, #FFD93D)", color: "#3B1A6B" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Чуй историята
                  </button>
                  <div className="flex gap-2 ml-auto">
                    {[
                      <path key="copy" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6l1 3H8z" />,
                      <path key="share" d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />,
                    ].map((p, i) => (
                      <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.07)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                          {p}
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 glass-dark rounded-2xl px-4 py-2.5 animate-float"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Тема</div>
                <div className="text-sm font-bold text-white">Дракони</div>
              </div>

              <div className="absolute -bottom-4 -left-4 glass-dark rounded-2xl px-4 py-2.5 animate-float"
                style={{ border: "1px solid rgba(255,255,255,0.1)", animationDelay: "1.5s" }}>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Герой</div>
                <div className="text-sm font-bold text-white">Александър</div>
              </div>
            </div>

            <div className="absolute -inset-6 rounded-3xl border opacity-10 animate-spin-slow pointer-events-none"
              style={{ borderColor: "#FFD93D", borderStyle: "dashed" }} />
          </div>
        </div>
      </section>
    </>
  );
}
