// Web = free demo (one story + one comic), then the Stripe paywall.
//
// Nothing here is a security boundary any more: the server decides what is
// paid (Stripe marker per family code) and enforces daily limits (lib/quota).
// These flags only decide which screen the app shows.
const PAID_KEY = "ak-paid-v2";   // set only after the server confirmed payment
const STORE_KEY = "ak-store-app"; // running inside the Google Play app (TWA)
const DEMO_LIMIT = 1;

function keyFor(format: "story" | "comic") {
  return format === "comic" ? "ak-demo-comic" : "ak-demo-story";
}

// The Play apps (Android TWA) launch with a document.referrer of
// "android-app://fun.aurakids.stories" (or .comics). Inside the Play app we
// never show the Stripe paywall (Play policy); the server's free daily limit
// still applies there until Play Billing is added.
function detectStoreApp(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const m = (document.referrer || "").match(/^android-app:\/\/(fun\.aurakids\.(?:stories|comics))/);
    if (m) localStorage.setItem(STORE_PKG_KEY, m[1]);
    return !!m;
  } catch { return false; }
}

const STORE_PKG_KEY = "ak-store-pkg";
// Which Play app this is (for Google Play Billing).
export function storePackage(): string {
  if (typeof window === "undefined") return "";
  try {
    const p = localStorage.getItem(STORE_PKG_KEY);
    if (p) return p;
    return location.pathname.startsWith("/komiksi") ? "fun.aurakids.comics" : "fun.aurakids.stories";
  } catch { return "fun.aurakids.stories"; }
}

export function isStoreApp(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(STORE_KEY) === "1") return true;
    if (detectStoreApp()) { localStorage.setItem(STORE_KEY, "1"); return true; }
  } catch { /* ignore */ }
  return false;
}

// Call once on load. Old builds unlocked with ?full=1 and "ak-unlocked";
// both are ignored now (that flag could be set by anyone).
export function initUnlock() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("ak-unlocked");
    isStoreApp();
  } catch { /* ignore */ }
}

export function isPaid(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(PAID_KEY) === "1"; } catch { return false; }
}

// No demo counter and no paywall for paid families and inside the Play app.
export function isUnlocked(): boolean {
  return isPaid() || isStoreApp();
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
// the family to any device (restore the code → paid). Called on app load and
// right after returning from Stripe. The server is the only source of truth.
export async function checkServerUnlock(code: string): Promise<boolean> {
  if (!code) return isPaid();
  try {
    const res = await fetch(`/api/unlocked?code=${encodeURIComponent(code)}`, { cache: "no-store" });
    const { unlocked } = await res.json();
    if (unlocked) localStorage.setItem(PAID_KEY, "1");
    else localStorage.removeItem(PAID_KEY);
    return !!unlocked;
  } catch { /* offline: keep what we knew */ }
  return isPaid();
}
