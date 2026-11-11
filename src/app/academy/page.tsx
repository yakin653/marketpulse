"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { http } from "@/lib/http";

type Fiche = { slug: string; title: string };

export default function AcademyPage() {
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      http.get<{ fiches: Fiche[] }>("/knowledge", { params: query.trim() ? { q: query.trim() } : {} })
        .then((res) => setFiches(res.data.fiches))
        .catch(() => setFiches([]))
        .finally(() => setReady(true));
    }, 200);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Académie</h1>
      <p className="text-sm text-gray-400">Les mêmes fiches que le chat. Une question, une bonne réponse, rien de daté.</p>
      <input aria-label="Chercher une fiche" className="w-full min-h-11 rounded-lg bg-[#0B0E11] border border-gray-700 px-3" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ETF, volatilité, dividende…" />
      <ul className="space-y-2">
        {fiches.map((fiche) => (
          <li key={fiche.slug}><Link className="min-h-11 flex items-center underline" href={`/academy/${fiche.slug}`}>{fiche.title}</Link></li>
        ))}
      </ul>
      {ready && fiches.length === 0 && <p className="text-sm text-gray-400">Aucune fiche pour cette recherche.</p>}
    </div>
  );
}
