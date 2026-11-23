import { NextRequest, NextResponse } from "next/server";
import { getEntitlement } from "@/lib/billing";

// Has this family code paid for full access? Used to restore the unlock on
// other devices (the code travels with the library restore).
const CODE = /^[A-Z0-9-]{8,40}$/;

export async function GET(req: NextRequest) {
  const code = (req.nextUrl.searchParams.get("code") || "").toUpperCase();
  if (!CODE.test(code)) return NextResponse.json({ unlocked: false });
  const ent = await getEntitlement(code);
  return NextResponse.json({
    unlocked: ent.paid,
    plan: ent.paid ? ent.kind : null,
    renews: ent.paid && ent.kind !== "lifetime" ? ent.sub.periodEnd : null,
    store: ent.paid && ent.kind !== "lifetime" && ent.sub.customer === "google-play" ? "play" : ent.paid ? "web" : null,
  }, { headers: { "Cache-Control": "no-store" } });
}
