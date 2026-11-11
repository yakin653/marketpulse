"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function SearchBar({ onAdded, compact = false }: { onAdded?: () => void; compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = query.trim();
    if (!text) return;
    if (text.length > 60) {
      setError("Saisis un nom ou un symbole, par exemple Amazon ou AMZN.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/assets/add/${encodeURIComponent(text)}`, {}, { timeout: 25000 });
      const symbol = res.data?.symbol;
      if (!symbol) {
        setError("La recherche n'a pas renvoyé de symbole.");
        return;
      }
      onAdded?.();
      router.push(`/asset/${symbol}`);
    } catch (err) {
      const detail = axios.isAxiosError(err) ? err.response?.data?.detail : null;
      setError(typeof detail === "string" ? detail : "Impossible de récupérer une série réelle pour cette recherche.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className={compact ? "min-w-0" : "bg-[var(--surface)] p-2 rounded-xl border border-gray-800"}>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex items-center px-4 bg-[#0B0E11] rounded-lg min-w-0">
          <Search className="text-gray-500 shrink-0" size={20} aria-hidden />
          <input
            type="text"
            placeholder="Nom ou symbole (Amazon, AMZN, Bitcoin)"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Symbole à rechercher"
            aria-invalid={error ? true : undefined}
            className="w-full min-w-0 bg-transparent px-3 py-3 text-white outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--accent)] hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "…" : compact ? "OK" : "Ajouter"}
        </button>
      </div>
      {error && <p className="text-sm text-red-300 px-2 pt-2" role="alert">{error}</p>}
    </form>
  );
}
