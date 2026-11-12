import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

/**
 * Proxy /api/* → FastAPI.
 * Sur Vercel on ajoute Bypass-Tunnel-Reminder (sinon localtunnel renvoie une page HTML
 * et les courbes / l'historique disparaissent sur téléphone).
 * La route plus précise /api/ai-chat reste prioritaire (Gemini).
 */
function backendBase(): string {
  if (process.env.VERCEL) {
    // API_PROXY_TARGET sur Vercel pointe encore vers un localtunnel mort (503).
    // Le tunnel SSH courant est prioritaire ; API_TUNNEL_URL peut le remplacer.
    return (
      process.env.API_TUNNEL_URL?.trim() ||
      "https://5e6ada983b8d33.lhr.life"
    ).replace(/\/$/, "");
  }
  return (
    process.env.API_PROXY_TARGET?.trim() ||
    process.env.FASTAPI_URL?.trim() ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");
}

async function proxy(req: NextRequest, path: string[] | undefined) {
  const targetPath = (path && path.length ? path.join("/") : "").replace(/^\/+/, "");
  const incoming = new URL(req.url);
  const url = `${backendBase()}/${targetPath}${incoming.search}`;

  const headers = new Headers();
  const forward = [
    "accept",
    "accept-language",
    "content-type",
    "cookie",
    "origin",
    "referer",
    "user-agent",
    "x-requested-with",
  ];
  for (const key of forward) {
    const value = req.headers.get(key);
    if (value) headers.set(key, value);
  }
  // Obligatoire pour localtunnel depuis les IP cloud (Vercel).
  headers.set("Bypass-Tunnel-Reminder", "true");
  headers.set("User-Agent", headers.get("user-agent") || "MarketPulse-Vercel-Proxy");

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
    cache: "no-store",
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, init);
  } catch (err) {
    const message = err instanceof Error ? err.message : "upstream unreachable";
    return Response.json(
      { detail: `API injoignable (${backendBase()}): ${message}` },
      { status: 502 }
    );
  }

  const outHeaders = new Headers();
  const pass = ["content-type", "cache-control", "set-cookie"];
  for (const key of pass) {
    const value = upstream.headers.get(key);
    if (value) outHeaders.set(key, value);
  }
  // Plusieurs Set-Cookie possibles
  const cookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];
  if (cookies.length) {
    outHeaders.delete("set-cookie");
    for (const cookie of cookies) outHeaders.append("set-cookie", cookie);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  });
}

type Ctx = { params: Promise<{ path?: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function OPTIONS(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
