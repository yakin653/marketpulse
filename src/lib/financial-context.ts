/**
 * Récupère les données financières depuis FastAPI et y ajoute le Pulse Score
 * (heuristique locale MarketPulse — même calcul que la page actif).
 */

import { calculatePulseScore } from "@/lib/pulse";

export type AssetContext = {
  symbol: string;
  prix_actuel?: number;
  tendance?: string;
  ma20?: number;
  ma50?: number;
  volatilite_annualisee_pct?: number;
  max_drawdown_pct?: number;
  volume?: number | null;
  updated_at?: string | null;
  data_source?: "finnhub" | "demo" | string;
  history_provider?: "finnhub" | "yahoo_fallback" | string | null;
  is_demonstration?: boolean;
  fallback_reason?: string | null;
  probabilite_hausse_pct?: number | null;
  sentiment_30j?: { score_moyen?: number } | null;
};

export type ContextResult =
  | { ok: true; asset: AssetContext; source: string }
  | { ok: false; reason: string };

function resolveFastapiBase(): string {
  const explicit = process.env.FASTAPI_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const proxy = process.env.API_PROXY_TARGET?.trim();
  if (proxy) return proxy.replace(/\/$/, "");

  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (publicUrl?.startsWith("http")) return publicUrl.replace(/\/$/, "");

  return "http://127.0.0.1:8000";
}

export async function fetchFinancialContext(
  symbol: string
): Promise<ContextResult> {
  const base = resolveFastapiBase();
  const sym = symbol.trim().toUpperCase();

  try {
    const res = await fetch(`${base}/assets/${encodeURIComponent(sym)}`, {
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });

    if (res.status === 404) {
      return {
        ok: false,
        reason: `Aucune donnée financière pour ${sym} dans FastAPI.`,
      };
    }
    if (!res.ok) {
      return {
        ok: false,
        reason: `FastAPI a renvoyé HTTP ${res.status} pour ${sym}.`,
      };
    }

    const data = (await res.json()) as AssetContext;
    return {
      ok: true,
      asset: { ...data, symbol: data.symbol || sym },
      source: base,
    };
  } catch {
    return {
      ok: false,
      reason: `FastAPI injoignable (${base}). Impossible d'obtenir les données de ${sym}.`,
    };
  }
}

/** Formulation source pour le prompt Gemini (jamais « officielles »). */
export function describeMarketSources(asset: AssetContext): string {
  const isDemo =
    asset.is_demonstration === true || asset.data_source === "demo";
  if (isDemo) {
    return "données de démonstration simulées (jeu pédagogique MarketPulse, pas un flux marché live)";
  }
  if (asset.history_provider === "yahoo_fallback") {
    return "données issues de Finnhub (cotation) et Yahoo Finance (historique pour MA/volatilité/drawdown/volume de séance)";
  }
  if (asset.history_provider === "finnhub" || asset.data_source === "finnhub") {
    return "données financières fournies par Finnhub";
  }
  return "données financières fournies via FastAPI (source non précisée)";
}

export function formatAssetContext(asset: AssetContext): string {
  const pulse = calculatePulseScore(asset);
  const isDemo =
    asset.is_demonstration === true || asset.data_source === "demo";
  const sourcePhrase = describeMarketSources(asset);

  const lines = [
    `symbole=${asset.symbol}`,
    `data_source=${asset.data_source ?? "inconnu"}`,
    asset.history_provider
      ? `history_provider=${asset.history_provider}`
      : null,
    `is_demonstration=${isDemo}`,
    `formulation_source_autorisee=${sourcePhrase}`,
    asset.updated_at ? `updated_at=${asset.updated_at}` : null,
    asset.fallback_reason
      ? `fallback_reason=${asset.fallback_reason}`
      : null,
    asset.prix_actuel != null ? `prix_actuel_usd=${asset.prix_actuel}` : null,
    asset.tendance ? `tendance=${asset.tendance}` : null,
    asset.ma20 != null ? `ma20=${asset.ma20}` : null,
    asset.ma50 != null ? `ma50=${asset.ma50}` : null,
    asset.volume != null ? `volume=${asset.volume}` : null,
    asset.volatilite_annualisee_pct != null
      ? `volatilite_annualisee_pct=${asset.volatilite_annualisee_pct}`
      : null,
    asset.max_drawdown_pct != null
      ? `max_drawdown_pct=${asset.max_drawdown_pct}`
      : null,
    asset.probabilite_hausse_pct != null
      ? `probabilite_hausse_pct=${asset.probabilite_hausse_pct}`
      : null,
    asset.sentiment_30j?.score_moyen != null
      ? `sentiment_30j_score_moyen=${asset.sentiment_30j.score_moyen}`
      : null,
    "",
    isDemo
      ? "avertissement=Ces chiffres sont SIMULÉS (data_source=demo). Dis-le clairement. N'utilise JAMAIS les mots « données officielles », « cotation live » ou « Finnhub » pour les présenter."
      : asset.history_provider === "yahoo_fallback"
        ? "avertissement=Cotation Finnhub + indicateurs historiques calculés à partir de Yahoo Finance (secours, car candles Finnhub souvent premium). Ne dis PAS que tous les indicateurs viennent uniquement de Finnhub. N'utilise JAMAIS « données officielles »."
        : "avertissement=Données financières fournies par Finnhub. N'utilise JAMAIS « données officielles ».",
    "pulse_score_definition=Heuristique pédagogique MarketPulse (0-100) calculée par la fonction calculatePulseScore dans src/lib/pulse.ts (Next.js), PAS par Gemini. Gemini doit seulement expliquer le score fourni ci-dessous.",
    "pulse_score_pondérations=tendance_MM 45%, volatilite 30%, max_drawdown 25% (poids absents redistribués).",
    `pulse_score=${pulse.score ?? "indisponible"}`,
    `pulse_explication=${pulse.explication}`,
    pulse.composantes.length
      ? null
      : "pulse_score_champs_absents=indicateurs insuffisants pour calculer le score",
    ...pulse.composantes.map(
      (d) =>
        `pulse_composante_${d.key}=note=${Math.round(d.note)} poids=${d.poids.toFixed(3)} label=${d.label} detail=${d.detail}`
    ),
  ].filter((line) => line !== null);

  return lines.join("\n");
}
