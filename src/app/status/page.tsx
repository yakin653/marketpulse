"use client";

import { useEffect, useState } from "react";
import { http } from "@/lib/http";

type Status = {
  api: string;
  database: string;
  ollama: { ok: boolean; model: string };
  yahoo: { label?: string; updated_at?: string | null };
  modele: { modele?: string; precision_modele_pct?: number; baseline_toujours_hausse_pct?: number; avantage_prouve?: boolean } | null;
  news_job_at: string | null;
};

export default function StatusPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    http.get<Status>("/status").then((res) => setStatus(res.data)).catch(() => setError("L'état n'a pas pu être lu."));
  }, []);

  if (error) return <p className="text-sm text-red-300" role="alert">{error}</p>;
  if (!status) return <div className="h-40 animate-pulse bg-[var(--surface)] rounded-xl" />;

  return (
    <div className="max-w-xl mx-auto space-y-3">
      <h1 className="text-2xl font-bold">État du service</h1>
      <ul className="text-sm space-y-2">
        <li>API : {status.api}</li>
        <li>Base : {status.database}</li>
        <li>Ollama ({status.ollama.model}) : {status.ollama.ok ? "joignable" : "absent ou autre modèle"}</li>
        <li>Cours Yahoo : {status.yahoo.label || "date inconnue"}</li>
        <li>Modèle : {status.modele ? `${status.modele.modele}, ${status.modele.precision_modele_pct} % contre ${status.modele.baseline_toujours_hausse_pct} %` : "fichier illisible"}</li>
        <li>Dernière collecte de titres : {status.news_job_at || "pas encore enregistrée"}</li>
      </ul>
      {status.modele && status.modele.avantage_prouve === false && <p className="text-xs text-amber-200/90">Aucun avantage prouvé sur la baseline.</p>}
    </div>
  );
}
