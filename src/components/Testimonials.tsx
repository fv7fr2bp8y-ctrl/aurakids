const TESTIMONIALS = [
  { name: "Мария К.", child: "мама на Александър, 5г.", text: "Сашко слуша приказката си всяка вечер. Разплака ме колко е красива — той е героят!", emoji: "💜", stars: 5 },
  { name: "Петър Д.", child: "татко на Ева, 4г.", text: "Не вярвах, но след като видях как Ева скочи от радост, станах фен. Качеството е невероятно.", emoji: "⭐", stars: 5 },
  { name: "Ивана С.", child: "мама на Никола, 6г.", text: "По-добър подарък от всяка играчка — нещо, което е само негово. Препоръчвам горещо!", emoji: "✨", stars: 5 },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6" style={{ background: "#3B1A6B" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-3">Родителите разказват</h2>
          <p style={{ color: "rgba(255,255,255,0.6)" }}>Реални истории от деца, станали герои</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-3xl p-7 card-hover"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-base leading-relaxed mb-5 italic" style={{ color: "rgba(255,255,255,0.8)" }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{ background: "rgba(255,255,255,0.1)" }}>{t.emoji}</div>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{t.child}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
