"use client";

import SearchBar from "@/components/SearchBar";
import AssetCard from "@/components/AssetCard";
import SourceBadge from "@/components/SourceBadge";
import DataOrigin from "@/components/DataOrigin";
import { useResource } from "@/hooks/useResource";
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
      volatilite_annualisee_pct: row?.volatilite_annualisee_pct ?? null,
      max_drawdown_pct: row?.max_drawdown_pct ?? null,
      probabilite_hausse_pct: null,
      origine: "mock",
    };
  });
}

export default function MarketsPage() {
  const { data, source, loading, reload } = useResource<OverviewAsset[]>("overview", "/assets/overview", localOverview());
  const assets = !loading && Array.isArray(data) ? data : [];
  const origin = source === "mock" ? "mock" : assets.find((asset) => asset.origine)?.origine;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Marchés</h1>
        {source === "cache" && <SourceBadge source="cache" />}
        {!loading && <DataOrigin origine={source === "mock" ? "mock" : origin} asOf={assets.find((asset) => asset.date)?.date} />}
      </div>

      <div className="mb-6">
        <SearchBar onAdded={reload} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 rounded-xl bg-[var(--surface)] border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets.map((asset) => (
            <AssetCard key={asset.symbol} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}
