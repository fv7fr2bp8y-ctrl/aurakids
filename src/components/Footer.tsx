export default function Footer() {
  return (
    <footer className="py-12 px-4 text-center" style={{ background: "#1a1a2e" }}>
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-2xl">🌟</span>
        <span className="text-xl font-bold text-white">AuraKids</span>
      </div>
      <p className="text-sm mb-2" style={{ color: "#6060a0" }}>
        Магически приказки, специално за твоето дете
      </p>
      <p className="text-xs" style={{ color: "#404060" }}>
        © 2025 AuraKids · aurakids.fun
      </p>
    </footer>
  );
}
