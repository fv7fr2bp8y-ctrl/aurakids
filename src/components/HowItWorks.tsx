const STEPS = [
  {
    n: "1",
    title: "Назови героя",
    desc: "Въведи името на детето и на колко години е. Само то ще е главният герой на историята.",
    color: "#FF6B6B",
    bg: "rgba(255,107,107,0.08)",
  },
  {
    n: "2",
    title: "Избери свят",
    desc: "Дракони, вълшебна гора, космос, подводно царство — избирате заедно в кой свят да се впуснете.",
    color: "#FFD93D",
    bg: "rgba(255,217,61,0.08)",
  },
  {
    n: "3",
    title: "Приказката се ражда",
    desc: "AI пише история само за вашето дете — с него като герой, с уникални илюстрации.",
    color: "#9B6FE8",
    bg: "rgba(155,111,232,0.08)",
  },
  {
    n: "4",
    title: "Чуй я на глас",
    desc: "Топъл глас разказва приказката. Слушайте я заедно всяка вечер — запазена е завинаги.",
    color: "#4FC3F7",
    bg: "rgba(79,195,247,0.08)",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6" style={{ background: "linear-gradient(180deg, #FFF8F0 0%, #F5EEFF 100%)" }}>
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#9B6FE8" }}>
            Как работи
          </p>
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#1A0533" }}>
            Четири стъпки до<br />
            <span style={{ color: "#6B35B8" }}>вечер, която не се забравя</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative rounded-2xl p-6 card-hover"
              style={{ background: "#fff", border: `1.5px solid ${s.color}25`, boxShadow: `0 4px 20px ${s.color}12` }}>

              {/* Big number */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-2xl font-black"
                style={{ background: s.bg, color: s.color }}>
                {s.n}
              </div>

              <h3 className="text-base font-bold mb-2" style={{ color: "#1A0533" }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#7B6FA0" }}>{s.desc}</p>

              {i < 3 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full items-center justify-center text-xs font-bold"
                  style={{ background: s.color, color: "white" }}>
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
