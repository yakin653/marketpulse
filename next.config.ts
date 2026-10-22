import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [{ url: "/offline", revision: crypto.randomUUID() }],
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {}, // 👈 ajoute ça pour calmer Next.js 16
};

export default withSerwist(nextConfig);