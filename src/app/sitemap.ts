import type { MetadataRoute } from "next";

// Public pages for Google Search Console (aurakids.fun is the verified property).
const BASE = "https://aurakids.fun";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/prikazki`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/komiksi`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/koleda`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/usloviya`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
