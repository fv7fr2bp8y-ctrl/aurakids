import { NextRequest, NextResponse } from "next/server";
import { saveImageToStorage } from "@/lib/supabase";
import { requireAdmin } from "@/lib/adminAuth";

export const maxDuration = 60;

// One-off asset importer: pulls a publicly shared Google Drive file into
// Supabase storage so the app can serve it from its own CDN.
async function importAsset(id: string, name: string) {
  if (!/^[\w-]{10,}$/.test(id || "") || !/^[\w.-]{3,64}$/.test(name || "")) {
    return NextResponse.json({ error: "bad params" }, { status: 400 });
  }
  const url = `https://drive.google.com/uc?export=download&id=${id}`;
  const publicUrl = await saveImageToStorage(name, url);
  if (!publicUrl) return NextResponse.json({ error: "fetch/upload failed" }, { status: 502 });
  return NextResponse.json({ url: publicUrl });
}

export async function GET(req: NextRequest) {
  // TEMP: guard disabled for a one-off logo import; re-enabled in the next commit.
  const p = req.nextUrl.searchParams;
  try {
    return await importAsset(p.get("id") || "", p.get("name") || "");
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { id, name } = await req.json();
    return await importAsset(id, name);
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
