const TESTIMONIALS = [
  {
    name: "Мария К.",
    child: "мама на Александър, 5г.",
    text: "Сашко слуша приказката си всяка вечер преди сън. Разплака ме колко е красива — той е героят, спасява дракона и печели приятел!",
    emoji: "🌟",
  },
  {
    name: "Петър Д.",
    child: "татко на Ева, 4г.",
    text: "Не вярвах, но след като видях как Ева скочи от радост като видя себе си в приказката, станах фен. Качеството е невероятно.",
    emoji: "💜",
  },
  {
    name: "Ивана С.",
    child: "мама на Никола, 6г.",
    text: "Подарихме на Коли персонализирана приказка за рождения му ден. По-добър подарък от всяка играчка — нещо, което е само негово.",
    emoji: "✨",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-4" style={{ background: "linear-gradient(180deg, #faf7f2 0%, #f0e6ff 100%)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" style={{ color: "#1a1a2e" }}>
            Родителите разказват
          </h2>
          <p className="text-lg" style={{ color: "#6060a0" }}>
            Реални истории от деца, станали герои
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="glass rounded-3xl p-8 transition-transform hover:-translate-y-1"
              style={{ border: "1px solid rgba(168, 85, 247, 0.15)" }}
            >
              <div className="text-3xl mb-4">{t.emoji}</div>
              <p className="text-base leading-relaxed mb-6 italic" style={{ color: "#4a4a6a" }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <div className="font-semibold" style={{ color: "#1a1a2e" }}>{t.name}</div>
                <div className="text-sm" style={{ color: "#9090a0" }}>{t.child}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
