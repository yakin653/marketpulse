import { BrainCircuit, Minus, TrendingDown, TrendingUp } from "lucide-react";

type Props = {
  probability?: number | null;
  baseline?: number | null;
  accuracy?: number | null;
  message?: string | null;
  warning?: string | null;
  observations?: number | null;
};

export default function MlCard({ probability, baseline, accuracy, message, warning, observations }: Props) {
  if (probability == null) {
    return (
      <div className="bg-[var(--surface)] p-6 rounded-xl border border-gray-800 h-full min-h-[180px] flex flex-col justify-center gap-3">
        <div className="flex items-center gap-2 text-gray-300">
          <BrainCircuit size={20} className="text-[var(--accent)]" />
          <h2 className="text-lg font-bold">Probabilité du modèle</h2>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          {message || "Le modèle n'a pas produit de probabilité pour cette série. Aucune valeur n'est affichée à sa place."}
        </p>
        {observations != null && (
          <p className="text-xs text-gray-500">{observations} séances disponibles.</p>
        )}
      </div>
    );
  }

  const bullish = probability >= 60;
  const bearish = probability <= 40;
  const color = bullish ? "text-[var(--positive)]" : bearish ? "text-[var(--negative)]" : "text-gray-300";
  const bg = bullish ? "bg-[var(--positive)]/10" : bearish ? "bg-[var(--negative)]/10" : "bg-white/5";
  const Icon = bullish ? TrendingUp : bearish ? TrendingDown : Minus;
  const stance = bullish ? "Au-dessus de 60 %" : bearish ? "Sous 40 %" : "Entre 40 et 60 %";

  return (
    <div className="bg-[var(--surface)] p-6 rounded-xl border border-gray-800 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 text-gray-300">
        <BrainCircuit size={20} className="text-[var(--accent)]" />
        <h2 className="text-lg font-bold">Probabilité du modèle</h2>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">Chance estimée d&apos;une séance positive</p>
          <p className={`text-3xl font-bold num ${color}`}>{probability.toFixed(1)} %</p>
        </div>
        <div className={`flex flex-col items-center justify-center px-3 py-3 rounded-2xl ${bg} ${color} text-center`}>
          <Icon size={26} aria-hidden />
          <span className="text-xs font-medium mt-1 max-w-24">{stance}</span>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-4 leading-relaxed">
        {message || "Sortie du RandomForest local. Ce pourcentage n'est pas un rendement attendu."}
      </p>
      <p className="text-xs text-gray-500 mt-3 leading-relaxed">
        Évaluation documentée du projet : précision du modèle {accuracy ?? 52.7} %, baseline « toujours hausse » {baseline ?? 52.9} %. Le modèle ne bat pas cette baseline.
      </p>
      {warning && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{warning}</p>}
    </div>
  );
}
