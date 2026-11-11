"use client";

import { useResource } from "@/hooks/useResource";

type Metrics = {
  precision_modele_pct: number;
  baseline_toujours_hausse_pct: number;
  avantage_prouve: boolean;
  source: string;
};

export default function ModelFacts() {
  const { data, loading } = useResource<Metrics | null>("model-metrics", "/model/metrics", null);
  if (loading) return <p className="text-sm text-gray-400">Lecture du fichier d&apos;évaluation…</p>;
  if (!data) return <p className="text-sm text-gray-400">Le fichier d&apos;évaluation n&apos;est pas disponible.</p>;
  return (
    <section className="bg-[var(--surface)] p-6 rounded-xl border border-gray-800 space-y-3">
      <h2 className="text-xl font-bold">Transparence du modèle</h2>
      <p className="text-sm text-gray-300">
        Précision du RandomForest : {data.precision_modele_pct} %. Baseline « toujours hausse » : {data.baseline_toujours_hausse_pct} %.
      </p>
      <p className="text-sm text-gray-400">
        {data.avantage_prouve
          ? "Le fichier indique un avantage. Vérifie la source."
          : "Ce modèle n'a pas d'avantage prouvé, c'est pourquoi le Pulse Score n'en dépend pas."}
      </p>
      <p className="text-xs text-gray-500">{data.source}</p>
    </section>
  );
}
