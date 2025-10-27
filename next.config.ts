import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
// Only initialize when running dev server, skip for lint/build
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
