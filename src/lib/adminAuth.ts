import { NextRequest, NextResponse } from "next/server";

// Guard for diagnostic/maintenance endpoints: require ?key=<ADMIN_KEY>.
// Returns a 401 response to send back, or null when authorized.
export function requireAdmin(req: NextRequest): NextResponse | null {
  const key = req.nextUrl.searchParams.get("key");
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
