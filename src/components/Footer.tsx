import AuraLogo from "./AuraLogo";
import { t } from "@/lib/i18n";

export default function Footer({ lang }: { lang: string }) {
  return (
    <footer className="py-16 px-6" style={{ background: "#0F0520", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-3 mb-4" aria-label="Начало"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <AuraLogo size={32} />
          <span className="text-xl font-bold text-white tracking-tight">AuraKids</span>
        </button>
        <p className="text-sm mb-2 max-w-xs" style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>
          {t(lang, "footerTagline")}
        </p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>
          © 2026 AuraKids · aurakids.fun · {t(lang, "footerRights")}
        </p>
        <a href="/privacy" className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "underline" }}>
          {t(lang, "privacy")}
        </a>
      </div>
    </footer>
  );
}
