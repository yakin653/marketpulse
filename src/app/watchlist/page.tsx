"use client";
import { useCallback, useEffect, useState } from "react";
import { Trash2, Pencil, Plus, Check } from "lucide-react";
import { addWatch, listWatch, removeWatch, updateWatch, type WatchItem } from "@/lib/db";
import RequireAuth from "@/components/RequireAuth";
import { http } from "@/lib/http";

function WatchlistBody() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [target, setTarget] = useState("");

  const refresh = useCallback(async () => setItems(await listWatch()), []);
  useEffect(() => {
    listWatch().then(setItems).catch(() => setItems([]));
  }, []);

  async function onAdd() {
    const s = symbol.trim().toUpperCase();
    if (!s || !name.trim()) return;
    await addWatch({ symbol: s, name: name.trim() });
    setSymbol(""); setName("");
    refresh();
  }

  function startEdit(it: WatchItem) {
    setEditing(it.symbol); setNote(it.note ?? ""); setTarget(it.targetPrice?.toString() ?? "");
  }

  async function saveEdit(s: string) {
    await updateWatch(s, { note, targetPrice: target ? Number(target) : undefined });
    setEditing(null); refresh();
  }

  async function onDelete(s: string) {
    if (!confirm(`Supprimer ${s} de la watchlist ?`)) return;
    await removeWatch(s); refresh();
  }

  return (
    <main className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Watchlist</h1>
      <p className="text-sm text-gray-400 mb-6">Enregistrée dans ce navigateur, même hors ligne.</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbole (ex: AAPL)" className="flex-1 rounded-lg bg-[#161A1E] border border-gray-800 px-3 py-2 text-white" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom entreprise" className="flex-1 rounded-lg bg-[#161A1E] border border-gray-800 px-3 py-2 text-white" />
        <button type="button" data-tour="watchlist-add" onClick={onAdd} className="rounded-lg bg-[var(--accent)] hover:bg-blue-600 px-4 py-2 flex items-center justify-center gap-1 text-white font-medium transition-colors">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {items.length === 0 && <p className="text-gray-400">Aucune entreprise suivie pour le moment.</p>}

      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.symbol} className="rounded-xl bg-[#161A1E] p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">{it.symbol} <span className="text-gray-400 font-normal text-sm">{it.name}</span></p>
                {editing !== it.symbol && (
                  <p className="text-sm text-gray-400 mt-1">
                    {it.note || "Pas de note"}{it.targetPrice ? ` · Cible: ${it.targetPrice}` : ""}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                {editing === it.symbol ? (
                  <button type="button" onClick={() => saveEdit(it.symbol)} className="text-green-400" aria-label={`Enregistrer ${it.symbol}`}><Check size={18} /></button>
                ) : (
                  <button type="button" onClick={() => startEdit(it)} className="text-blue-400" aria-label={`Modifier ${it.symbol}`}><Pencil size={18} /></button>
                )}
                <button type="button" onClick={() => onDelete(it.symbol)} className="text-red-400" aria-label={`Supprimer ${it.symbol}`}><Trash2 size={18} /></button>
              </div>
            </div>
            {editing === it.symbol && (
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" className="flex-1 rounded-lg bg-[#0B0E11] border border-gray-700 px-3 py-2 text-white" />
                <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Prix cible" inputMode="decimal" className="sm:w-32 rounded-lg bg-[#0B0E11] border border-gray-700 px-3 py-2 text-white" />
              </div>
            )}
          </li>
        ))}
      </ul>
      <RiskBoard symbols={items.map((item) => item.symbol)} />
      <StressBoard symbols={items.map((item) => item.symbol)} />
    </main>
  );
}

type Risk = {
  status: string;
  message?: string;
  symbols?: string[];
  correlation?: number[][];
  volatilite_portefeuille_pct?: number;
  diversification?: number;
  plus_contributeur?: string;
  explication?: string;
};

function RiskBoard({ symbols }: { symbols: string[] }) {
  const [risk, setRisk] = useState<Risk | null>(null);
  const key = symbols.join(",");
  useEffect(() => {
    const list = key.split(",").filter(Boolean);
    if (list.length < 2) return;
    http.put("/me/watchlist", { symbols: list }).catch(() => undefined).finally(() => {
      http.get<Risk>("/portfolio/risk").then((res) => setRisk(res.data)).catch(() => setRisk(null));
    });
  }, [key]);

  if (symbols.length < 2) return <p className="text-sm text-gray-400">Ajoute deux symboles pour le laboratoire de risque.</p>;
  if (!risk) return null;
  if (risk.status !== "ok" || !risk.correlation || !risk.symbols) return <p className="text-sm text-gray-300">{risk.message}</p>;
  const headers = risk.symbols;
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-bold">Laboratoire de risque</h2>
      <p className="text-sm text-gray-400">{risk.explication}</p>
      <p className="text-sm">Volatilité équipondérée {risk.volatilite_portefeuille_pct} % · diversification {risk.diversification}/100 · plus contributeur {risk.plus_contributeur}</p>
      <div className="grid gap-1 text-xs" style={{ gridTemplateColumns: `repeat(${headers.length + 1}, minmax(0, 1fr))` }}>
        <span />
        {headers.map((symbol) => <span key={symbol} className="text-center">{symbol}</span>)}
        {risk.correlation.map((row, index) => (
          <div key={headers[index]} className="contents">
            <span>{headers[index]}</span>
            {row.map((value, column) => (
              <span key={`${index}-${column}`} className="text-center rounded py-2" style={{ backgroundColor: `rgba(59,130,246,${Math.abs(value)})` }}>{value}</span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function StressBoard({ symbols }: { symbols: string[] }) {
  const [rows, setRows] = useState<{ date: string; perte_pct: number; contributions: Record<string, number> }[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const key = symbols.join(",");
  useEffect(() => {
    const list = key.split(",").filter(Boolean);
    if (list.length < 2) return;
    http.put("/me/watchlist", { symbols: list }).catch(() => undefined).finally(() => {
      http.get<{ status: string; message?: string; jours?: { date: string; perte_pct: number; contributions: Record<string, number> }[]; avertissement?: string }>("/portfolio/stress")
        .then((res) => {
          setRows(res.data.jours || []);
          setNote(res.data.message || res.data.avertissement || null);
        })
        .catch(() => setNote("Le test de résistance n'a pas pu être calculé."));
    });
  }, [key]);
  if (symbols.length < 2) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-bold">Test de résistance</h2>
      {note && <p className="text-sm text-gray-400">{note}</p>}
      <ul className="text-sm space-y-2">
        {rows.map((row) => (
          <li key={row.date}>{row.date} : {row.perte_pct} % · {Object.entries(row.contributions).map(([symbol, value]) => `${symbol} ${value} %`).join(", ")}</li>
        ))}
      </ul>
    </section>
  );
}

export default function WatchlistPage() {
  return <RequireAuth><WatchlistBody /></RequireAuth>;
}