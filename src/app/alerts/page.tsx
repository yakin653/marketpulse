"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { errorText, http } from "@/lib/http";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import {
  createLocalAlert,
  deleteLocalAlert,
  listLocalAlerts,
  saveLocalAlerts,
  toggleLocalAlert,
  type LocalAlert,
} from "@/lib/alertsLocal";

type Alert = LocalAlert;

const KINDS = [
  { value: "mm20", label: "Franchissement MM20" },
  { value: "mm50", label: "Franchissement MM50" },
  { value: "repli", label: "Repli maximal (%)" },
  { value: "volatilite", label: "Volatilité annualisée (%)" },
];

function AlertsBody() {
  const online = useOnlineStatus();
  const [items, setItems] = useState<Alert[]>([]);
  const [symbol, setSymbol] = useState("AAPL");
  const [kind, setKind] = useState("mm20");
  const [threshold, setThreshold] = useState("5");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [localOnly, setLocalOnly] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await http.get<Alert[]>("/me/alerts");
      setItems(res.data);
      await saveLocalAlerts(res.data);
      setLocalOnly(false);
    } catch {
      setItems(await listLocalAlerts());
      setLocalOnly(true);
    }
  }, []);

  useEffect(() => {
    let live = true;
    http.get<Alert[]>("/me/alerts")
      .then(async (res) => {
        if (!live) return;
        setItems(res.data);
        await saveLocalAlerts(res.data);
        setLocalOnly(false);
      })
      .catch(async () => {
        if (!live) return;
        setItems(await listLocalAlerts());
        setLocalOnly(true);
      });
    return () => { live = false; };
  }, []);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const needsThreshold = kind === "repli" || kind === "volatilite";
    const payload = {
      symbol: symbol.trim().toUpperCase(),
      kind,
      threshold: needsThreshold ? Number(threshold) : null,
    };
    try {
      await http.post("/me/alerts", payload);
      await refresh();
    } catch {
      await createLocalAlert(payload);
      setItems(await listLocalAlerts());
      setLocalOnly(true);
    } finally {
      setLoading(false);
    }
  }

  async function onToggle(item: Alert) {
    try {
      await http.patch(`/me/alerts/${item.id}`, null, { params: { enabled: !item.enabled } });
      await refresh();
    } catch {
      setItems(await toggleLocalAlert(item.id, !item.enabled));
      setLocalOnly(true);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Supprimer cette alerte ?")) return;
    try {
      await http.delete(`/me/alerts/${id}`);
      await refresh();
    } catch (err) {
      try {
        setItems(await deleteLocalAlert(id));
        setLocalOnly(true);
      } catch {
        setError(errorText(err, "Suppression impossible."));
      }
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Alertes</h1>
      <p className="text-sm text-gray-400">
        CRUD sur les règles d&apos;alerte : créer, lister, activer ou désactiver, supprimer.
        {localOnly && " Mode local : stockées dans ce navigateur."}
        {!online && !localOnly && " Hors ligne : dernière copie enregistrée."}
      </p>

      <form onSubmit={onCreate} className="space-y-3 rounded-xl border border-gray-800 bg-[var(--surface)] p-4">
        <label className="block text-sm">Symbole
          <input className="mt-1 w-full min-h-11 rounded-lg border border-gray-700 bg-[#0B0E11] px-3" value={symbol} onChange={(event) => setSymbol(event.target.value)} required />
        </label>
        <label className="block text-sm">Type
          <select className="mt-1 w-full min-h-11 rounded-lg border border-gray-700 bg-[#0B0E11] px-3" value={kind} onChange={(event) => setKind(event.target.value)}>
            {KINDS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        {(kind === "repli" || kind === "volatilite") && (
          <label className="block text-sm">Seuil
            <input className="mt-1 w-full min-h-11 rounded-lg border border-gray-700 bg-[#0B0E11] px-3" type="number" step="0.1" value={threshold} onChange={(event) => setThreshold(event.target.value)} required />
          </label>
        )}
        {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
        <button className="w-full min-h-11 rounded-lg bg-[var(--accent)] font-medium disabled:opacity-60" disabled={loading}>
          {loading ? "Création…" : "Créer l'alerte"}
        </button>
      </form>

      <ul className="space-y-2">
        {items.length === 0 && <li className="text-sm text-gray-400">Aucune alerte pour le moment.</li>}
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border border-gray-800 bg-[var(--surface)] p-3">
            <p className="font-medium">{item.symbol} · {KINDS.find((row) => row.value === item.kind)?.label || item.kind}</p>
            <p className="text-sm text-gray-400">
              {item.threshold != null ? `Seuil ${item.threshold}` : "Sans seuil numérique"} · {item.enabled ? "active" : "pause"}
            </p>
            <div className="mt-2 flex gap-3 text-sm">
              <button type="button" className="min-h-11 text-[var(--accent)]" onClick={() => onToggle(item)}>
                {item.enabled ? "Mettre en pause" : "Réactiver"}
              </button>
              <button type="button" className="min-h-11 text-red-300" onClick={() => onDelete(item.id)}>
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AlertsPage() {
  return <RequireAuth><AlertsBody /></RequireAuth>;
}
