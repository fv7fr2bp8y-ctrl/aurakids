export default function Footer() {
  return (
    <footer className="py-14 px-6 text-center" style={{ background: "#1A0533" }}>
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="text-2xl">🌟</span>
        <span className="text-xl font-bold text-white">AuraKids</span>
      </div>
      <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
        Магически приказки, специално за твоето дете
      </p>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
        © 2025 AuraKids · aurakids.fun
      </p>
    </footer>
  );
}
