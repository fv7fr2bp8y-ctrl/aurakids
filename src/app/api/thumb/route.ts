import { NextResponse } from "next/server";

// Thumbnail maker (admin tool) needed sharp; not available on Workers.
export async function GET() {
  return NextResponse.json({ error: "not available" }, { status: 501 });
}
