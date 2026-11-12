"use client";

import { useResource } from "@/hooks/useResource";
import { calculatePulseScore, moodLabel } from "@/lib/pulse";
import PulseScore from "@/components/PulseScore";
import SourceBadge from "@/components/SourceBadge";
import DataOrigin from "@/components/DataOrigin";
import AssetCard from "@/components/AssetCard";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import mockData from "@/mock/data.json";

type OverviewAsset = {
  symbol: string;
  prix_actuel?: number | null;
  tendance?: string | null;
  ma20?: number | null;
  ma50?: number | null;
  variation_1j_pct?: number | null;
  volatilite_annualisee_pct?: number | null;
  max_drawdown_pct?: number | null;
  probabilite_hausse_pct?: number | null;
  origine?: string | null;
  date?: string | null;
  fraicheur?: string | null;
};

function localOverview(): OverviewAsset[] {
  const symbols = Array.isArray(mockData.assets) ? mockData.assets : [];
  return symbols.map((symbol) => {
    const row = (mockData as Record<string, unknown>)[symbol] as Partial<OverviewAsset> | undefined;
    const price = typeof row?.prix_actuel === "number" && row.prix_actuel > 0 ? row.prix_actuel : null;
    return {
      symbol,
      prix_actuel: price,
      tendance: row?.tendance ?? "indéterminée",
      ma20: row?.ma20 ?? null,
      ma50: row?.ma50 ?? null,
      variation_1j_pct: null,
      volatilite_annualisee_pct: row?.volatilite_annualisee_pct ?? null,
      max_drawdown_pct: row?.max_drawdown_pct ?? null,
      probabilite_hausse_pct: null,
      origine: "mock",
    };
  });
}

export default function DashboardPage() {
  const { data, source, loading } = useResource<OverviewAsset[]>("overview", "/assets/overview", localOverview());
  const assets = !loading && Array.isArray(data) ? data : [];
  const scored = assets
    .map((asset) => calculatePulseScore(asset).score)
    .filter((score): score is number => score != null);
  const marketMood = scored.length ? Math.round(scored.reduce((sum, score) => sum + score, 0) / scored.length) : null;
  const above = assets.filter((asset) => asset.tendance === "haussière").length;
  const below = assets.filter((asset) => asset.tendance === "baissière").length;
  const origin = source === "mock" ? "mock" : assets.find((asset) => asset.origine)?.origine;
  const { user } = useAuth();
  const favorites = new Set(user?.profile?.favorite_symbols ?? []);
  const forYou = assets.filter((asset) => favorites.has(asset.symbol));
  const others = assets.filter((asset) => !favorites.has(asset.symbol));
  const firstTourSymbol = forYou[0]?.symbol ?? others[0]?.symbol ?? null;

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <LayoutDashboard className="text-[var(--accent)]" aria-hidden /> Dashboard
          </h1>
          <p className="text-gray-400">Lecture du marché suivi. Le Market Mood est la moyenne des Pulse Scores.</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {source === "cache" && <SourceBadge source="cache" />}
            {!loading && <DataOrigin origine={source === "mock" ? "mock" : origin} asOf={assets.find((asset) => asset.date)?.date} />}
          </div>
        </div>

        <div data-tour="market-mood" className="bg-[var(--surface)] border border-gray-800 p-4 rounded-xl flex items-center gap-4 w-full lg:w-auto">
          <div className="min-w-0">
            <p className="text-sm text-gray-400 font-medium">Market Mood</p>
            <p className="text-3xl font-bold text-[var(--accent)] num">{marketMood == null ? "—" : `${marketMood} / 100`}</p>
            <p className="text-sm text-gray-300 mt-1">{moodLabel(marketMood)}</p>
            <p className="text-xs text-gray-500 mt-2">
              MM20 : {above} au-dessus · {below} en dessous
            </p>
          </div>
          <PulseScore score={marketMood} />
        </div>
      </div>

      {forYou.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Pour vous</h2>
          <p className="text-xs text-gray-500 mb-3">Les symboles favoris du profil passent en premier. Ce n&apos;est pas une sélection d&apos;investissement.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forYou.map((asset) => (
              <AssetCard key={asset.symbol} asset={asset} tourTarget={asset.symbol === firstTourSymbol} />
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-between items-end mb-4 gap-3">
        <h2 className="text-xl font-bold">Univers suivi</h2>
        <Link href="/markets" className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1 shrink-0">
          Tout voir <ArrowRight size={16} aria-hidden />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 rounded-xl bg-[var(--surface)] border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <p className="text-gray-400">Aucune entreprise n&apos;est disponible pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {others.map((asset) => (
            <AssetCard
              key={asset.symbol}
              asset={asset}
              tourTarget={forYou.length === 0 && asset.symbol === firstTourSymbol}
            />
          ))}
        </div>
      )}
    </div>
  );
}
