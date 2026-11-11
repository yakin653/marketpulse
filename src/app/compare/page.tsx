"use client";

import dynamic from "next/dynamic";
import { FormEvent, useState } from "react";
import { http, errorText } from "@/lib/http";

const CompareChart = dynamic(() => import("@/components/CompareChart"), { ssr: false, loading: () => <div className="h-72 animate-pulse bg-[var(--surface)] rounded-xl" /> });

type Payload = {
  status: string;
  message?: string;
  points?: Record<string, string | number>[];
  metriques?: { symbol: string; variation_fenetre_pct: number | null; volatilite_annualisee_pct: number | null; max_drawdown_pct: number | null; dernier: number }[];
  avertissement?: string;
};

export default function ComparePage() {
  const [text, setText] = useState("AAPL,MSFT");
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const res = await http.get<Payload>("/compare", { params: { symbols: text } });
      setData(res.data);
    } catch (err) {
      setError(errorText(err, "Comparaison impossible."));
    }
  }

  const symbols = (data?.metriques || []).map((row) => row.symbol);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Comparateur</h1>
      <p className="text-sm text-gray-400">Deux à quatre actifs, rebasés à 100 au premier jour commun.</p>
      <form onSubmit={onSubmit} className="flex gap-2">
        <label className="flex-1 text-sm">Symboles
          <input className="mt-1 w-full min-h-11 rounded-lg bg-[#0B0E11] border border-gray-700 px-3" value={text} onChange={(event) => setText(event.target.value)} />
        </label>
        <button className="min-h-11 self-end px-4 rounded-lg bg-[var(--accent)]">Comparer</button>
      </form>
      {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
      {data?.status === "insuffisant" && <p className="text-sm text-gray-300">{data.message}</p>}
      {data?.status === "ok" && data.points && (
        <>
          <CompareChart points={data.points} symbols={symbols} />
          <div className="overflow-x-auto">
            <table className="text-sm w-full">
              <thead><tr><th className="text-left">Symbole</th><th>Variation fenêtre</th><th>Volatilité</th><th>Repli</th><th>Dernier cours</th></tr></thead>
              <tbody>
                {data.metriques?.map((row) => (
                  <tr key={row.symbol} className="border-t border-gray-800">
                    <td>{row.symbol}</td>
                    <td className="text-center">{row.variation_fenetre_pct ?? "—"} %</td>
                    <td className="text-center">{row.volatilite_annualisee_pct ?? "—"} %</td>
                    <td className="text-center">{row.max_drawdown_pct ?? "—"} %</td>
                    <td className="text-center">{row.dernier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-amber-200/90">{data.avertissement}</p>
        </>
      )}
    </div>
  );
}
