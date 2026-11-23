"use client";

import { isStoreApp, storePackage, checkServerUnlock } from "@/lib/demo";

// Google Play Billing inside the Android apps (TWA), through the Digital Goods
// API + Payment Request. Only works in an app build with Play Billing enabled;
// everywhere else playBillingAvailable() is false and the web uses Stripe.

const PLAY = "https://play.google.com/billing";
export const PLAY_SKU = { month: "aurakids_month", year: "aurakids_year" } as const;

type Price = { currency: string; value: string };
interface DGService {
  getDetails(ids: string[]): Promise<{ itemId: string; price: Price }[]>;
  listPurchases(): Promise<{ itemId: string; purchaseToken: string }[]>;
}
type W = Window & { getDigitalGoodsService?: (m: string) => Promise<DGService> };

let svc: Promise<DGService | null> | null = null;
function service(): Promise<DGService | null> {
  if (svc) return svc;
  const w = window as W;
  svc = (isStoreApp() && typeof w.getDigitalGoodsService === "function" && "PaymentRequest" in window)
    ? w.getDigitalGoodsService(PLAY).catch(() => null)
    : Promise.resolve(null);
  return svc;
}

export async function playBillingAvailable(): Promise<boolean> {
  return !!(await service());
}

export async function playPrices(): Promise<{ month: number; year: number; currency: string } | null> {
  const s = await service();
  if (!s) return null;
  try {
    const items = await s.getDetails([PLAY_SKU.month, PLAY_SKU.year]);
    const m = items.find((i) => i.itemId === PLAY_SKU.month)?.price;
    const y = items.find((i) => i.itemId === PLAY_SKU.year)?.price;
    if (!m || !y) return null;
    return { month: Number(m.value), year: Number(y.value), currency: m.currency.toLowerCase() };
  } catch { return null; }
}

async function link(code: string, token: string): Promise<boolean> {
  const res = await fetch("/api/play/verify", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, pkg: storePackage(), token }),
  });
  const d = await res.json().catch(() => ({}));
  if (d?.ok) await checkServerUnlock(code);
  return !!d?.ok;
}

// Buy a plan. Resolves true once the server confirmed the subscription.
export async function buyPlay(plan: "month" | "year", code: string): Promise<boolean> {
  const s = await service();
  if (!s) return false;
  const req = new PaymentRequest([{ supportedMethods: PLAY, data: { sku: PLAY_SKU[plan] } }],
    { total: { label: "Total", amount: { currency: "EUR", value: "0" } } });
  const resp = await req.show();
  const token = (resp.details as { purchaseToken?: string })?.purchaseToken || "";
  const ok = token ? await link(code, token) : false;
  await resp.complete(ok ? "success" : "fail");
  return ok;
}

// After a reinstall or on a new phone: attach subscriptions Play already has.
export async function restorePlay(code: string): Promise<boolean> {
  const s = await service();
  if (!s) return false;
  try {
    const list = await s.listPurchases();
    for (const p of list) if (await link(code, p.purchaseToken)) return true;
  } catch { /* nothing to restore */ }
  return false;
}
