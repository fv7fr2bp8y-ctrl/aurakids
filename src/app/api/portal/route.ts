import { NextRequest, NextResponse } from "next/server";
import { readSub, stripe, siteOrigin } from "@/lib/billing";

// Stripe customer portal: cancel, change card, invoices. POST { code } → { url }.
const CODE = /^[A-Z0-9-]{8,40}$/;

export async function POST(req: NextRequest) {
  try {
    const { code: raw } = await req.json();
    const code = String(raw || "").toUpperCase();
    if (!CODE.test(code)) return NextResponse.json({ error: "bad code" }, { status: 400 });
    const sub = await readSub(code);
    if (!sub?.customer) return NextResponse.json({ error: "no subscription" }, { status: 404 });
    const origin = siteOrigin(req.nextUrl.origin);
    const session = await stripe("/billing_portal/sessions", { form: { customer: sub.customer, return_url: `${origin}/` } });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Portal error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "portal unavailable" }, { status: 502 });
  }
}
