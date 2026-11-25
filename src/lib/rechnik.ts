import { getSupabase, jsonBucket } from "@/lib/supabase";
import seed from "./stress-seed.json";

// Stress marks are only ever taken from a dictionary, never guessed (the
// ONIRA rule, after "драко́на" slipped into a test on 23.11.2026; correct is
// "дра̀кона"). Source: rechnik.chitanka.info, the same as ONIRA's
// ingest/tekst.py. Answers are cached per word in the private "libraries"
// bucket under stress/<word>.json, so each word is looked up once.

const GRAVE = "̀";
const ACUTE = "́";
const BUCKET = "libraries";
const FORM = /[а-яА-Я]*[а-яА-Я](?:&#768;|̀)[а-я]*/g;

function plain(s: string): string {
  return s.normalize("NFC").split(GRAVE).join("").split(ACUTE).join("").normalize("NFC").toLowerCase();
}

function decode(s: string): string {
  return s.replace(/&#768;/g, GRAVE).normalize("NFC");
}

async function fetchPage(word: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch(`https://rechnik.chitanka.info/w/${encodeURIComponent(word)}`, {
      headers: { "User-Agent": "AuraKids/1.0 (stress lookup, cached)" },
      signal: ctrl.signal,
    });
    if (res.status === 429) throw new Error("rate limited");
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    if (e instanceof Error && e.message === "rate limited") throw e;
    return null;
  } finally {
    clearTimeout(t);
  }
}

function formsOf(page: string): string[] {
  return [...new Set((page.match(FORM) || []).map(decode))];
}

// All stressed forms the dictionary gives for this word (a form page like
// "дракона" may only link to the headword "дракон": then take that page's).
async function lookup(word: string): Promise<string[] | null> {
  const page = await fetchPage(word);
  if (!page) return null;
  let forms = formsOf(page);
  if (!forms.some((f) => plain(f) === word)) {
    const lemma = (page.match(/href="\/w\/([^"?#]+)"/g) || [])
      .map((m) => decodeURIComponent(m.slice(9, -1)))
      .find((l) => l !== word && word.startsWith(l.slice(0, Math.max(3, l.length - 2))));
    if (lemma) {
      const p2 = await fetchPage(lemma);
      if (p2) forms = [...new Set([...forms, ...formsOf(p2)])];
    }
  }
  return forms;
}

// ONIRA's cache of rechnik.chitanka.info answers (698 words, 23.11.2026).
const SEED = seed as unknown as Record<string, string[] | null>;

// Answers seen by this server instance (also covers runs without storage).
const MEMO = new Map<string, string[] | null>();

async function cached(word: string): Promise<string[] | null | undefined> {
  if (word in SEED) return SEED[word];
  if (MEMO.has(word)) return MEMO.get(word);
  const sb = getSupabase();
  if (!sb) return undefined;
  try {
    const { data, error } = await jsonBucket(sb).download(`stress/${word}.json`);
    if (error || !data) return undefined;
    return JSON.parse(await data.text()).forms ?? null;
  } catch {
    return undefined;
  }
}

async function remember(word: string, forms: string[] | null) {
  MEMO.set(word, forms);
  const sb = getSupabase();
  if (!sb) return;
  const body = new Blob([JSON.stringify({ forms, at: new Date().toISOString() })], { type: "application/json" });
  await jsonBucket(sb).upload(`stress/${word}.json`, body, { contentType: "application/json", upsert: true }).catch(() => {});
}

// Index (in the unmarked word) of the stressed vowel, or -1.
function stressIndex(form: string): number {
  const d = form.normalize("NFC");
  const k = d.search(/[\u0300\u0301]/);
  return k > 0 ? plain(d.slice(0, k)).length - 1 : -1;
}

// A form the dictionary doesn't spell out ("драконът" from "дра̀кон"): take the
// forms sharing the longest beginning with the word; if they all stress the
// same letter inside that shared beginning, use it. Otherwise no mark (ONIRA's
// izvedi()).
function derive(word: string, forms: string[]): number {
  const common = (f: string) => {
    const b = plain(f);
    let n = 0;
    while (n < Math.min(b.length, word.length) && b[n] === word[n]) n++;
    return n;
  };
  if (!forms.length) return -1;
  const best = Math.max(...forms.map(common));
  if (best < Math.max(3, word.length - 3)) return -1;
  const idx = [...new Set(forms.filter((f) => common(f) === best).map(stressIndex))];
  return idx.length === 1 && idx[0] >= 0 && idx[0] < best ? idx[0] : -1;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Look up (and cache) words one by one, ~1.2 s apart like ONIRA: the
// dictionary answers 429 to bursts. Stops at the deadline or on a 429.
export async function warmStress(words: string[], budgetMs: number): Promise<void> {
  const deadline = Date.now() + budgetMs;
  for (const w of words) {
    if (Date.now() > deadline) return;
    if ((await cached(w)) !== undefined) continue;
    try {
      const forms = await lookup(w);
      if (forms !== null) await remember(w, forms);
    } catch {
      return; // rate limited: try again with the next story
    }
    await sleep(1200);
  }
}

function candidates(list: string[]): string[] {
  return [...new Set(list.map(plain).filter((w) => /^[а-яѝ]{3,30}$/.test(w)))].slice(0, 40);
}

// For each candidate word: the dictionary's stressed spelling (acute mark),
// only when the dictionary has exactly one stress for that exact form (or all
// its close forms agree). Words it doesn't know (most names) stay unmarked.
export async function verifiedStress(list: string[], budgetMs = 6000): Promise<{ marks: Record<string, string>; missing: string[] }> {
  const words = candidates(list);
  await warmStress(words, budgetMs);
  const marks: Record<string, string> = {};
  const missing: string[] = [];
  for (const w of words) {
    const forms = await cached(w);
    if (forms === undefined) { missing.push(w); continue; }
    const matches = [...new Set((forms || []).filter((f) => plain(f) === w))];
    const pos = matches.length === 1 ? stressIndex(matches[0]) : matches.length === 0 ? derive(w, forms || []) : -1;
    if (pos >= 0) marks[w] = w.slice(0, pos + 1) + ACUTE + w.slice(pos + 1);
  }
  return { marks, missing };
}
