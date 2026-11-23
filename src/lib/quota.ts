import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSupabase } from "@/lib/supabase";
import { getEntitlement } from "@/lib/billing";

// Server-side spending brake for the paid AI endpoints. The browser can no
// longer unlock anything by itself: a family code counts as paid only when
// Stripe marked it (unlocks/<code>.json), everyone else gets a small free
// allowance per IP per day, and all free traffic together has a daily ceiling
// so a script or a viral moment can't run up the AI bill.
//
// Counters are tiny JSON files in the private "libraries" bucket under
// limits/<YYYY-MM-DD>/… (UTC day). Read-modify-write is not atomic; under
// parallel requests a counter can lag by one or two, which is fine for a brake.

export type QuotaKind = "story" | "comic" | "image" | "tts";

// Per IP per day, not paid (web demo and the free Play apps).
const FREE: Record<QuotaKind, number> = { story: 4, comic: 1, image: 15, tts: 5 };
// Per paid family code per day.
const PAID: Record<QuotaKind, number> = { story: 15, comic: 5, image: 60, tts: 20 };
// Subscribers per calendar month, and during the 7-day trial in total.
const MONTHLY: Partial<Record<QuotaKind, number>> = { story: 30, comic: 6 };
const TRIAL: Partial<Record<QuotaKind, number>> = { story: 7, comic: 2 };
// All free traffic together per day (worst case ≈ 19 € of AI per day).
const GLOBAL_FREE: Record<QuotaKind, number> = { story: 40, comic: 6, image: 150, tts: 40 };

const CODE = /^[A-Z0-9-]{8,40}$/;
const BUCKET = "libraries";

export function familyCodeFrom(req: NextRequest): string {
  const raw = req.cookies.get("ak_code")?.value || req.headers.get("x-family-code") || "";
  const code = decodeURIComponent(raw).trim().toUpperCase();
  return CODE.test(code) ? code : "";
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for") || "";
  return fwd.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

function ipKey(req: NextRequest): string {
  // Only a salted hash is stored, never the address itself.
  const salt = process.env.QUOTA_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "aurakids";
  return createHash("sha256").update(`${salt}|${clientIp(req)}`).digest("hex").slice(0, 24);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

type Sb = NonNullable<ReturnType<typeof getSupabase>>;

async function readCount(sb: Sb, path: string): Promise<number> {
  try {
    const { data, error } = await sb.storage.from(BUCKET).download(path);
    if (error || !data) return 0;
    const n = Number(JSON.parse(await data.text())?.n);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

async function writeCount(sb: Sb, path: string, n: number): Promise<void> {
  try {
    const body = new Blob([JSON.stringify({ n: Math.max(0, n) })], { type: "application/json" });
    await sb.storage.from(BUCKET).upload(path, body, { contentType: "application/json", upsert: true });
  } catch { /* best effort */ }
}

export type QuotaResult =
  | { ok: true; paid: boolean; refund: () => Promise<void> }
  | { ok: false; paid: boolean; scope: "free" | "paid" | "busy" };

// Reserve one unit of `kind`. Call right before the paid provider call; call
// refund() if generation fails so the user isn't charged a unit for nothing.
export async function takeQuota(req: NextRequest, kind: QuotaKind): Promise<QuotaResult> {
  const sb = getSupabase();
  // Without storage we can't count. Fail closed for the expensive kinds.
  if (!sb) return kind === "comic" || kind === "story" ? { ok: false, paid: false, scope: "busy" } : { ok: true, paid: false, refund: async () => {} };

  const code = familyCodeFrom(req);
  const ent = await getEntitlement(code);
  const paid = ent.paid;
  const day = today();

  const checks: { path: string; limit: number; scope: "free" | "paid" | "busy" }[] = paid
    ? [
        { path: `limits/${day}/code-${code}-${kind}.json`, limit: PAID[kind], scope: "paid" },
        ...(ent.kind === "sub" && MONTHLY[kind] != null
          ? [{ path: `limits/m-${day.slice(0, 7)}/code-${code}-${kind}.json`, limit: MONTHLY[kind]!, scope: "paid" as const }]
          : []),
        ...(ent.kind === "trial" && TRIAL[kind] != null
          ? [{ path: `limits/trial-${ent.sub.subId}/${kind}.json`, limit: TRIAL[kind]!, scope: "paid" as const }]
          : []),
      ]
    : [
        { path: `limits/${day}/ip-${ipKey(req)}-${kind}.json`, limit: FREE[kind], scope: "free" },
        { path: `limits/${day}/global-free-${kind}.json`, limit: GLOBAL_FREE[kind], scope: "busy" },
      ];

  const counts = await Promise.all(checks.map((c) => readCount(sb, c.path)));
  for (let i = 0; i < checks.length; i++) {
    if (counts[i] >= checks[i].limit) return { ok: false, paid, scope: checks[i].scope };
  }
  await Promise.all(checks.map((c, i) => writeCount(sb, c.path, counts[i] + 1)));

  return {
    ok: true,
    paid,
    refund: async () => {
      const now = await Promise.all(checks.map((c) => readCount(sb, c.path)));
      await Promise.all(checks.map((c, i) => writeCount(sb, c.path, now[i] - 1)));
    },
  };
}

// Standard "limit reached" answer the app understands.
export function quotaDenied(r: Extract<QuotaResult, { ok: false }>): NextResponse {
  return NextResponse.json({ error: "limit", scope: r.scope, paid: r.paid }, { status: 429 });
}

// Read-only view for the app and for checks (no counter changes).
export async function quotaStatus(req: NextRequest) {
  const sb = getSupabase();
  const code = familyCodeFrom(req);
  const ent = await getEntitlement(code);
  const paid = ent.paid;
  if (!sb) return { paid, storage: false };
  const day = today();
  const kinds: QuotaKind[] = ["story", "comic", "image", "tts"];
  const used = await Promise.all(kinds.map((k) =>
    readCount(sb, paid ? `limits/${day}/code-${code}-${k}.json` : `limits/${day}/ip-${ipKey(req)}-${k}.json`)));
  const limits = paid ? PAID : FREE;
  return {
    paid,
    plan: ent.paid ? ent.kind : null,
    storage: true,
    day,
    left: Object.fromEntries(kinds.map((k, i) => [k, Math.max(0, limits[k] - used[i])])),
  };
}
