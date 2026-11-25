import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import { headers } from "next/headers";
import KoledaApp from "@/components/KoledaApp";
import { hashIp, ipFromHeaders } from "@/lib/quota";
import { pickVariant, type KoledaVariant } from "@/lib/abtest";

const TITLE = "Коледна приказка с името на детето | AuraKids";
const DESC = "Подари на детето си коледна приказка, в която то е героят: с името му, с картинки и с глас, готова за минута. Опитай безплатно.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/koleda" },
  openGraph: {
    title: TITLE, description: DESC, url: "/koleda", siteName: "AuraKids", locale: "bg_BG", type: "website",
    images: [{ url: "/og-koleda.jpg", width: 1200, height: 630, alt: "Коледна приказка с името на детето" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/og-koleda.jpg"] },
};

export const dynamic = "force-dynamic";

// Handwriting for the name on the envelope (variant B).
const hand = Caveat({ subsets: ["latin", "cyrillic"], weight: "700", variable: "--font-hand" });

type Params = { v?: string; gclid?: string; gbraid?: string; wbraid?: string; utm_source?: string };

// The variant comes from the visitor's hashed IP. ?v=a|b|c shows one variant
// on purpose (for us); such visits are not counted.
// Visitors from a Google ad always get A: the ad promises a Christmas story,
// and A is the variant that says exactly that.
export default async function Koleda({ searchParams }: { searchParams: Promise<Params> }) {
  const { v, gclid, gbraid, wbraid, utm_source } = await searchParams;
  const forced = (v || "").toUpperCase();
  const preview = forced === "A" || forced === "B" || forced === "C";
  const fromGoogleAd = !!(gclid || gbraid || wbraid) || (utm_source || "").toLowerCase() === "google";
  const variant: KoledaVariant = preview ? (forced as KoledaVariant)
    : fromGoogleAd ? "A"
    : pickVariant(hashIp(ipFromHeaders(await headers())));
  return <div className={hand.variable}><KoledaApp variant={variant} preview={preview} /></div>;
}
