const STEPS = [
  { icon: "✍️", title: "Въведи името", desc: "Напиши името на детето и избери тема.", color: "#FF6B6B" },
  { icon: "🪄", title: "AI създава", desc: "Уникална приказка се ражда за секунди.", color: "#FFD93D" },
  { icon: "🎨", title: "Илюстрации", desc: "Красиви картинки оживяват историята.", color: "#9B6FE8" },
  { icon: "🔊", title: "Чуй на глас", desc: "Естествен глас разказва приказката.", color: "#4FC3F7" },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6" style={{ background: "#FFF8F0" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm font-medium"
            style={{ background: "rgba(107,53,184,0.1)", color: "#6B35B8" }}>
            🪄 Само 4 стъпки
          </div>
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#3B1A6B" }}>
            Как работи?
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative rounded-3xl p-6 card-hover text-center"
              style={{ background: "#fff", border: "2px solid", borderColor: `${s.color}30`, boxShadow: `0 8px 24px ${s.color}15` }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: s.color }}>
                {i + 1}
              </div>
              <div className="text-4xl mt-2 mb-4">{s.icon}</div>
              <h3 className="font-bold mb-1 text-sm" style={{ color: "#3B1A6B" }}>{s.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "#7B6FA0" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
