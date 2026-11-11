import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [{ url: "/offline", revision: crypto.randomUUID() }],
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const scriptSrc = process.env.NODE_ENV === "development"
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

// Sur Vercel, définir API_PROXY_TARGET vers l'URL publique de l'API FastAPI.
const apiTarget = process.env.API_PROXY_TARGET || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    // proxy-request.js de Next 16.4 : sans cette valeur, un rewrite est coupé à 30 s.
    // Le chat peut attendre Ollama plus longtemps.
    proxyTimeout: 120_000,
  },
  // Le navigateur parle à /api sur le même site : le cookie de session part avec la requête.
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Content-Security-Policy", value: `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; ${scriptSrc}; connect-src 'self'; frame-ancestors 'none'` },
      ],
    }];
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiTarget.replace(/\/$/, "")}/:path*` }];
  },
};

export default withSerwist(nextConfig);