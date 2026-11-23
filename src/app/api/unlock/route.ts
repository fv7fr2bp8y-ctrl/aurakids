import { NextRequest, NextResponse } from "next/server";
import { markUnlocked } from "@/lib/supabase";
import { stripe, saveSubscription, siteOrigin } from "@/lib/billing";

// Stripe success redirect lands here. The session is verified server-side with
// the secret key; only a completed session unlocks the family code.
const CODE = /^[A-Z0-9-]{8,40}$/;

export async function GET(req: NextRequest) {
  const origin = siteOrigin(req.nextUrl.origin);
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id") || "";
    if (!/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) return NextResponse.redirect(`${origin}/?payment=failed`);

    const session = await stripe(`/checkout/sessions/${sessionId}`);
    const code = String(session?.metadata?.code || "").toUpperCase();
    if (!CODE.test(code)) return NextResponse.redirect(`${origin}/?payment=failed`);

    if (session.mode === "subscription" && session.status === "complete" && session.subscription) {
      const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
      await saveSubscription(code, await stripe(`/subscriptions/${subId}`));
      return NextResponse.redirect(`${origin}/?thanks=1`);
    }
    if (session.mode === "payment" && session.payment_status === "paid") {
      await markUnlocked(code);
      return NextResponse.redirect(`${origin}/?thanks=1`);
    }
    return NextResponse.redirect(`${origin}/?payment=failed`);
  } catch {
    return NextResponse.redirect(`${origin}/?payment=failed`);
  }
}
