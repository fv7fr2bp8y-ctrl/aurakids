const STEPS = [
  {
    n: "1",
    title: "Назови героя",
    desc: "Въведи името на детето и на колко години е.",
    gradient: ["#FF6B6B", "#FF8E53"],
    glow: "rgba(255,107,107,0.28)",
    illustration: <IllustrationHero />,
  },
  {
    n: "2",
    title: "Избери свят",
    desc: "Дракони, космос, вълшебна гора — или измисли свой.",
    gradient: ["#FFD93D", "#FF9A3C"],
    glow: "rgba(255,200,61,0.28)",
    illustration: <IllustrationWorld />,
  },
  {
    n: "3",
    title: "Приказката се ражда",
    desc: "AI пише история само за вашето дете с уникални илюстрации.",
    gradient: ["#A78BFA", "#6B35B8"],
    glow: "rgba(155,111,232,0.28)",
    illustration: <IllustrationStory />,
  },
  {
    n: "4",
    title: "Чуй я на глас",
    desc: "Топъл глас разказва приказката. Пазена е завинаги.",
    gradient: ["#67E8F9", "#2563EB"],
    glow: "rgba(79,195,247,0.28)",
    illustration: <IllustrationListen />,
  },
];

function IllustrationHero() {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="h-glow" cx="50%" cy="60%" r="45%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="115" rx="45" ry="8" fill="rgba(0,0,0,0.10)" />
      {/* Body */}
      <rect x="82" y="72" width="36" height="38" rx="14" fill="white" fillOpacity="0.22" />
      {/* Head */}
      <circle cx="100" cy="58" r="18" fill="white" fillOpacity="0.30" />
      <circle cx="100" cy="58" r="14" fill="white" fillOpacity="0.25" />
      {/* Crown */}
      <path d="M88 47 L92 38 L100 44 L108 38 L112 47 Z" fill="rgba(255,220,80,0.90)" />
      <circle cx="88" cy="47" r="2" fill="#FFD93D" />
      <circle cx="100" cy="43" r="2" fill="#FFD93D" />
      <circle cx="112" cy="47" r="2" fill="#FFD93D" />
      {/* Eyes */}
      <ellipse cx="93" cy="58" rx="3" ry="3.5" fill="white" fillOpacity="0.9" />
      <ellipse cx="107" cy="58" rx="3" ry="3.5" fill="white" fillOpacity="0.9" />
      <circle cx="94" cy="59" r="1.5" fill="rgba(80,30,120,0.8)" />
      <circle cx="108" cy="59" r="1.5" fill="rgba(80,30,120,0.8)" />
      {/* Smile */}
      <path d="M94 65 Q100 70 106 65" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.9" />
      {/* Floating letters */}
      <rect x="20" y="30" width="30" height="18" rx="5" fill="rgba(255,255,255,0.18)" />
      <rect x="22" y="35" width="18" height="2.5" rx="1.5" fill="rgba(255,255,255,0.6)" />
      <rect x="22" y="40" width="12" height="2.5" rx="1.5" fill="rgba(255,255,255,0.4)" />
      <rect x="148" y="22" width="34" height="18" rx="5" fill="rgba(255,255,255,0.18)" />
      <rect x="150" y="27" width="20" height="2.5" rx="1.5" fill="rgba(255,255,255,0.6)" />
      <rect x="150" y="32" width="14" height="2.5" rx="1.5" fill="rgba(255,255,255,0.4)" />
      {/* Sparkles */}
      <path d="M140 50 L142 44 L144 50 L150 52 L144 54 L142 60 L140 54 L134 52 Z" fill="rgba(255,255,255,0.75)" />
      <path d="M52 70 L53.5 65 L55 70 L60 71.5 L55 73 L53.5 78 L52 73 L47 71.5 Z" fill="rgba(255,255,255,0.60)" />
      <circle cx="35" cy="50" r="3" fill="rgba(255,255,255,0.40)" />
      <circle cx="165" cy="75" r="2" fill="rgba(255,255,255,0.40)" />
      <ellipse cx="100" cy="90" rx="100" ry="40" fill="url(#h-glow)" />
    </svg>
  );
}

