import { createHash, createSign } from "crypto";
import { getSupabase } from "@/lib/supabase";
import type { SubState } from "@/lib/billing";

// Google Play subscriptions for the Android apps (TWA + Digital Goods API).
// The app sends the purchase token; we check it with the Android Publisher API
// using a service account (GOOGLE_PLAY_SA_JSON, the whole JSON key), store the
// state per family code (libraries/playsubs/<code>.json) and acknowledge it.
// One token can belong to one family code only (playtokens/<hash>.json).

export const PLAY_PACKAGES = ["fun.aurakids.stories", "fun.aurakids.comics"] as const;
export const PLAY_SKUS = { month: "aurakids_month", year: "aurakids_year" } as const;
const BUCKET = "libraries";

export function isPlayPackage(p: unknown): p is (typeof PLAY_PACKAGES)[number] {
  return typeof p === "string" && (PLAY_PACKAGES as readonly string[]).includes(p);
}

let cached: { token: string; exp: number } | null = null;
async function accessToken(): Promise<string> {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const raw = process.env.GOOGLE_PLAY_SA_JSON;
  if (!raw) throw new Error("play-not-configured");
  const sa = JSON.parse(raw) as { client_email: string; private_key: string };
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: sa.client_email, scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
  })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key).toString("base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
  });
  const d = await res.json();
  if (!d.access_token) throw new Error("play-auth");
  cached = { token: d.access_token, exp: Date.now() + (d.expires_in || 3600) * 1000 };
  return cached.token;
}

const API = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications";

interface PlaySubV2 {
  subscriptionState?: string; // SUBSCRIPTION_STATE_ACTIVE | _IN_GRACE_PERIOD | _ON_HOLD | _CANCELED | _EXPIRED ...
  acknowledgementState?: string;
  lineItems?: { productId?: string; expiryTime?: string; offerDetails?: { offerId?: string } }[];
}

async function fetchSub(pkg: string, token: string): Promise<PlaySubV2> {
  const res = await fetch(`${API}/${pkg}/purchases/subscriptionsv2/tokens/${encodeURIComponent(token)}`, {
    headers: { Authorization: `Bearer ${await accessToken()}` },
  });
  if (!res.ok) throw new Error(`play-verify ${res.status}`);
  return res.json();
}

async function acknowledge(pkg: string, productId: string, token: string) {
  await fetch(`${API}/${pkg}/purchases/subscriptions/${productId}/tokens/${encodeURIComponent(token)}:acknowledge`, {
    method: "POST", headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" }, body: "{}",
  }).catch(() => {});
}

export interface PlaySub { pkg: string; token: string; productId: string; state: string; expiry: number; trial: boolean; updated: string }

const LIVE = new Set(["SUBSCRIPTION_STATE_ACTIVE", "SUBSCRIPTION_STATE_IN_GRACE_PERIOD", "SUBSCRIPTION_STATE_CANCELED"]);

async function read<T>(path: string): Promise<T | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb.storage.from(BUCKET).download(path);
    if (error || !data) return null;
    return JSON.parse(await data.text());
  } catch { return null; }
}
async function write(path: string, v: unknown) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.storage.from(BUCKET).upload(path, new Blob([JSON.stringify(v)], { type: "application/json" }), { contentType: "application/json", upsert: true });
}
const tokenPath = (token: string) => `playtokens/${createHash("sha256").update(token).digest("hex").slice(0, 32)}.json`;

function toState(pkg: string, token: string, s: PlaySubV2): PlaySub {
  const li = s.lineItems?.[0] ?? {};
  return {
    pkg, token, productId: li.productId || "",
    state: s.subscriptionState || "",
    expiry: li.expiryTime ? Math.floor(Date.parse(li.expiryTime) / 1000) : 0,
    trial: /trial/i.test(li.offerDetails?.offerId || ""),
    updated: new Date().toISOString(),
  };
}

// Verify a purchase from the app and bind it to the family code.
export async function linkPlayPurchase(code: string, pkg: string, token: string): Promise<{ ok: boolean; reason?: string; sub?: PlaySub }> {
  const owner = await read<{ code: string }>(tokenPath(token));
  if (owner && owner.code !== code) return { ok: false, reason: "token-in-use" };
  const s = toState(pkg, token, await fetchSub(pkg, token));
  if (!LIVE.has(s.state) || s.expiry * 1000 < Date.now()) return { ok: false, reason: "not-active" };
  await write(tokenPath(token), { code });
  await write(`playsubs/${code}.json`, s);
  await acknowledge(pkg, s.productId, token);
  return { ok: true, sub: s };
}

// Current Play subscription for a family code, refreshed from Google once the
// stored period is over (renewal, cancellation).
export async function activePlaySub(code: string): Promise<SubState | null> {
  let s = await read<PlaySub>(`playsubs/${code}.json`);
  if (!s) return null;
  const now = Math.floor(Date.now() / 1000);
  if (s.expiry < now) {
    try { s = toState(s.pkg, s.token, await fetchSub(s.pkg, s.token)); await write(`playsubs/${code}.json`, s); }
    catch { /* keep stored */ }
  }
  if (!LIVE.has(s.state) || s.expiry + 3 * 86400 < now) return null;
  return { subId: `play:${s.productId}`, customer: "google-play", status: s.trial ? "trialing" : "active", periodEnd: s.expiry, trialEnd: s.trial ? s.expiry : null, updated: s.updated };
}
