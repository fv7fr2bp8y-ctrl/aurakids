import { NextRequest, NextResponse } from "next/server";

// Starts a Stripe Checkout for the one-time "Пълен достъп" unlock, tied to the
// visitor's family code. Requires env: STRIPE_SECRET_KEY, STRIPE_PRICE_ID
// (a one-time price created in the Stripe dashboard).
const CODE = /^[A-Z0-9-]{8,40}$/;

export async function POST(req: NextRequest) {
  try {
    const { code: raw } = await req.json();
    const code = String(raw || "").toUpperCase();
    if (!CODE.test(code)) return NextResponse.json({ error: "bad code" }, { status: 400 });

    const key = process.env.STRIPE_SECRET_KEY;
    const price = process.env.STRIPE_PRICE_ID;
    if (!key || !price) return NextResponse.json({ error: "payments not configured" }, { status: 503 });

    const origin = req.nextUrl.origin.includes("localhost") ? req.nextUrl.origin : "https://www.aurakids.fun";
    const params = new URLSearchParams({
      mode: "payment",
      "line_items[0][price]": price,
      "line_items[0][quantity]": "1",
      success_url: `${origin}/api/unlock?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=1`,
      "metadata[code]": code,
      locale: "auto",
    });

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const session = await res.json();
    if (!res.ok || !session?.url) {
      console.error("Stripe checkout error:", session?.error?.message || res.status);
      return NextResponse.json({ error: "checkout failed" }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