function IllustrationWorld() {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="w-inner" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.20)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="118" rx="42" ry="7" fill="rgba(0,0,0,0.10)" />
      {/* Portal ring outer */}
      <circle cx="100" cy="68" r="46" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Portal ring inner glow */}
      <circle cx="100" cy="68" r="38" fill="url(#w-inner)" stroke="rgba(255,255,255,0.40)" strokeWidth="2.5" />
      {/* Dragon castle - top left */}
      <g transform="translate(62,38) scale(0.85)">
        <rect x="0" y="12" width="24" height="18" rx="2" fill="rgba(255,255,255,0.55)" />
        <rect x="3" y="7" width="7" height="10" rx="1.5" fill="rgba(255,255,255,0.70)" />
        <rect x="14" y="7" width="7" height="10" rx="1.5" fill="rgba(255,255,255,0.70)" />
        <path d="M10 7 L12 2 L14 7Z" fill="rgba(255,200,80,0.85)" />
      </g>
      {/* Stars - top right */}
      <g transform="translate(118,32) scale(0.9)">
        <circle cx="12" cy="16" r="9" fill="rgba(255,255,255,0.20)" />
        <circle cx="12" cy="16" r="5" fill="rgba(255,255,255,0.40)" />
        <path d="M12 5 L13.5 10 L19 10 L14.5 13.5 L16 19 L12 15.5 L8 19 L9.5 13.5 L5 10 L10.5 10 Z" fill="rgba(255,255,255,0.80)" />
      </g>
      {/* Forest - bottom left */}
      <g transform="translate(63,82) scale(0.85)">
        <path d="M12 0 L22 18 L2 18 Z" fill="rgba(255,255,255,0.55)" />
        <path d="M20 6 L30 22 L10 22 Z" fill="rgba(255,255,255,0.40)" />
        <rect x="10" y="18" width="4" height="6" rx="1" fill="rgba(255,255,255,0.50)" />
      </g>
      {/* Ocean/waves - bottom right */}
      <g transform="translate(112,84)">
        <path d="M0 8 Q6 2 12 8 Q18 14 24 8" stroke="rgba(255,255,255,0.70)" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M4 15 Q10 9 16 15 Q22 21 28 15" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <circle cx="14" cy="4" r="3" fill="rgba(255,255,255,0.50)" />
      </g>
      {/* Center glow */}
      <circle cx="100" cy="68" r="12" fill="rgba(255,255,255,0.18)" />
      <path d="M94 68 L99 63 L108 68 L99 73 Z" fill="rgba(255,255,255,0.80)" />
    </svg>
  );
}

function IllustrationStory() {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="s-glow" cx="50%" cy="55%" r="40%">
          <stop offset="0%" stopColor="rgba(255,220,150,0.35)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="120" rx="48" ry="7" fill="rgba(0,0,0,0.12)" />
      {/* Book base */}
      <path d="M55 85 L55 52 Q55 48 59 48 L98 54 L98 90 Z" fill="rgba(255,255,255,0.30)" stroke="rgba(255,255,255,0.50)" strokeWidth="1" />
      <path d="M145 85 L145 52 Q145 48 141 48 L102 54 L102 90 Z" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.40)" strokeWidth="1" />
      {/* Spine */}
      <path d="M98 54 L98 90 L102 90 L102 54 Z" fill="rgba(255,255,255,0.55)" />
      {/* Lines on pages */}
      <line x1="65" y1="62" x2="92" y2="63" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="65" y1="68" x2="90" y2="69" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="65" y1="74" x2="88" y2="75" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="108" y1="62" x2="135" y2="61" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="108" y1="68" x2="133" y2="67" stroke="rgba(255,255,255,0.27)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Magic rising from pages */}
      <path d="M85 50 Q80 38 88 28 Q92 20 86 12" stroke="rgba(255,220,120,0.70)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M100 48 Q95 32 104 20 Q108 12 102 4" stroke="rgba(255,255,255,0.60)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M115 50 Q122 36 114 24 Q110 16 117 8" stroke="rgba(200,170,255,0.70)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Stars along the smoke */}
      <path d="M86 28 L87.5 23 L89 28 L94 29.5 L89 31 L87.5 36 L86 31 L81 29.5 Z" fill="rgba(255,230,100,0.90)" />
      <path d="M103 20 L104 16 L105 20 L109 21 L105 22 L104 26 L103 22 L99 21 Z" fill="rgba(255,255,255,0.85)" />
      <path d="M114 24 L115 20 L116 24 L120 25 L116 26 L115 30 L114 26 L110 25 Z" fill="rgba(210,180,255,0.85)" />
      <circle cx="87" cy="12" r="2.5" fill="rgba(255,220,80,0.70)" />
      <circle cx="102" cy="4" r="2" fill="rgba(255,255,255,0.65)" />
      <circle cx="117" cy="8" r="2" fill="rgba(180,150,255,0.70)" />
      <ellipse cx="100" cy="75" rx="50" ry="25" fill="url(#s-glow)" />
    </svg>
  );
}

