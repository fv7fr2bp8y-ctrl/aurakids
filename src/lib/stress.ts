// Bulgarian stress marks for the voice: U+0301 on the stressed vowel, taken
// only from dictionaries, never guessed (the ONIRA rule):
//   1. per-story words checked in rechnik.chitanka.info (extra),
//   2. ONIRA's shared dictionary (content/pronunciation/obsht-rechnik.json),
//   3. Wiktionary via kaikki.org: 158k forms with exactly one stress
//      (data/stress-bg.tsv.gz, CC BY-SA 4.0, see data/README.md).
// The reader never sees the marks. Server-only (reads a file).
import dict from "./stress-dict.json";
import { readFileSync } from "fs";
import { gunzipSync } from "zlib";
import path from "path";

const ACUTE = "́";
const GRAVE = "̀";
const WORD = /[Ѐ-ӿ̀́]+/g;
const ONIRA: Record<string, string> = (dict as unknown as { думи: Record<string, string> }).думи;

let WIKI: Map<string, number> | null = null;
function wiki(): Map<string, number> {
  if (WIKI) return WIKI;
  WIKI = new Map();
  try {
    const raw = gunzipSync(readFileSync(path.join(process.cwd(), "data", "stress-bg.tsv.gz"))).toString("utf8");
    for (const line of raw.split("\n")) {
      const tab = line.indexOf("\t");
      if (tab > 0) WIKI.set(line.slice(0, tab), Number(line.slice(tab + 1)));
    }
  } catch (e) {
    console.error("stress dictionary not loaded:", e instanceof Error ? e.message : e);
  }
  return WIKI;
}

function withCase(w: string, out: string): string {
  if (w === w.toUpperCase() && w.length > 1) return out.toUpperCase();
  return w[0] !== w[0].toLowerCase() ? out[0].toUpperCase() + out.slice(1) : out;
}

export function addStress(text: string, extra: Record<string, string> = {}): string {
  const W = wiki();
  return text.replace(WORD, (w) => {
    if (w.includes(ACUTE) || w.includes(GRAVE)) return w;
    const low = w.toLowerCase();
    const v = extra[low] ?? ONIRA[w] ?? ONIRA[low];
    if (v) return withCase(w, v.normalize("NFD").split(GRAVE).join(ACUTE).normalize("NFC"));
    const i = W.get(low);
    if (i === undefined || i < 0 || i >= low.length) return w;
    return withCase(w, low.slice(0, i + 1) + ACUTE + low.slice(i + 1));
  });
}

// Text shown to the reader never carries stress marks. Only the acute is
// removed: "ѝ" (her) is a real letter with a grave and must stay.
export function stripStress(text: string): string {
  return text.normalize("NFC").split(ACUTE).join("");
}
