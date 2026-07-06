import { NextResponse } from "next/server";

// Serves the AuraKids app icon from our own origin (proxying the brand-kit
// asset in Supabase storage) so PWA install + favicon stay same-origin.
const SOURCE = "https://cdthqixswrcxkyodzdjp.supabase.co/storage/v1/object/public/story-images/app-icon.png";

export const revalidate = 86400;

export async function GET() {
  try {
    const res = await fetch(SOURCE, { next: { revalidate: 86400 } });
    if (!res.ok) return NextResponse.json({ error: "not found" }, { status: 502 });
    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
