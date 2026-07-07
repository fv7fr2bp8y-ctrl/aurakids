import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// Serves the AuraKids app icon from our own origin (proxying the brand-kit
// asset in Supabase storage), resized on the fly to any requested size and,
// for maskable icons, padded on the brand background so the OS mask never
// clips the artwork. Powers PWA icons, favicon and apple-touch-icon.
const SOURCE = "https://cdthqixswrcxkyodzdjp.supabase.co/storage/v1/object/public/story-images/app-icon.png";
const BG = { r: 26, g: 5, b: 51, alpha: 1 }; // --ak-purple-night

export const runtime = "nodejs";
export const revalidate = 604800;

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams;
    const size = Math.min(1024, Math.max(16, parseInt(p.get("size") || "512", 10) || 512));
    const padded = p.get("padded") === "1";

    const res = await fetch(SOURCE, { next: { revalidate: 604800 } });
    if (!res.ok) return NextResponse.json({ error: "not found" }, { status: 502 });
    const input = Buffer.from(await res.arrayBuffer());

    let out: Buffer;
    if (padded) {
      // Maskable: artwork at ~78% inside a full-bleed brand-color square.
      const inner = Math.round(size * 0.78);
      const art = await sharp(input).resize(inner, inner, { fit: "cover" }).png().toBuffer();
      out = await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
        .composite([{ input: art, gravity: "centre" }])
        .png().toBuffer();
    } else {
      out = await sharp(input).resize(size, size, { fit: "cover" }).png().toBuffer();
    }

    return new NextResponse(new Uint8Array(out), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
