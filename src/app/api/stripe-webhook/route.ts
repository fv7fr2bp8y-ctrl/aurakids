import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { markUnlocked } from "@/lib/supabase";
import { saveSubscription, stripe } from "@/lib/billing";

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
    const obj = event.data?.object;
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const code = String(obj?.metadata?.code || "").toUpperCase();
      if (CODE.test(code)) {
        if (obj?.mode === "subscription" && obj?.subscription) {
          const subId = typeof obj.subscription === "string" ? obj.subscription : obj.subscription.id;
          await saveSubscription(code, await stripe(`/subscriptions/${subId}`));
        } else if (obj?.payment_status === "paid") {
          await markUnlocked(code);
        }
      }
    }
    // Renewals, cancellations, failed payments (needs these events enabled on
    // the Stripe endpoint; without them the state still refreshes on expiry).
    if (event.type?.startsWith("customer.subscription.")) {
      const code = String(obj?.metadata?.code || "").toUpperCase();
      if (CODE.test(code) && obj?.metadata?.app === "aurakids") await saveSubscription(code, obj);
    }
  } catch (e) {
    // Let Stripe retry if our side failed (e.g. storage down).
    console.error("Stripe webhook error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "retry" }, { status: 500 });
  }

  // Always 200 so Stripe stops retrying a handled event.
  return NextResponse.json({ received: true });
}
