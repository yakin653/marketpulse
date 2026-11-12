import Link from "next/link";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { calculatePulseScore } from "@/lib/pulse";
import { formatPct, formatPrice, trendLabel } from "@/lib/format";
import PulseScore from "./PulseScore";

type CardAsset = {
  symbol: string;
  nom?: string | null;
  prix_actuel?: number | null;
  tendance?: string | null;
  ma20?: number | null;
  ma50?: number | null;
  variation_1j_pct?: number | null;
  volatilite_annualisee_pct?: number | null;
  max_drawdown_pct?: number | null;
  probabilite_hausse_pct?: number | null;
  fraicheur?: string | null;
  date?: string | null;
};

export default function AssetCard({ asset, tourTarget }: { asset: CardAsset; tourTarget?: boolean }) {
  const { score } = calculatePulseScore(asset);
  const price = typeof asset.prix_actuel === "number" && asset.prix_actuel > 0 ? asset.prix_actuel : null;
  const change = asset.variation_1j_pct;
  const up = change != null && change > 0;
  const down = change != null && change < 0;
  const Icon = up ? TrendingUp : down ? TrendingDown : Minus;
  const tone = up ? "text-[var(--positive)]" : down ? "text-[var(--negative)]" : "text-gray-400";
  const asOf = asset.fraicheur || asset.date;

  return (
    <Link
      href={`/asset/${asset.symbol}`}
      data-tour={tourTarget ? "company-card" : undefined}
      className="bg-[var(--surface)] p-5 rounded-xl border border-gray-800 hover:border-[var(--accent)] transition-colors flex justify-between items-center gap-3 min-w-0 group"
    >
      <div className="min-w-0">
        <div className="mb-1">
          <h3 className="text-2xl font-bold tracking-tight whitespace-nowrap">{asset.symbol}</h3>
          {asset.nom && <p className="text-sm text-gray-300 truncate">{asset.nom}</p>}
          {asOf && <p className="text-xs text-gray-500">{asOf}</p>}
        </div>
        <p className="text-lg font-semibold num">
          {price == null ? "Cours indisponible" : formatPrice(price)}{" "}
          {price != null && <span className="text-sm text-gray-400 font-medium">USD</span>}
        </p>
        <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${tone}`}>
          <Icon size={16} aria-hidden />
          <span className="num whitespace-nowrap">{change == null ? "Variation non calculée" : formatPct(change)}</span>
          {change != null && <span className="text-gray-500 font-normal whitespace-nowrap">1 séance</span>}
        </div>
        <p className="text-xs text-gray-400 mt-1">{trendLabel(asset.tendance)}</p>
        <p className="text-xs text-gray-500 mt-2">
          {asset.probabilite_hausse_pct == null
            ? "Probabilité ML non calculée"
            : `Modèle : ${asset.probabilite_hausse_pct.toFixed(1)} % de hausse estimée`}
        </p>
      </div>
      <div className="shrink-0 opacity-90 group-hover:opacity-100">
        <PulseScore score={score} />
      </div>
    </Link>
  );
}
