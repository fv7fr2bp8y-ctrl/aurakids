import { getSupabase } from "@/lib/supabase";

// Subscription billing for the web (Stripe). One product, two prices:
// 4,99 €/month and 39,99 €/year, both with a 7-day free trial (card required).
// Prices are found by lookup_key and created on first use with the server's
// own Stripe key, so no dashboard setup is needed. Env overrides:
// STRIPE_SUB_PRICE_MONTH / STRIPE_SUB_PRICE_YEAR.

export type Plan = "month" | "year";

export const PLANS: Record<Plan, { amount: number; lookupKey: string; env: string }> = {
  month: { amount: 499, lookupKey: "aurakids_sub_month_eur", env: "STRIPE_SUB_PRICE_MONTH" },
  year: { amount: 3999, lookupKey: "aurakids_sub_year_eur", env: "STRIPE_SUB_PRICE_YEAR" },
};
export const TRIAL_DAYS = 7;

const API = "https://api.stripe.com/v1";

export async function stripe(path: string, init: { method?: string; form?: Record<string, string> } = {}) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("stripe not configured");
  const res = await fetch(`${API}${path}`, {
    method: init.method || (init.form ? "POST" : "GET"),
    headers: { Authorization: `Bearer ${key}`, ...(init.form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}) },
    body: init.form ? new URLSearchParams(init.form).toString() : undefined,
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || `stripe ${res.status}`);
  return json;
}

const priceCache: Partial<Record<Plan, string>> = {};

async function findPrice(plan: Plan): Promise<{ id: string; product: string } | null> {
  const r = await stripe(`/prices?active=true&lookup_keys[]=${PLANS[plan].lookupKey}&limit=1`);
  const p = r?.data?.[0];
  return p ? { id: p.id, product: typeof p.product === "string" ? p.product : p.product?.id } : null;
}

export async function getPriceId(plan: Plan): Promise<string> {
  const fromEnv = process.env[PLANS[plan].env];
  if (fromEnv) return fromEnv;
  if (priceCache[plan]) return priceCache[plan]!;

  const found = await findPrice(plan);
  if (found) return (priceCache[plan] = found.id);

  // Create the product once (via the monthly price) and hang both prices on it.
  const other = await findPrice(plan === "month" ? "year" : "month");
  const form: Record<string, string> = {
    currency: "eur",
    unit_amount: String(PLANS[plan].amount),
    "recurring[interval]": plan,
    lookup_key: PLANS[plan].lookupKey,
    transfer_lookup_key: "true",
    tax_behavior: "inclusive",
    "metadata[app]": "aurakids",
  };
  if (other?.product) form.product = other.product;
  else {
    form["product_data[name]"] = "AuraKids Абонамент";
    form["product_data[tax_code]"] = "txcd_10000000";
    form["product_data[metadata][app]"] = "aurakids";
  }
  const created = await stripe("/prices", { form });
  return (priceCache[plan] = created.id);
}

// ---------- Subscription state per family code ----------
// libraries/subs/<code>.json, written by the webhook and the success redirect,
// refreshed from Stripe whenever it looks expired (so renewals work even if a
// webhook event is missed).

export interface SubState {
  subId: string;
  customer: string;
  status: string;          // trialing | active | past_due | canceled | ...
  periodEnd: number;       // unix seconds
  trialEnd: number | null; // unix seconds
  updated: string;
}

const BUCKET = "libraries";

export async function readSub(code: string): Promise<SubState | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb.storage.from(BUCKET).download(`subs/${code}.json`);
    if (error || !data) return null;
    return JSON.parse(await data.text());
  } catch {
    return null;
  }
}

async function writeSub(code: string, s: SubState) {
  const sb = getSupabase();
  if (!sb) return;
  const body = new Blob([JSON.stringify(s)], { type: "application/json" });
  await sb.storage.from(BUCKET).upload(`subs/${code}.json`, body, { contentType: "application/json", upsert: true });
}

// Stripe API 2025+ moved current_period_end onto subscription items.
function periodEndOf(sub: { current_period_end?: number; items?: { data?: { current_period_end?: number }[] } }): number {
  return sub.current_period_end || sub.items?.data?.[0]?.current_period_end || 0;
}

export async function saveSubscription(code: string, sub: Record<string, unknown> & { id: string }) {
  await writeSub(code, {
    subId: sub.id,
    customer: String(sub.customer || ""),
    status: String(sub.status || ""),
    periodEnd: periodEndOf(sub as never),
    trialEnd: (sub.trial_end as number) || null,
    updated: new Date().toISOString(),
  });
}

export async function syncSubscription(code: string, subId: string): Promise<SubState | null> {
  const sub = await stripe(`/subscriptions/${subId}`);
  await saveSubscription(code, sub);
  return readSub(code);
}

const LIVE = new Set(["trialing", "active", "past_due"]);

// Current subscription state, refreshed from Stripe when the stored period has
// ended (renewal, cancellation) so it never relies on a single webhook.
export async function activeSub(code: string): Promise<SubState | null> {
  let s = await readSub(code);
  if (!s) return null;
  const now = Math.floor(Date.now() / 1000);
  if (s.periodEnd && s.periodEnd < now) {
    try { s = await syncSubscription(code, s.subId); } catch { /* keep stored */ }
  }
  if (!s || !LIVE.has(s.status)) return null;
  if (s.periodEnd && s.periodEnd + 3 * 86400 < now) return null; // grace for slow renewals
  return s;
}

// ---------- Entitlement ----------
export type Entitlement =
  | { paid: false }
  | { paid: true; kind: "lifetime" }
  | { paid: true; kind: "sub" | "trial"; sub: SubState };

async function hasLifetime(code: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { data, error } = await sb.storage.from(BUCKET).download(`unlocks/${code}.json`);
    return !error && !!data;
  } catch {
    return false;
  }
}

export async function getEntitlement(code: string): Promise<Entitlement> {
  if (!code) return { paid: false };
  const [life, sub] = await Promise.all([hasLifetime(code), activeSub(code).catch(() => null)]);
  if (life) return { paid: true, kind: "lifetime" };
  if (sub) return { paid: true, kind: sub.status === "trialing" ? "trial" : "sub", sub };
  return { paid: false };
}

// Return the visitor to the same host they paid from: localStorage (family
// code, library) is per origin, so www ↔ bare domain would lose it.
const OUR_ORIGINS = [/^https:\/\/(www\.)?aurakids\.fun$/, /^https:\/\/aurakids[\w-]*\.vercel\.app$/, /^http:\/\/localhost(:\d+)?$/];
export function siteOrigin(origin: string): string {
  return OUR_ORIGINS.some((re) => re.test(origin)) ? origin : "https://aurakids.fun";
}
