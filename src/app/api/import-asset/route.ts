import { NextRequest, NextResponse } from "next/server";
import { saveImageToStorage } from "@/lib/supabase";

export const maxDuration = 60;

// One-off asset importer: pulls a publicly shared Google Drive file into
// Supabase storage so the app can serve it from its own CDN.
export async function POST(req: NextRequest) {
  try {
    const { id, name } = await req.json();
    if (!/^[\w-]{10,}$/.test(id || "") || !/^[\w.-]{3,64}$/.test(name || "")) {
      return NextResponse.json({ error: "bad params" }, { status: 400 });
    }
    const url = `https://drive.google.com/uc?export=download&id=${id}`;
    const publicUrl = await saveImageToStorage(name, url);
    if (!publicUrl) return NextResponse.json({ error: "fetch/upload failed" }, { status: 502 });
    return NextResponse.json({ url: publicUrl });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
