import { NextRequest, NextResponse } from "next/server";
import { getDbImage } from "@/lib/supabase";

// Serves story pictures kept in the database. Names are content hashes, so a
// picture never changes and the CDN may keep it for a year.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[A-Za-z0-9._-]{1,120}$/.test(name)) return new NextResponse("bad name", { status: 400 });
  const img = await getDbImage(name);
  if (!img) return new NextResponse("not found", { status: 404 });
  return new NextResponse(Buffer.from(img.b64, "base64"), {
    headers: { "Content-Type": img.mime, "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable" },
  });
}
