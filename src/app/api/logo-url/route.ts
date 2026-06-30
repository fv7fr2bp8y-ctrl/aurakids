import { NextResponse } from "next/server";
import { getCachedImage } from "@/lib/supabase";

export async function GET() {
  const url = await getCachedImage("logo-concept-portal-world-v1.png");
  return NextResponse.json({ url });
}