function IllustrationListen() {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="l-glow" cx="50%" cy="65%" r="45%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.20)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      {/* Bed / couch base */}
      <rect x="22" y="88" width="156" height="28" rx="12" fill="rgba(255,255,255,0.20)" />
      <rect x="22" y="85" width="156" height="14" rx="8" fill="rgba(255,255,255,0.28)" />
      {/* Pillow */}
      <rect x="30" y="72" width="38" height="26" rx="10" fill="rgba(255,255,255,0.30)" />
      {/* Parent silhouette */}
      <circle cx="58" cy="65" r="11" fill="rgba(255,255,255,0.25)" />
      <rect x="34" y="75" width="48" height="20" rx="10" fill="rgba(255,255,255,0.18)" />
      {/* Child silhouette (smaller, snuggled) */}
      <circle cx="110" cy="70" r="9" fill="rgba(255,255,255,0.30)" />
      <rect x="90" y="78" width="38" height="18" rx="9" fill="rgba(255,255,255,0.22)" />
      {/* Blanket */}
      <path d="M24 90 Q100 82 176 90 L176 100 Q100 94 24 100 Z" fill="rgba(255,255,255,0.22)" />
      {/* Stars through window */}
      <rect x="138" y="20" width="42" height="54" rx="6" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" />
      <line x1="159" y1="20" x2="159" y2="74" stroke="rgba(255,255,255,0.20)" strokeWidth="1" />
      <line x1="138" y1="47" x2="180" y2="47" stroke="rgba(255,255,255,0.20)" strokeWidth="1" />
      {/* Moon */}
      <path d="M165 30 A10 10 0 1 1 155 40 A7 7 0 0 0 165 30Z" fill="rgba(255,230,120,0.75)" />
      {/* Window stars */}
      <circle cx="148" cy="30" r="1.5" fill="rgba(255,255,255,0.80)" />
      <circle cx="174" cy="36" r="1" fill="rgba(255,255,255,0.70)" />
      <circle cx="145" cy="56" r="1.5" fill="rgba(255,255,255,0.65)" />
      <circle cx="172" cy="58" r="1" fill="rgba(255,255,255,0.60)" />
      {/* Sound waves floating */}
      <path d="M78 52 Q86 44 94 52" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M72 46 Q86 34 100 46" stroke="rgba(255,255,255,0.38)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M66 40 Q86 24 106 40" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Warm lamp glow */}
      <circle cx="28" cy="52" r="8" fill="rgba(255,220,100,0.30)" />
      <circle cx="28" cy="52" r="4" fill="rgba(255,220,100,0.55)" />
      <rect x="25" y="56" width="6" height="12" rx="2" fill="rgba(255,255,255,0.30)" />
      <ellipse cx="100" cy="90" rx="80" ry="30" fill="url(#l-glow)" />
    </svg>
  );
}

export default function HowItWorks() {
  return (
    <section className="py-20 px-6" style={{ background: "linear-gradient(180deg, #FFF8F0 0%, #F0E6FF 60%, #FFF8F0 100%)" }}>
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#9B6FE8" }}>
            Как работи
          </p>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight" style={{ color: "#1A0533" }}>
            Четири стъпки до<br />
            <span style={{ color: "#6B35B8" }}>вечер, която не се забравя</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative group">
              {i < 3 && (
                <div className="hidden lg:block absolute -right-3.5 top-20 z-20 text-2xl select-none"
                  style={{ color: "#C4B5FD" }}>›</div>
              )}
              <div className="h-full rounded-3xl overflow-hidden bg-white transition-transform duration-300 group-hover:-translate-y-1"
                style={{ boxShadow: `0 8px 32px ${s.glow}, 0 0 0 1px rgba(0,0,0,0.04)` }}>

                {/* Illustration area */}
                <div className="relative h-44 overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${s.gradient[0]} 0%, ${s.gradient[1]} 100%)` }}>
                  {s.illustration}
                  {/* Step badge */}
                  <div className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: "rgba(255,255,255,0.28)", color: "white", backdropFilter: "blur(6px)" }}>
                    {s.n}
                  </div>
                  {/* Bottom fade */}
                  <div className="absolute bottom-0 left-0 right-0 h-10"
                    style={{ background: "linear-gradient(to bottom, transparent, white)" }} />
                </div>

                {/* Text */}
                <div className="px-5 pt-1 pb-5">
                  <h3 className="text-sm font-bold mb-1" style={{ color: "#1A0533" }}>{s.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#7B6FA0" }}>{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
