import { getAssets, getAsset } from "@/lib/api";
import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";

export default async function MarketsPage() {
  const symbols = await getAssets();
  
  const assetsData = await Promise.all(
    symbols.map((symbol) => getAsset(symbol))
  );
  
  const validAssets = assetsData.filter((a) => a !== null);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Marchés</h1>
        <button className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg opacity-50 cursor-not-allowed">
          + Ajouter (Bientôt)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {validAssets.map((asset) => (
          <Link 
            key={asset!.symbol} 
            href={`/asset/${asset!.symbol}`}
            className="bg-[var(--surface)] p-4 rounded-xl border border-gray-800 hover:border-[var(--accent)] transition-colors group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{asset!.symbol}</h2>
                <p className="text-sm text-gray-400">Action</p>
              </div>
              {asset!.tendance === "haussière" ? (
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
            
            <div>
              <p className="text-2xl font-semibold">
                {asset!.prix_actuel.toFixed(2)} <span className="text-sm text-gray-400">USD</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
