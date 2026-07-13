import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// Serves an AuraKids app icon from our own origin (proxying the brand-kit
// assets in Supabase storage), resized on the fly to any size and, for
// maskable icons, padded on the brand background so the OS mask never clips
// the artwork. `?app=story|comic|both` selects which brand icon.
// Powers PWA icons, favicon and apple-touch-icon for each build.
const BASE = "https://cdthqixswrcxkyodzdjp.supabase.co/storage/v1/object/public/story-images";
const SOURCES: Record<string, string> = {
  both: `${BASE}/app-icon-portal-v1.png`,
  story: `${BASE}/app-icon-story-v1.png`,
  comic: `${BASE}/app-icon-comic-v2.png`,
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
    let input = Buffer.from(await res.arrayBuffer());

    // All brand icons ship as a rounded purple square on a white/black sheet.
    // Trim the margin, then crop past the rounded corners so the artwork
    // fills the whole canvas — the OS applies its own corner mask.
    {
      const trimmed = sharp(input).trim({ threshold: 25 });
      const meta = await trimmed.toBuffer({ resolveWithObject: true });
      const { width: tw, height: th } = meta.info;
      const cut = Math.round(Math.min(tw, th) * 0.075);
      input = Buffer.from(await sharp(meta.data)
        .extract({ left: cut, top: cut, width: tw - cut * 2, height: th - cut * 2 })
        .toBuffer());
    }

    let out: Buffer;
    if (padded) {
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
