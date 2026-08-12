import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Deployment target is shared hosting via Passenger. Do not change without
  // asking — the hosting setup (see CLAUDE.md: Deployment) depends on it.
  output: process.env.VERCEL ? undefined : "standalone",
  allowedDevOrigins: ["172.30.76.92"],
};

export default withNextIntl(nextConfig);
