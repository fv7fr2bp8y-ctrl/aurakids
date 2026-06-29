export default function Footer() {
  return (
    <footer className="py-14 px-6 text-center" style={{ background: "#1A0533" }}>
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #FF6B6B, #FFD93D)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
        <span className="text-lg font-bold text-white">AuraKids</span>
      </div>
      <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
        Магически приказки, специално за твоето дете
      </p>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.18)" }}>
        © 2025 AuraKids · aurakids.fun
      </p>
    </footer>
  );
}
