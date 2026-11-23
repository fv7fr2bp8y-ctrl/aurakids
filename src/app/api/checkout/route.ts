import { NextRequest, NextResponse } from "next/server";
import { PLANS, TRIAL_DAYS, getPriceId, stripe, type Plan, siteOrigin } from "@/lib/billing";

// Stripe Checkout tied to the visitor's family code.
//   plan "month" | "year" → subscription with a 7-day trial (card required)
//   no plan               → the old one-time "Пълен достъп" (STRIPE_PRICE_ID),
//                           kept so the current paywall keeps working.
const CODE = /^[A-Z0-9-]{8,40}$/;

// GET = public prices for the paywall + a configuration self-check (booleans only).
export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRICE_ID;
  const subscription = {
    currency: "eur",
    trialDays: TRIAL_DAYS,
    month: PLANS.month.amount / 100,
    year: PLANS.year.amount / 100,
  };
  if (!key || !price) {
    return NextResponse.json({ configured: false, subscription, STRIPE_SECRET_KEY: key ? "SET" : "MISSING", STRIPE_PRICE_ID: price ? "SET" : "MISSING" });
  }
  try {
    const p = await stripe(`/prices/${price}`);
    return NextResponse.json({
      configured: true,
      livemode: p.livemode,
      currency: p.currency,
      amount: p.unit_amount != null ? p.unit_amount / 100 : null,
      type: p.type,
      webhook: process.env.STRIPE_WEBHOOK_SECRET ? "SET" : "MISSING",
      subscription,
    });
  } catch (e) {
    return NextResponse.json({ configured: false, subscription, error: e instanceof Error ? e.message : "error" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { code: raw, plan: rawPlan } = await req.json();
    const code = String(raw || "").toUpperCase();
    if (!CODE.test(code)) return NextResponse.json({ error: "bad code" }, { status: 400 });
    const plan: Plan | null = rawPlan === "month" || rawPlan === "year" ? rawPlan : null;

    if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "payments not configured" }, { status: 503 });

    const origin = siteOrigin(req.nextUrl.origin);
    const form: Record<string, string> = {
      success_url: `${origin}/api/unlock?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=1`,
      "metadata[code]": code,
      client_reference_id: code,
      locale: "auto",
      "line_items[0][quantity]": "1",
    };

    if (plan) {
      form.mode = "subscription";
      form["line_items[0][price]"] = await getPriceId(plan);
      form["subscription_data[trial_period_days]"] = String(TRIAL_DAYS);
      form["subscription_data[metadata][code]"] = code;
      form["subscription_data[metadata][app]"] = "aurakids";
      // If the card is never confirmed, end the trial instead of billing.
      form["subscription_data[trial_settings][end_behavior][missing_payment_method]"] = "cancel";
      form.payment_method_collection = "always";
    } else {
      const price = process.env.STRIPE_PRICE_ID;
      if (!price) return NextResponse.json({ error: "payments not configured" }, { status: 503 });
      form.mode = "payment";
      form["line_items[0][price]"] = price;
      form["payment_intent_data[statement_descriptor_suffix]"] = "AURAKIDS";
    }

    const session = await stripe("/checkout/sessions", { form });
    if (!session?.url) return NextResponse.json({ error: "checkout failed" }, { status: 502 });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe checkout error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "checkout failed" }, { status: 502 });
  }
}
