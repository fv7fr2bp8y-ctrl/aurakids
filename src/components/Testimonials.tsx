const TESTIMONIALS = [
  {
    name: "Мария К.",
    role: "мама на Александър, 5 г.",
    text: "Сашко слуша приказката си всяка вечер преди сън. Трябваше ми да го успокоя — не исках да плача пред него. Толкова е красиво, че именно той е героят.",
    stars: 5,
    initial: "М",
    color: "#FF6B6B",
  },
  {
    name: "Петър Д.",
    role: "татко на Ева, 4 г.",
    text: "Скептичен бях, честно. Но когато видях как Ева скочи от радост, когато чу името си в приказката — станах фен за цял живот. Качеството е невероятно.",
    stars: 5,
    initial: "П",
    color: "#9B6FE8",
  },
  {
    name: "Ивана С.",
    role: "мама на Никола, 6 г.",
    text: "По-добър подарък от всяка играчка. Никола моли за нова приказка всяка седмица. Вече имаме цяла колекция — само негови, само за него.",
    stars: 5,
    initial: "И",
    color: "#FFD93D",
  },
];

export default function Testimonials() {
  return (
    <section className="py-28 px-6" style={{ background: "#1A0533" }}>
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-20">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#9B6FE8" }}>
            Родителите разказват
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Деца, станали герои
            <br />
            <span style={{
              background: "linear-gradient(90deg, #FF6B6B, #FFD93D)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>на собствената си история</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name}
              className="rounded-3xl p-8 card-hover flex flex-col"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#FFD93D">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-base leading-relaxed flex-1 mb-8"
                style={{ color: "rgba(255,255,255,0.75)", fontStyle: "italic", lineHeight: 1.8 }}>
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: `${t.color}22`, color: t.color, border: `1.5px solid ${t.color}44` }}>
                  {t.initial}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-16 text-center">
          {[
            ["1 200+", "приказки създадени"],
            ["4.9 / 5", "средна оценка"],
            ["98%", "биха препоръчали"],
          ].map(([num, label]) => (
            <div key={label}>
              <div className="text-3xl font-bold" style={{
                background: "linear-gradient(135deg, #FF6B6B, #FFD93D)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>{num}</div>
              <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
