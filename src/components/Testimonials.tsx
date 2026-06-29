const TESTIMONIALS = [
  { name: "Мария К.", child: "мама на Александър, 5г.", text: "Сашко слуша приказката си всяка вечер. Разплака ме колко е красива — той е героят!", stars: 5 },
  { name: "Петър Д.", child: "татко на Ева, 4г.", text: "Не вярвах, но след като видях как Ева скочи от радост, станах фен. Качеството е невероятно.", stars: 5 },
  { name: "Ивана С.", child: "мама на Никола, 6г.", text: "По-добър подарък от всяка играчка — нещо, което е само негово. Препоръчвам горещо!", stars: 5 },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6" style={{ background: "#3B1A6B" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-3">Родителите разказват</h2>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>Реални истории от деца, станали герои</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-3xl p-7 card-hover"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#FFD93D">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-base leading-relaxed mb-5 italic" style={{ color: "rgba(255,255,255,0.78)" }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <div className="font-semibold text-white text-sm">{t.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{t.child}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
