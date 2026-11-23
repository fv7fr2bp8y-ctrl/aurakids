import { NextRequest, NextResponse } from "next/server";
import { isPlayPackage, linkPlayPurchase } from "@/lib/playBilling";

const CODE = /^[A-Z0-9-]{8,40}$/;

// The Android app bought (or restored) a subscription through Google Play:
// check the token with Google and attach it to the family code.
export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => ({}));
  const code = String(b?.code || "").trim().toUpperCase();
  const token = String(b?.token || "");
  if (!CODE.test(code) || !isPlayPackage(b?.pkg) || token.length < 20 || token.length > 4000) {
    return NextResponse.json({ ok: false, reason: "bad-request" }, { status: 400 });
  }
  try {
    const r = await linkPlayPurchase(code, b.pkg, token);
    return NextResponse.json({ ok: r.ok, reason: r.reason, until: r.sub?.expiry }, { status: r.ok ? 200 : 409 });
  } catch (e) {
    const msg = String((e as Error)?.message || "");
    console.error("[play] verify failed", b.pkg, msg);
    return NextResponse.json({ ok: false, reason: msg.startsWith("play-not-configured") ? "not-configured" : "verify-failed" }, { status: 503 });
  }
}
