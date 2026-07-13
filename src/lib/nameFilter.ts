// Profanity guard for the child-name input. The name is echoed into every
// story/comic and rendered inside images, so block obvious rude words in the
// app's five languages (Cyrillic + Latin transliterations) before generating.

// Matched as substrings — long/distinct enough not to hide inside real names.
const BAD_SUBSTRINGS = [
  // Bulgarian / Russian (Cyrillic)
  "путк", "пичк", "курв", "хуес", "хуйн", "пишк", "педал", "педер",
  "ебан", "ебах", "ебач", "заеб", "изеб", "лайн", "дупедав",
  "копеле", "кучк", "шибан", "пизд", "мудак", "далбое", "долбое",
  "залуп", "дроч", "минет", "говн", "сран", "серсем",
  // Latin transliterations
  "putk", "pichk", "kurv", "pishk", "pedal", "peder", "zaeb",
  "kopele", "kuchk", "shiban", "pizd", "govn",
  // English
  "fuck", "fuk", "shit", "bitch", "cunt", "dick", "cock", "pussy",
  "asshole", "whore", "slut", "nigger", "nigga", "faggot", "bastard",
  "wank", "twat", "prick", "penis", "vagina",
  // German
  "fick", "scheis", "scheiß", "arsch", "hurensohn", "fotze", "schlampe", "wichser",
  // French
  "putain", "merde", "salope", "encul", "connard", "salaud", "couill", "nique",
];

// Short words that only count when they ARE the whole (normalized) name —
// substring matching would hit real names like Курт or Sebastian.
const BAD_EXACT = [
  "кур", "хуй", "хуи", "гъз", "еба", "ебе", "путка", "пута", "пич",
  "huy", "hui", "kur", "gaz", "eba", "pute", "bite", "con", "cul", "ass", "arse", "tit",
];

// Fold lookalikes and noise so "F.u.c.k" or "путkа" still match.
const LOOKALIKES: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i",
};

function normalize(raw: string): string {
  let s = raw.toLowerCase();
  s = s.replace(/[0134857@$!]/g, (c) => LOOKALIKES[c] ?? c);
  s = s.normalize("NFD").replace(/[̀-ͯ]/g, ""); // strip accents
  s = s.replace(/[^a-zа-яё]/g, ""); // keep latin + cyrillic letters only
  s = s.replace(/(.)\1{2,}/g, "$1$1"); // collapse looong repeats
  return s;
}

// Mixed-script tricks ("путkа", "xуй"): fold visually identical letters both
// ways and check every variant.
const LAT2CYR: Record<string, string> = { a: "а", b: "в", c: "с", e: "е", h: "н", k: "к", m: "м", o: "о", p: "р", t: "т", x: "х", y: "у" };
const CYR2LAT: Record<string, string> = { "а": "a", "в": "b", "с": "c", "е": "e", "к": "k", "м": "m", "о": "o", "р": "p", "т": "t", "х": "x", "у": "y" };

function fold(s: string, map: Record<string, string>): string {
  return s.replace(/./g, (c) => map[c] ?? c);
}

function isDirty(n: string): boolean {
  return BAD_EXACT.includes(n) || BAD_SUBSTRINGS.some((w) => n.includes(w));
}

// True when the name is safe to use.
export function isNameClean(name: string): boolean {
  const n = normalize(name);
  if (!n) return true; // emptiness is handled by required-field logic
  return ![n, fold(n, LAT2CYR), fold(n, CYR2LAT)].some(isDirty);
}
