import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: "No Supabase" }, { status: 503 });

  const [storiesRes, imagesRes, audioRes] = await Promise.all([
    sb.from("stories").select("*").order("created_at", { ascending: false }),
    sb.storage.from("story-images").list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } }),
    sb.storage.from("story-audio").list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } }),
  ]);

  const imageBase = `${process.env.SUPABASE_URL}/storage/v1/object/public/story-images/`;
  const audioBase = `${process.env.SUPABASE_URL}/storage/v1/object/public/story-audio/`;

  return NextResponse.json({
    stories: storiesRes.data ?? [],
    images: (imagesRes.data ?? []).map((f) => ({ name: f.name, url: imageBase + f.name, size: f.metadata?.size })),
    audio: (audioRes.data ?? []).map((f) => ({ name: f.name, url: audioBase + f.name, size: f.metadata?.size })),
  });
}
