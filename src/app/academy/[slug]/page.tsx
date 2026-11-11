"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { http } from "@/lib/http";

type Quiz = { question: string; a: string; b: string; answer: "A" | "B" };
type Fiche = { slug: string; title: string; text: string; quiz: Quiz | null };

function alreadyDone(slug: string) {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem("academy-progress");
    const known = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(known) && known.includes(slug);
  } catch {
    return false;
  }
}

function FicheBody({ slug }: { slug: string }) {
  const [fiche, setFiche] = useState<Fiche | null | undefined>(undefined);
  const [choice, setChoice] = useState<"A" | "B" | null>(null);
  const [done, setDone] = useState(() => alreadyDone(slug));

  useEffect(() => {
    let live = true;
    http.get<Fiche>(`/knowledge/${slug}`)
      .then((res) => { if (live) setFiche(res.data); })
      .catch(() => { if (live) setFiche(null); });
    return () => { live = false; };
  }, [slug]);

  function answer(value: "A" | "B") {
    setChoice(value);
    if (!fiche?.quiz || value !== fiche.quiz.answer) return;
    try {
      const raw = window.localStorage.getItem("academy-progress");
      const known = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
      known.add(slug);
      window.localStorage.setItem("academy-progress", JSON.stringify([...known]));
    } catch {
      window.localStorage.setItem("academy-progress", JSON.stringify([slug]));
    }
    setDone(true);
  }

  if (fiche === undefined) return <p className="text-sm text-gray-400">Chargement…</p>;
  if (!fiche) return <p className="text-sm text-gray-400">Fiche introuvable.</p>;
  const body = fiche.text.replace("<!-- à relire -->", "").split("## Quiz")[0];

  return (
    <article className="max-w-3xl mx-auto space-y-4">
      <Link href="/academy" className="text-sm text-[var(--accent)]">Toutes les fiches</Link>
      <h1 className="text-2xl font-bold">{fiche.title}</h1>
      {done && <p className="text-sm text-emerald-300">Notion déjà réussie sur cet appareil.</p>}
      <pre className="whitespace-pre-wrap font-sans text-sm text-gray-200">{body}</pre>
      {fiche.quiz && (
        <fieldset className="space-y-2">
          <legend className="font-medium">{fiche.quiz.question}</legend>
          <button type="button" className="min-h-11 block w-full text-left border border-gray-700 rounded-lg px-3" onClick={() => answer("A")}>A. {fiche.quiz.a}</button>
          <button type="button" className="min-h-11 block w-full text-left border border-gray-700 rounded-lg px-3" onClick={() => answer("B")}>B. {fiche.quiz.b}</button>
          {choice && <p className="text-sm" role="status">{choice === fiche.quiz.answer ? "Bonne réponse." : "Ce n'est pas la réponse de la fiche."}</p>}
        </fieldset>
      )}
    </article>
  );
}

export default function FichePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <FicheBody key={slug} slug={slug} />;
}
