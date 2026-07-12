import { NextRequest, NextResponse } from "next/server";
import { markUnlocked } from "@/lib/supabase";

// Stripe success redirect lands here. We verify the session server-side with
// the secret key; only a genuinely paid session marks the family code unlocked.
const CODE = /^[A-Z0-9-]{8,40}$/;

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin.includes("localhost") ? req.nextUrl.origin : "https://www.aurakids.fun";
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id") || "";
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || !/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) {
      return NextResponse.redirect(`${origin}/?payment=failed`);
    }

    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const session = await res.json();

    if (res.ok && session?.payment_status === "paid") {
      const code = String(session?.metadata?.code || "").toUpperCase();
      if (CODE.test(code)) await markUnlocked(code);
      // ?full=1 also flips the local unlock immediately on this device.
      return NextResponse.redirect(`${origin}/?full=1&thanks=1`);
    }
    return NextResponse.redirect(`${origin}/?payment=failed`);
  } catch {
    return NextResponse.redirect(`${origin}/?payment=failed`);
  }
}
