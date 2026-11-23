import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Cloudflare Workers build (OpenNext). No incremental cache store yet: pages
// are mostly static or per-request; add R2/KV cache later if needed.
export default defineCloudflareConfig();
