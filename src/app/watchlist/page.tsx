"use client";
import { useCallback, useEffect, useState } from "react";
import { Trash2, Pencil, Plus, Check } from "lucide-react";
import { addWatch, listWatch, removeWatch, updateWatch, type WatchItem } from "@/lib/db";

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [target, setTarget] = useState("");

  const refresh = useCallback(async () => setItems(await listWatch()), []);
  useEffect(() => { refresh(); }, [refresh]);

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
      <h1 className="text-2xl font-bold mb-6">Ma watchlist (CRUD)</h1>
      <div className="flex flex-col sm:flex-row gap-2">
        <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbole (ex: AAPL)" className="flex-1 rounded-lg bg-[#161A1E] border border-gray-800 px-3 py-2 text-white" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom entreprise" className="flex-1 rounded-lg bg-[#161A1E] border border-gray-800 px-3 py-2 text-white" />
        <button onClick={onAdd} className="rounded-lg bg-[var(--accent)] hover:bg-blue-600 px-4 py-2 flex items-center justify-center gap-1 text-white font-medium transition-colors">
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
                  <button onClick={() => saveEdit(it.symbol)} className="text-green-400"><Check size={18} /></button>
                ) : (
                  <button onClick={() => startEdit(it)} className="text-blue-400"><Pencil size={18} /></button>
                )}
                <button onClick={() => onDelete(it.symbol)} className="text-red-400"><Trash2 size={18} /></button>
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
    </main>
  );
}