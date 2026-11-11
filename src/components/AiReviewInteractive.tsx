"use client";

import { useState } from "react";
import axios from "axios";
import { Loader2, Sparkles } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

function savedReview(symbol: string): Review | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(`ai-review:${symbol}`);
    return saved ? (JSON.parse(saved) as Review) : null;
  } catch {
    sessionStorage.removeItem(`ai-review:${symbol}`);
    return null;
  }
}

type Review = {
  status?: string;
  titre?: string;
  synthese?: string;
  elements_favorables?: string[];
  elements_defavorables?: string[];
  observe?: {
    prix_actuel?: number | null;
    date?: string | null;
    variation_1j_pct?: number | null;
    ma20?: number | null;
    ma50?: number | null;
    volatilite_annualisee_pct?: number | null;
    max_drawdown_pct?: number | null;
    nb_observations?: number;
    origine?: string;
  };
  ml?: {
    disponible?: boolean;
    probabilite_hausse_pct?: number | null;
    message?: string | null;
    baseline_toujours_hausse_pct?: number | null;
    precision_modele_pct?: number | null;
  };
  recommandation?: {
    decision?: string | null;
    note_sur_5?: number | null;
    definition_note?: string | null;
    base?: string | null;
    regles_declenchees?: string[];
  };
  commentaire?: { source?: string; modele?: string | null; texte?: string };
  limites?: string;
  review?: string;
};

function decisionStyle(decision?: string | null) {
  if (decision === "ACHAT") return "text-[var(--positive)] bg-[var(--positive)]/10 border-[var(--positive)]/40";
  if (decision === "VENTE") return "text-[var(--negative)] bg-[var(--negative)]/10 border-[var(--negative)]/40";
  if (decision === "CONSERVATION") return "text-amber-200 bg-amber-400/10 border-amber-400/30";
  return "text-gray-300 bg-white/5 border-gray-700";
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#0B0E11] border border-gray-800 px-3 py-2 min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm font-semibold num mt-1 truncate">{value}</p>
    </div>
  );
}

export default function AiReviewInteractive({ symbol }: { symbol: string }) {
  const [review, setReview] = useState<Review | null>(() => savedReview(symbol));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post<Review>(`${API}/assets/${symbol}/ai-review`, {}, { timeout: 150000, withCredentials: true });
      setReview(res.data);
      sessionStorage.setItem(`ai-review:${symbol}`, JSON.stringify(res.data));
    } catch (err) {
      const detail = axios.isAxiosError(err) ? err.response?.data?.detail : null;
      setError(typeof detail === "string" ? detail : "Le serveur n'a pas répondu. Aucun avis de remplacement n'a été inventé dans le navigateur.");
    } finally {
      setLoading(false);
    }
  };

  const decision = review?.recommandation?.decision;
  const note = review?.recommandation?.note_sur_5;
  const commentary = review?.commentaire?.texte || review?.review;
  const fromModel = review?.commentaire?.source === "ollama";
  const price = review?.observe?.prix_actuel;

  return (
    <section className="bg-[var(--surface)] p-6 rounded-xl border border-gray-800" aria-busy={loading}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="text-[var(--accent)]" aria-hidden />
          Avis de l&apos;analyste
        </h2>
        <button
          type="button"
          onClick={generateReview}
          disabled={loading}
          className="bg-[var(--accent)] hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={18} aria-hidden /> : null}
          {loading ? "Analyse en cours" : review ? "Actualiser l'avis" : "Générer l'avis"}
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Les indicateurs et la recommandation sont calculés par le backend. Le modèle local ne fait que reformuler ce résultat, sans ajouter de chiffre.
      </p>

      {loading && (
        <p className="text-gray-400 text-sm">
          {`Calcul des règles pour ${symbol}, puis reformulation par llama3.2. Si le modèle ne répond pas, le texte Python s'affiche.`}
        </p>
      )}

      {error && <p className="text-red-300 text-sm" role="alert">{error}</p>}

      {review && !loading && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${decisionStyle(decision)}`}>
              {decision ?? "Pas de recommandation"}
            </span>
            {note != null && (
              <span className="text-sm text-gray-300 num">Cohérence {note}/5</span>
            )}
            <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">
              {fromModel
                ? `Texte reformulé par ${review.commentaire?.modele || "Ollama"}`
                : "Texte de secours Python"}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-semibold">{review.titre || symbol}</h3>
            {review.synthese && <p className="text-gray-300 mt-1 leading-relaxed">{review.synthese}</p>}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <Stat label="Cours" value={price == null ? "—" : `${price.toFixed(2)} USD`} />
            <Stat label="MM20" value={review.observe?.ma20 == null ? "—" : review.observe.ma20.toFixed(2)} />
            <Stat label="MM50" value={review.observe?.ma50 == null ? "—" : review.observe.ma50.toFixed(2)} />
            <Stat
              label="Modèle"
              value={review.ml?.probabilite_hausse_pct == null ? "n/d" : `${review.ml.probabilite_hausse_pct.toFixed(1)} %`}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-800 p-3">
              <p className="text-sm font-semibold text-[var(--positive)] mb-2">Éléments favorables</p>
              <FactList items={review.elements_favorables} empty="Aucun élément favorable sur les règles retenues." />
            </div>
            <div className="rounded-lg border border-gray-800 p-3">
              <p className="text-sm font-semibold text-[var(--negative)] mb-2">Éléments défavorables</p>
              <FactList items={review.elements_defavorables} empty="Aucun élément défavorable sur les règles retenues." />
            </div>
          </div>

          {review.ml && (
            <p className="text-sm text-gray-300 leading-relaxed">
              {review.ml.disponible && review.ml.probabilite_hausse_pct != null
                ? `Probabilité du modèle : ${review.ml.probabilite_hausse_pct.toFixed(1)} %. Précision documentée ${review.ml.precision_modele_pct ?? "—"} %, baseline toujours-hausse ${review.ml.baseline_toujours_hausse_pct ?? "—"} %.`
                : review.ml.message}
            </p>
          )}

          {note != null && review.recommandation?.definition_note && (
            <p className="text-sm text-gray-400 leading-relaxed">{review.recommandation.definition_note}</p>
          )}

          {commentary && (
            <div className="bg-[#0B0E11] p-4 rounded-lg border border-gray-800 text-gray-200 leading-relaxed text-sm">
              {commentary}
            </div>
          )}

          {review.recommandation?.regles_declenchees && review.recommandation.regles_declenchees.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-400">Règles déclenchées</summary>
              <ul className="mt-2 space-y-1 text-gray-300 list-disc pl-5">
                {review.recommandation.regles_declenchees.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </details>
          )}

          {review.limites && <p className="text-xs text-gray-500 leading-relaxed">{review.limites}</p>}
        </div>
      )}
    </section>
  );
}

function FactList({ items, empty }: { items?: string[]; empty: string }) {
  if (!items || items.length === 0) return <p className="text-sm text-gray-500">{empty}</p>;
  return (
    <ul className="space-y-2 text-sm text-gray-300">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
