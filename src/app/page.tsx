"use client";

import { useEffect, useState } from "react";
import { calculatePulseScore } from "@/lib/pulse";
import PulseScore from "@/components/PulseScore";
import SourceBadge from "@/components/SourceBadge";
import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, LayoutDashboard, Loader2 } from "lucide-react";
import mockData from "@/mock/data.json";

const FALLBACK_SYMBOLS = ["AAPL", "MSFT", "TSLA", "NVDA"];

export default function DashboardPage() {
  const [symbols, setSymbols] = useState<string[]>(FALLBACK_SYMBOLS);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"network" | "mock" | "cache">("mock");

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. On essaie le backend
        const res = await fetch("http://localhost:8000/assets", { signal: AbortSignal.timeout(3000) });
        if (!res.ok) throw new Error("Erreur backend");
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setSymbols(data);
          setSource("network");
        } else {
          throw new Error("Format invalide");
        }
      } catch (err) {
        // 2. Si ça plante, on prend le mock
        console.warn("Backend non joignable, utilisation du mock.");
        if (mockData && Array.isArray(mockData.assets)) {
          setSymbols(mockData.assets);
        } else {
          setSymbols(FALLBACK_SYMBOLS);
        }
        setSource("mock");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Maintenant, "symbols" est TOUJOURS un tableau valide.
  const validAssets = symbols.map((symbol: string) => {
    const assetData = (mockData as any)?.[symbol] || {};
    return {
      symbol: symbol,
      prix_actuel: Number(assetData.prix_actuel) || 0,
      tendance: assetData.tendance || "neutre",
      ma20: Number(assetData.ma20) || 0,
      ma50: Number(assetData.ma50) || 0
    };
  });

  const totalScore = validAssets.reduce((acc, asset) => acc + calculatePulseScore(asset).score, 0);
  const marketMood = validAssets.length > 0 ? Math.round(totalScore / validAssets.length) : 50;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <LayoutDashboard className="text-[var(--accent)]" /> Dashboard
          </h1>
          <div className="flex items-center gap-2 text-gray-400">
            <p>Bienvenue sur votre tableau de bord MarketPulse.</p>
            <SourceBadge source={source} />
            {loading && <Loader2 className="animate-spin text-gray-500" size={16} />}
          </div>
        </div>
        
        <div className="bg-[var(--surface)] border border-gray-800 p-4 rounded-xl flex items-center gap-6 shadow-lg">
          <div>
            <p className="text-sm text-gray-400 font-medium">Market Mood global</p>
            <p className="text-3xl font-bold text-[var(--accent)]">{marketMood} / 100</p>
            <p className="text-xs text-gray-500 mt-1">Moyenne des Pulse Scores</p>
          </div>
          <PulseScore score={marketMood} />
        </div>
      </div>

      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-bold">Vos entreprises suivies</h2>
        <Link href="/markets" className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1">
          Tout voir <ArrowRight size={16} />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {validAssets.map((asset) => {
          const { score } = calculatePulseScore(asset);
          return (
            <Link 
              key={asset.symbol} 
              href={`/asset/${asset.symbol}`}
              className="bg-[var(--surface)] p-5 rounded-xl border border-gray-800 hover:border-[var(--accent)] transition-all flex justify-between items-center group shadow-sm hover:shadow-md"
            >
              <div>
                <h3 className="text-2xl font-bold mb-1">{asset.symbol}</h3>
                <p className="text-lg font-semibold">
                  {asset.prix_actuel.toFixed(2)} <span className="text-sm text-gray-400">USD</span>
                </p>
                <div className="flex items-center gap-1 mt-3 text-sm font-medium">
                  {asset.tendance === "haussière" ? (
                    <span className="text-[var(--positive)] flex items-center gap-1"><TrendingUp size={16}/> Hausse</span>
                  ) : (
                    <span className="text-[var(--negative)] flex items-center gap-1"><TrendingDown size={16}/> Baisse</span>
                  )}
                </div>
              </div>
              <div className="scale-90 origin-right opacity-80 group-hover:opacity-100 transition-opacity">
                 <PulseScore score={score} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}