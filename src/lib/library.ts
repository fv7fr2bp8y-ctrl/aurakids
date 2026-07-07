// Local library of created stories/comics, persisted in localStorage.
import type { ComicData } from "@/components/ComicDisplay";
import type { StoryData } from "@/components/StoryGenerator";
import { APP } from "./appConfig";

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

// Each dedicated build keeps its own library; the combined app keeps the shared one.
const KEY = APP === "story" ? "ak-library-story" : APP === "comic" ? "ak-library-comic" : "ak-library";

export function getLibrary(): LibraryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveToLibrary(item: Omit<LibraryItem, "id" | "date">) {
  try {
    const items = getLibrary();
    items.unshift({ ...item, id: crypto.randomUUID(), date: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, 50)));
  } catch { /* storage full or unavailable */ }
}
