import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// Small helper: returns a tiny JPEG (base64) of a story-images asset, so the
// image can be inspected without downloading the full-size file. Name-restricted
// to the bucket (no arbitrary URLs).
const BASE = "https://cdthqixswrcxkyodzdjp.supabase.co/storage/v1/object/public/story-images";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const name = req.nextUrl.searchParams.get("name") || "";
    if (!/^[\w.-]{1,80}\.(png|jpg|jpeg|webp)$/i.test(name)) {
      return NextResponse.json({ error: "bad name" }, { status: 400 });
    }
    const w = Math.min(400, Math.max(64, parseInt(req.nextUrl.searchParams.get("w") || "240", 10) || 240));
    const res = await fetch(`${BASE}/${name}`);
    if (!res.ok) return NextResponse.json({ error: `not found ${res.status}` }, { status: 404 });
    const input = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(input).metadata();
    const out = await sharp(input).resize(w, w, { fit: "inside" }).jpeg({ quality: 70 }).toBuffer();
    return NextResponse.json({
      name,
      width: meta.width,
      height: meta.height,
      b64: out.toString("base64"),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 500 });
  }
}
