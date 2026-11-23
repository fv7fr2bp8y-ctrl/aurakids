// Bulgarian stress marks for the voice, the way ONIRA does it: put U+0301
// (combining acute) on words the TTS voice tends to stress wrongly. The
// shared dictionary is ONIRA's content/pronunciation/obsht-rechnik.json;
// the story model adds a short per-story list (names, rare and ambiguous
// words). The reader never sees the marks.
import dict from "./stress-dict.json";

const ACUTE = "́";
const GRAVE = "̀";
const WORD = /[Ѐ-ӿ̀́]+/g;
const MAP: Record<string, string> = (dict as unknown as { думи: Record<string, string> }).думи;

// A per-story word list from the model ("Мъ́рморко") → { мърморко: "мъ́рморко" }.
// Only Cyrillic words with exactly one stress mark are kept.
export function storyStressMap(words: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const raw of words) {
    const w = String(raw || "").normalize("NFC").trim();
    if (!/^[Ѐ-ӿ́-]+$/.test(w)) continue;
    if (w.split(ACUTE).length !== 2) continue;
    out[w.split(ACUTE).join("").toLowerCase().normalize("NFC")] = w.toLowerCase();
  }
  return out;
}

export function addStress(text: string, extra: Record<string, string> = {}): string {
  return text.replace(WORD, (w) => {
    if (w.includes(ACUTE) || w.includes(GRAVE)) return w;
    const v = extra[w.toLowerCase()] ?? MAP[w] ?? MAP[w.toLowerCase()];
    if (!v) return w;
    // ONIRA's dictionary may use a grave mark as the stress sign: make it acute.
    const out = v.normalize("NFD").split(GRAVE).join(ACUTE).normalize("NFC");
    if (w === w.toUpperCase() && w.length > 1) return out.toUpperCase();
    return w[0] !== w[0].toLowerCase() ? out[0].toUpperCase() + out.slice(1) : out;
  });
}

// Text shown to the reader never carries stress marks. Only the acute is
// removed: "ѝ" (her) is a real letter with a grave and must stay.
export function stripStress(text: string): string {
  return text.normalize("NFC").split(ACUTE).join("");
}
