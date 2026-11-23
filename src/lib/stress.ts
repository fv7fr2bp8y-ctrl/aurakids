// Bulgarian stress marks for the voice, the way ONIRA does it: put U+0301
// (combining acute) on words the TTS voice tends to stress wrongly. The
// shared dictionary is ONIRA's content/pronunciation/obsht-rechnik.json;
// the story model also marks names, rare and ambiguous words (voiceText).
import dict from "./stress-dict.json";

const ACUTE = "́";
const WORD = /[А-Яа-яЀ-ӿ̀́]+/g;
const MAP: Record<string, string> = (dict as unknown as { думи: Record<string, string> }).думи;

export function addStress(text: string): string {
  return text.replace(WORD, (w) => {
    if (w.includes(ACUTE) || w.includes("̀")) return w;
    const v = MAP[w] ?? MAP[w.toLowerCase()];
    if (!v) return w;
    const out = v.normalize("NFD").replace(/̀/g, ACUTE);
    return (w[0] !== w[0].toLowerCase() ? out[0].toUpperCase() + out.slice(1) : out).normalize("NFC");
  });
}

// Text shown to the reader never carries the marks.
export function stripStress(text: string): string {
  return text.normalize("NFD").replace(/[̀́]/g, "").normalize("NFC");
}
