import AuraLogo from "./AuraLogo";

export default function Footer() {
  return (
    <footer className="py-16 px-6" style={{ background: "#0F0520", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-4">
          <AuraLogo size={32} />
          <span className="text-xl font-bold text-white tracking-tight">AuraKids</span>
        </div>
        <p className="text-sm mb-2 max-w-xs" style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>
          Персонализирани приказки с изкуствен интелект — твоето дете е героят.
        </p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>
          © 2026 AuraKids · aurakids.fun · Всички права запазени
        </p>
        <a href="/privacy" className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "underline" }}>
          Политика за поверителност
        </a>
      </div>
    </footer>
  );
}
