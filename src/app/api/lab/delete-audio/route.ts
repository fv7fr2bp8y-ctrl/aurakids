import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// TEMPORARY, preview only: remove recordings made with the withdrawn voice
// "Мария" from the story-audio bucket (one file per call, hex names only).
export async function GET(req: NextRequest) {
  if (process.env.VERCEL_ENV !== "preview") return NextResponse.json({ error: "not found" }, { status: 404 });
  const f = req.nextUrl.searchParams.get("f") || "";
  if (!/^[a-f0-9]{40}\.mp3$/.test(f)) return NextResponse.json({ error: "bad name" }, { status: 400 });
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: "no storage" }, { status: 503 });
  const { data, error } = await sb.storage.from("story-audio").remove([f]);
  return NextResponse.json({ removed: data?.map((x) => x.name) ?? [], error: error?.message ?? null });
}
