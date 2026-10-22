"use client";

import { useResource } from "@/hooks/useResource";
import SourceBadge from "@/components/SourceBadge";
import Link from "next/link";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import mockData from "@/mock/data.json";

export default function MarketsPage() {
  const { data: symbols, source, loading } = useResource<string[]>(
    "assets",
    "/assets",
    mockData.assets
  );

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Marchés</h1>
          <SourceBadge source={source} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(symbols ?? []).map((symbol) => {
          const assetMock = (mockData as any)[symbol] || {
            prix_actuel: 0,
            tendance: "neutre",
          };

          return (
            <Link
              key={symbol}
              href={`/asset/${symbol}`}
              className="bg-[var(--surface)] p-4 rounded-xl border border-gray-800 hover:border-[var(--accent)] transition-colors group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{symbol}</h2>
                  <p className="text-sm text-gray-400">Action</p>
                </div>

                {assetMock.tendance === "haussière" ? (
                  <div className="flex items-center gap-1 text-[var(--positive)] bg-[var(--positive)]/10 px-2 py-1 rounded-md text-sm">
                    <TrendingUp size={16} />
                    <span>Hausse</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[var(--negative)] bg-[var(--negative)]/10 px-2 py-1 rounded-md text-sm">
                    <TrendingDown size={16} />
                    <span>Baisse</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

