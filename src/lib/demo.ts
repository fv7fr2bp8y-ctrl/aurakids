// Web = free demo (one story + one comic). The paid store apps open the site
// with ?full=1 in their start_url, which unlocks unlimited generation for good.
const UNLOCK_KEY = "ak-unlocked";
const DEMO_LIMIT = 1;

function keyFor(format: "story" | "comic") {
  return format === "comic" ? "ak-demo-comic" : "ak-demo-story";
}

// Call once on load: a ?full=1 (store app) permanently unlocks this install.
export function initUnlock() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("full") === "1") localStorage.setItem(UNLOCK_KEY, "1");
  } catch { /* ignore */ }
}

export function isUnlocked(): boolean {
  if (typeof window === "undefined") return true; // SSR: don't gate
  try {
    if (localStorage.getItem(UNLOCK_KEY) === "1") return true;
    const p = new URLSearchParams(window.location.search);
    if (p.get("full") === "1") { localStorage.setItem(UNLOCK_KEY, "1"); return true; }
  } catch { /* ignore */ }
  return false;
}

export function demoUsed(format: "story" | "comic"): number {
  if (typeof window === "undefined") return 0;
  try { return parseInt(localStorage.getItem(keyFor(format)) || "0", 10) || 0; }
  catch { return 0; }
}

export function canGenerate(format: "story" | "comic"): boolean {
  return isUnlocked() || demoUsed(format) < DEMO_LIMIT;
}

export function recordGeneration(format: "story" | "comic") {
  if (isUnlocked()) return;
  try { localStorage.setItem(keyFor(format), String(demoUsed(format) + 1)); }
  catch { /* ignore */ }
}
