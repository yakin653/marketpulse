export const dynamic = 'force-dynamic';

import { getAsset } from "@/lib/api";
import { calculatePulseScore } from "@/lib/pulse";
import PulseScore from "@/components/PulseScore";
import PriceChart from "@/components/PriceChart";

export default async function AssetPage({ params }: { params: { symbol: string } }) {
  const asset = await getAsset(params.symbol);
  if (!asset) return <div className="text-center mt-20 text-xl">Entreprise introuvable.</div>;

  const mockHistory = Array.from({ length: 30 }).map((_, i) => ({
    date: `J-${30 - i}`,
    close: asset.prix_actuel + (Math.random() - 0.5) * 10
  }));

  const { score } = calculatePulseScore(asset);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[var(--surface)] p-6 rounded-xl border border-gray-800 mb-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">{asset.symbol}</h1>
          <p className="text-3xl font-semibold">{asset.prix_actuel.toFixed(2)} <span className="text-lg text-gray-400">USD</span></p>
          <div className="flex gap-4 mt-4 text-sm text-gray-400">
            <p>MA20: <span className="text-[var(--text)]">{asset.ma20?.toFixed(2)}</span></p>
            <p>MA50: <span className="text-[var(--text)]">{asset.ma50?.toFixed(2)}</span></p>
          </div>
        </div>
        <PulseScore score={score} />
      </div>

      <div className="bg-[var(--surface)] p-6 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold mb-4">Historique des prix</h2>
        <PriceChart data={mockHistory} />
      </div>
    </div>
  );
}