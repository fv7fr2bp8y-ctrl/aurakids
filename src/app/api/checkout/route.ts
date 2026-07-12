import { NextRequest, NextResponse } from "next/server";

// Starts a Stripe Checkout for the one-time "Пълен достъп" unlock, tied to the
// visitor's family code. Requires env: STRIPE_SECRET_KEY, STRIPE_PRICE_ID
// (a one-time price created in the Stripe dashboard).
const CODE = /^[A-Z0-9-]{8,40}$/;

// GET = configuration self-check: verifies the key and price against Stripe
// without creating anything. Exposes only booleans + the public price.
export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRICE_ID;
  if (!key || !price) {
    return NextResponse.json({ configured: false, STRIPE_SECRET_KEY: key ? "SET" : "MISSING", STRIPE_PRICE_ID: price ? "SET" : "MISSING" });
  }
  try {
    const res = await fetch(`https://api.stripe.com/v1/prices/${price}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const p = await res.json();
    if (!res.ok) return NextResponse.json({ configured: false, error: p?.error?.message || res.status });
    return NextResponse.json({
      configured: true,
      livemode: p.livemode,
      currency: p.currency,
      amount: p.unit_amount != null ? p.unit_amount / 100 : null,
      type: p.type,
      webhook: process.env.STRIPE_WEBHOOK_SECRET ? "SET" : "MISSING",
    });
  } catch (e) {
    return NextResponse.json({ configured: false, error: e instanceof Error ? e.message : "error" });
  }
}

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
      // What shows on the buyer's bank statement (Latin, ≤22 chars).
      "payment_intent_data[statement_descriptor]": "AURAKIDS",
      "payment_intent_data[statement_descriptor_suffix]": "AURAKIDS",
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
