// Library of created stories/comics. Kept locally (fast, offline) and synced to
// a cloud copy keyed by a "family code" so it survives across devices.
import type { ComicData } from "@/components/ComicDisplay";
import type { StoryData } from "@/components/StoryGenerator";
import { runtimeMode } from "./appConfig";

export interface LibraryItem {
  id: string;
  type: "comic" | "story";
  title: string;
  childName: string;
  lang: string;
  cover: string | null;
  date: string; // ISO
  data: ComicData | StoryData;
}

// Each product keeps its own library (by build or by /prikazki|/komiksi path).
function scope() { return runtimeMode(); }
function libKey() { const m = scope(); return m === "story" ? "ak-library-story" : m === "comic" ? "ak-library-comic" : "ak-library"; }
const CODE_KEY = "ak-family-code";

// ---- Family code (the key to the cloud library) ----
export function getFamilyCode(): string {
  if (typeof window === "undefined") return "";
  let code = localStorage.getItem(CODE_KEY) || "";
  if (!code) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars
    const raw = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
    code = `AURA-${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
    localStorage.setItem(CODE_KEY, code);
  }
  return code;
}

export function setFamilyCode(code: string) {
  if (typeof window !== "undefined") localStorage.setItem(CODE_KEY, code.trim().toUpperCase());
}

export function getLibrary(): LibraryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(libKey()) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(items: LibraryItem[]) {
  try { localStorage.setItem(libKey(), JSON.stringify(items.slice(0, 50))); } catch { /* full */ }
}

export function saveToLibrary(item: Omit<LibraryItem, "id" | "date">) {
  const full: LibraryItem = { ...item, id: crypto.randomUUID(), date: new Date().toISOString() };
  const items = [full, ...getLibrary()];
  writeLocal(items);
  // Fire-and-forget cloud sync.
  fetch("/api/library", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: getFamilyCode(), item: { ...full, scope: scope() } }),
  }).catch(() => {});
}

// Pull the cloud library for this code and merge into local (used on load and
// when restoring on a new device). Returns the merged list for this product.
export async function syncLibrary(code?: string): Promise<LibraryItem[]> {
  const c = (code || getFamilyCode()).toUpperCase();
  if (code) setFamilyCode(c);
  const s = scope();
  try {
    const res = await fetch(`/api/library?code=${encodeURIComponent(c)}`);
    const { items } = await res.json();
    const remote: (LibraryItem & { scope?: string })[] = Array.isArray(items) ? items : [];
    const mine = remote.filter((i) => (i.scope ?? "both") === s || s === "both");
    // Merge remote + local, dedupe by id, newest first.
    const byId = new Map<string, LibraryItem>();
    for (const i of [...mine, ...getLibrary()]) byId.set(i.id, i);
    const merged = Array.from(byId.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
    writeLocal(merged);
    return merged.slice(0, 50);
  } catch {
    return getLibrary();
  }
}
