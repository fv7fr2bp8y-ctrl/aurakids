// Which product this build is. Set NEXT_PUBLIC_APP at build time:
//   NEXT_PUBLIC_APP=story  → AuraKids Приказки (bedtime stories only)
//   NEXT_PUBLIC_APP=comic  → AuraKids Комикси (comics only)
//   unset / "both"         → combined app with both doors (current aurakids.fun)
export type AppMode = "story" | "comic" | "both";

export const APP: AppMode =
  (process.env.NEXT_PUBLIC_APP as AppMode) === "story" ? "story"
  : (process.env.NEXT_PUBLIC_APP as AppMode) === "comic" ? "comic"
  : "both";

export const isStoryApp = APP === "story";
export const isComicApp = APP === "comic";
export const isBothApp = APP === "both";

// The single format a dedicated build produces (null for the combined app).
export const soleFormat: "story" | "comic" | null =
  APP === "story" ? "story" : APP === "comic" ? "comic" : null;

interface BrandInfo {
  name: string;        // full app / PWA name
  short: string;       // short_name
  iconVariant: string; // query passed to /api/icon (?app=…)
}

export const BRAND: BrandInfo = {
  story: { name: "AuraKids Приказки", short: "Приказки", iconVariant: "story" },
  comic: { name: "AuraKids Комикси", short: "Комикси", iconVariant: "comic" },
  both:  { name: "AuraKids", short: "AuraKids", iconVariant: "both" },
}[APP];
