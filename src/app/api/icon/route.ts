import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// Serves an AuraKids app icon from our own origin (proxying the brand-kit
// assets in Supabase storage), resized on the fly to any size and, for
// maskable icons, padded on the brand background so the OS mask never clips
// the artwork. `?app=story|comic|both` selects which brand icon.
// Powers PWA icons, favicon and apple-touch-icon for each build.
const BASE = "https://cdthqixswrcxkyodzdjp.supabase.co/storage/v1/object/public/story-images";
const SOURCES: Record<string, string> = {
  both: `${BASE}/app-icon.png`,
  story: `${BASE}/app-icon.png`,
  comic: `${BASE}/app-icon-comic.png`,
};
const BG = { r: 26, g: 5, b: 51, alpha: 1 }; // --ak-purple-night

export const runtime = "nodejs";
export const revalidate = 604800;

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams;
    const size = Math.min(1024, Math.max(16, parseInt(p.get("size") || "512", 10) || 512));
    const padded = p.get("padded") === "1";
    const app = p.get("app") || "both";
    const source = SOURCES[app] || SOURCES.both;

    let res = await fetch(source, { next: { revalidate: 604800 } });
    if (!res.ok && source !== SOURCES.both) res = await fetch(SOURCES.both, { next: { revalidate: 604800 } });
    if (!res.ok) return NextResponse.json({ error: "not found" }, { status: 502 });
    const input = Buffer.from(await res.arrayBuffer());

    // The comic logo may not be perfectly square, so contain it on the brand
    // background rather than cropping. The AuraKids mark is square → cover.
    const fit: "cover" | "contain" = app === "comic" ? "contain" : "cover";

    let out: Buffer;
    if (padded) {
      const inner = Math.round(size * 0.78);
      const art = await sharp(input).resize(inner, inner, { fit, background: BG }).png().toBuffer();
      out = await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
        .composite([{ input: art, gravity: "centre" }])
        .png().toBuffer();
    } else if (fit === "contain") {
      out = await sharp(input).resize(size, size, { fit: "contain", background: BG }).flatten({ background: BG }).png().toBuffer();
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
