const STEPS = [
  {
    n: "1",
    emoji: "✏️",
    title: "Назови героя",
    desc: "Въведи името на детето и на колко години е.",
    gradient: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
    glow: "rgba(255,107,107,0.35)",
    accent: "#FF6B6B",
  },
  {
    n: "2",
    emoji: "🌍",
    title: "Избери свят",
    desc: "Дракони, космос, вълшебна гора — или измисли свой.",
    gradient: "linear-gradient(135deg, #FFD93D 0%, #FF9A3C 100%)",
    glow: "rgba(255,217,61,0.35)",
    accent: "#F59E0B",
  },
  {
    n: "3",
    emoji: "✨",
    title: "Приказката се ражда",
    desc: "AI пише история само за вашето дете с уникални илюстрации.",
    gradient: "linear-gradient(135deg, #9B6FE8 0%, #6B35B8 100%)",
    glow: "rgba(155,111,232,0.35)",
    accent: "#9B6FE8",
  },
  {
    n: "4",
    emoji: "🎧",
    title: "Чуй я на глас",
    desc: "Топъл глас разказва приказката. Пазена е завинаги.",
    gradient: "linear-gradient(135deg, #4FC3F7 0%, #0284C7 100%)",
    glow: "rgba(79,195,247,0.35)",
    accent: "#0EA5E9",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6" style={{ background: "linear-gradient(180deg, #FFF8F0 0%, #F0E6FF 60%, #FFF8F0 100%)" }}>
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#9B6FE8" }}>
            Как работи
          </p>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight" style={{ color: "#1A0533" }}>
            Четири стъпки до<br />
            <span style={{ color: "#6B35B8" }}>вечер, която не се забравя</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative group">
              {/* Connector arrow for desktop */}
              {i < 3 && (
                <div className="hidden lg:block absolute -right-3.5 top-16 z-20 text-lg select-none"
                  style={{ color: s.accent, filter: "drop-shadow(0 0 4px " + s.glow + ")" }}>
                  ›
                </div>
              )}

              {/* Card */}
              <div className="h-full rounded-3xl overflow-hidden transition-transform duration-300 group-hover:-translate-y-1"
                style={{ boxShadow: `0 8px 32px ${s.glow}, 0 1px 0 rgba(255,255,255,0.9) inset` }}>

                {/* Top gradient strip with emoji */}
                <div className="relative flex items-center justify-center py-8"
                  style={{ background: s.gradient }}>
                  {/* Subtle radial glow behind emoji */}
                  <div className="absolute inset-0 opacity-30"
                    style={{ background: "radial-gradient(circle at 50% 60%, rgba(255,255,255,0.6) 0%, transparent 70%)" }} />
                  <span className="relative text-5xl drop-shadow-md">{s.emoji}</span>

                  {/* Step number badge */}
                  <div className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: "rgba(255,255,255,0.25)", color: "white", backdropFilter: "blur(4px)" }}>
                    {s.n}
                  </div>
                </div>

                {/* Text body */}
                <div className="px-5 py-5" style={{ background: "white" }}>
                  <h3 className="text-base font-bold mb-1.5" style={{ color: "#1A0533" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#7B6FA0" }}>{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
