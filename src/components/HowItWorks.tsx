const STEPS = [
  {
    icon: "✍️",
    title: "Въведи името",
    description: "Напиши името на детето, избери тема и настрой вълшебното.",
    color: "#7c3aed",
    bg: "rgba(124, 58, 237, 0.08)",
  },
  {
    icon: "🪄",
    title: "AI създава приказката",
    description: "За секунди се ражда уникална история с детето като главен герой.",
    color: "#ec4899",
    bg: "rgba(236, 72, 153, 0.08)",
  },
  {
    icon: "🎨",
    title: "Илюстрации оживяват",
    description: "Всяка приказка получава красиви илюстрации, специално генерирани за нея.",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.08)",
  },
  {
    icon: "💝",
    title: "Подари магията",
    description: "Разпечатай, запази или сподели — нещо специално, само за него.",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.08)",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-4" style={{ background: "#faf7f2" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" style={{ color: "#1a1a2e" }}>
            Как работи?
          </h2>
          <p className="text-lg" style={{ color: "#6060a0" }}>
            Четири прости стъпки до вашата вълшебна приказка
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-3xl p-6 transition-transform hover:-translate-y-1"
              style={{ background: step.bg, border: `1px solid ${step.color}20` }}
            >
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: step.color }}>
                {i + 1}
              </div>
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#1a1a2e" }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6060a0" }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
