import { NextRequest, NextResponse } from "next/server";
import { quotaStatus } from "@/lib/quota";

export const dynamic = "force-dynamic";

// GET → is this family code paid, and how many generations are left today.
export async function GET(req: NextRequest) {
  return NextResponse.json(await quotaStatus(req), { headers: { "Cache-Control": "no-store" } });
}
