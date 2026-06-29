const STEPS = [
  {
    number: "01",
    title: "Назови героя",
    desc: "Въведи името на детето. Само то ще е главният герой — никой друг.",
    color: "#FF6B6B",
    accent: "rgba(255,107,107,0.12)",
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="22" r="12" fill="#FF6B6B" opacity="0.15" />
        <circle cx="32" cy="22" r="8" fill="#FF6B6B" opacity="0.8" />
        <path d="M16 48 C16 38 48 38 48 48" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        {/* Crown */}
        <path d="M24 16 L27 10 L32 14 L37 10 L40 16" stroke="#FFD93D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Sparkles */}
        <circle cx="12" cy="18" r="2" fill="#FFD93D" opacity="0.6" />
        <circle cx="52" cy="24" r="1.5" fill="#FFD93D" opacity="0.5" />
        <circle cx="48" cy="14" r="1" fill="#FF6B6B" opacity="0.7" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Избери тема",
    desc: "Дракони, космос, феи, подводен свят — 6 вълшебни свята чакат.",
    color: "#FFD93D",
    accent: "rgba(255,217,61,0.10)",
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        {/* Book */}
        <rect x="12" y="18" width="18" height="28" rx="3" fill="#FFD93D" opacity="0.8" />
        <rect x="34" y="18" width="18" height="28" rx="3" fill="#FFD93D" opacity="0.5" />
        <path d="M30 18 L30 46" stroke="#3B1A6B" strokeWidth="2" opacity="0.3" />
        {/* Star */}
        <path d="M32 6 L34 11 L40 11 L35 14.5 L37 20 L32 16.5 L27 20 L29 14.5 L24 11 L30 11Z" fill="#FFD93D" opacity="0.9" />
        {/* Magic lines on book */}
        <path d="M16 26 L26 26" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M16 30 L24 30" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <path d="M16 34 L22 34" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "AI ражда магия",
    desc: "Клод Хайку пише уникална история. Приказки с дракони, замъци и геройства.",
    color: "#9B6FE8",
    accent: "rgba(155,111,232,0.10)",
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        {/* Wand */}
        <line x1="14" y1="50" x2="42" y2="22" stroke="#9B6FE8" strokeWidth="3" strokeLinecap="round" />
        <circle cx="42" cy="22" r="6" fill="#9B6FE8" opacity="0.8" />
        <circle cx="42" cy="22" r="3" fill="white" opacity="0.9" />
        {/* Sparkles */}
        <path d="M50 12 L51.5 15 L55 12 L51.5 9Z" fill="#FFD93D" opacity="0.8" />
        <path d="M54 22 L55 24.5 L57.5 22 L55 19.5Z" fill="#FF6B6B" opacity="0.7" />
        <path d="M44 8 L45 10.5 L47.5 8 L45 5.5Z" fill="#4FC3F7" opacity="0.8" />
        <circle cx="18" cy="44" r="2" fill="#FFD93D" opacity="0.5" />
        <circle cx="24" cy="52" r="1.5" fill="#9B6FE8" opacity="0.4" />
        <path d="M30 44 L31.2 47 L34.5 44 L31.2 41Z" fill="#FFD93D" opacity="0.6" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Чуй и пази",
    desc: "Истински глас разчита приказката. Запази я и слушай всяка вечер.",
    color: "#4FC3F7",
    accent: "rgba(79,195,247,0.10)",
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        {/* Speaker */}
        <rect x="14" y="24" width="12" height="16" rx="3" fill="#4FC3F7" opacity="0.8" />
        <path d="M26 22 C30 18 30 46 26 42" stroke="#4FC3F7" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />
        {/* Sound waves */}
        <path d="M34 26 C38 28 38 36 34 38" stroke="#4FC3F7" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M40 22 C46 26 46 38 40 42" stroke="#4FC3F7" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.4" />
        <path d="M46 18 C54 24 54 40 46 46" stroke="#4FC3F7" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.2" />
        {/* Stars */}
        <circle cx="12" cy="16" r="2" fill="#FFD93D" opacity="0.6" />
        <circle cx="52" cy="14" r="1.5" fill="#FFD93D" opacity="0.5" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="py-28 px-6" style={{ background: "linear-gradient(180deg, #FFF8F0 0%, #F5EEFF 100%)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#9B6FE8" }}>
            Как работи
          </p>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight" style={{ color: "#1A0533" }}>
            Четири стъпки до
            <br />
            <span style={{ color: "#6B35B8" }}>незабравима вечер</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.number} className="relative rounded-3xl p-7 card-hover group"
              style={{
                background: "#fff",
                border: "1.5px solid",
                borderColor: `${s.color}22`,
                boxShadow: `0 4px 24px ${s.color}10`,
              }}>
              {/* Step number */}
              <div className="text-xs font-bold mb-6 tracking-widest" style={{ color: `${s.color}99` }}>
                {s.number}
              </div>

              {/* Icon */}
              <div className="mb-6 w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: s.accent }}>
                {s.icon}
              </div>

              <h3 className="text-base font-bold mb-2" style={{ color: "#1A0533" }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#7B6FA0" }}>{s.desc}</p>

              {/* Connector arrow (not last) */}
              {i < 3 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-xl"
                  style={{ color: `${s.color}55` }}>
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
