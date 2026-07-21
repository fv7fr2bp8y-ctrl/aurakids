// Web = free demo (one story + one comic). The paid store apps open the site
// with ?full=1 in their start_url, which unlocks unlimited generation for good.
const UNLOCK_KEY = "ak-unlocked";
const DEMO_LIMIT = 1;

function keyFor(format: "story" | "comic") {
  return format === "comic" ? "ak-demo-comic" : "ak-demo-story";
}

// The paid store apps (Android TWA) launch with a document.referrer of
// "android-app://fun.aurakids.stories" (or .comics). That's a signal the web
// can't spoof, so treat any install running inside our TWA as fully unlocked —
// the purchase happened on Google Play. Also honours a ?full=1 start_url.
function isStoreApp(): boolean {
  if (typeof document === "undefined") return false;
  try {
    return /^android-app:\/\/fun\.aurakids\.(stories|comics)/.test(document.referrer || "");
  } catch { return false; }
}

// Call once on load: a ?full=1 (store app) permanently unlocks this install.
export function initUnlock() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("full") === "1" || isStoreApp()) localStorage.setItem(UNLOCK_KEY, "1");
  } catch { /* ignore */ }
}

export function isUnlocked(): boolean {
  if (typeof window === "undefined") return true; // SSR: don't gate
  try {
    if (localStorage.getItem(UNLOCK_KEY) === "1") return true;
    if (isStoreApp()) { localStorage.setItem(UNLOCK_KEY, "1"); return true; }
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

// A paid unlock is stored server-side against the family code, so it follows
// the family to any device (restore the code → unlocked). Called on app load.
export async function checkServerUnlock(code: string): Promise<boolean> {
  if (!code || isUnlocked()) return isUnlocked();
  try {
    const res = await fetch(`/api/unlocked?code=${encodeURIComponent(code)}`);
    const { unlocked } = await res.json();
    if (unlocked) {
      localStorage.setItem(UNLOCK_KEY, "1");
      return true;
    }
  } catch { /* offline — keep demo state */ }
  return false;
}
