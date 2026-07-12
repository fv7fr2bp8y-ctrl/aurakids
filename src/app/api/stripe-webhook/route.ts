import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { markUnlocked } from "@/lib/supabase";

// Stripe calls this server-to-server on payment events (retries until 200), so
// a paid unlock is recorded even if the user never returns to the site.
// Set STRIPE_WEBHOOK_SECRET (whsec_...) from the Stripe dashboard endpoint.
export const runtime = "nodejs";

const CODE = /^[A-Z0-9-]{8,40}$/;

// Verify Stripe's signature header without the SDK.
function verify(payload: string, header: string, secret: string): boolean {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature") || "";
  const raw = await req.text();

  if (!secret || !verify(raw, sig, secret)) {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(raw);
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data?.object;
      if (session?.payment_status === "paid") {
        const code = String(session?.metadata?.code || "").toUpperCase();
        if (CODE.test(code)) await markUnlocked(code);
      }
    }
  } catch { /* ignore malformed */ }

  // Always 200 so Stripe stops retrying a handled event.
  return NextResponse.json({ received: true });
}
