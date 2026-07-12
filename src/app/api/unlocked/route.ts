import { NextRequest, NextResponse } from "next/server";
import { isCodeUnlocked } from "@/lib/supabase";

// Has this family code paid for full access? Used to restore the unlock on
// other devices (the code travels with the library restore).
const CODE = /^[A-Z0-9-]{8,40}$/;

export async function GET(req: NextRequest) {
  const code = (req.nextUrl.searchParams.get("code") || "").toUpperCase();
  if (!CODE.test(code)) return NextResponse.json({ unlocked: false });
  return NextResponse.json({ unlocked: await isCodeUnlocked(code) });
}
