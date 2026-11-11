"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { useAuth, type Profile } from "@/lib/auth";
import { errorText, http } from "@/lib/http";

const SECTORS = ["Technologie", "Santé", "Énergie", "Finance", "Industrie", "Consommation"];
const GOALS = ["Comprendre", "Suivre", "Apprendre les indicateurs"];

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function OnboardingForm() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<Profile["level"]>("debutant");
  const [goal, setGoal] = useState("Comprendre");
  const [horizon, setHorizon] = useState<Profile["horizon"]>("moyen");
  const [risk, setRisk] = useState<Profile["risk_tolerance"]>("equilibre");
  const [sectors, setSectors] = useState<string[]>([]);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [keywords, setKeywords] = useState("");
  const [frequence, setFrequence] = useState<"instantane" | "quotidien">("instantane");
  const [heure, setHeure] = useState(8);
  const [quietStart, setQuietStart] = useState(22);
  const [quietEnd, setQuietEnd] = useState(7);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    http.get<string[]>("/assets").then((res) => setCatalog(res.data)).catch(() => setCatalog([]));
  }, []);

  async function finish() {
    setError(null);
    try {
      const profile = {
        level,
        horizon,
        risk_tolerance: risk,
        goals: [goal],
        sectors,
        favorite_symbols: symbols,
        news_keywords: keywords.split(",").map((item) => item.trim()).filter(Boolean),
        language: "fr",
        notif_prefs: { frequence, heure, quiet_start: quietStart, quiet_end: quietEnd },
        onboarding_completed: true,
      };
      await http.put("/me/profile", profile);
      if (user) setUser({ ...user, onboarding_completed: true, profile: { ...profile, onboarding_completed: true } });
      router.push("/dashboard");
    } catch (err) {
      setError(errorText(err, "Le profil n'a pas été enregistré."));
    }
  }

  const filtered = catalog.filter((symbol) => symbol.includes(query.toUpperCase())).slice(0, 8);

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-[var(--accent)]" style={{ width: `${((step + 1) / 4) * 100}%` }} />
      </div>
      <p className="text-sm text-gray-400">Étape {step + 1} / 4</p>
      {step === 0 && (
        <section className="space-y-3">
          <h1 className="text-2xl font-bold">Ton niveau et ton objectif</h1>
          {(["debutant", "intermediaire", "expert"] as const).map((item) => (
            <button key={item} type="button" onClick={() => setLevel(item)} className={`block w-full text-left px-3 py-2 rounded-lg border ${level === item ? "border-[var(--accent)]" : "border-gray-700"}`}>{item}</button>
          ))}
          <div className="flex flex-wrap gap-2">{GOALS.map((item) => (
            <button key={item} type="button" onClick={() => setGoal(item)} className={`px-3 py-1 rounded-full border ${goal === item ? "border-[var(--accent)]" : "border-gray-700"}`}>{item}</button>
          ))}</div>
        </section>
      )}
      {step === 1 && (
        <section className="space-y-4">
          <h1 className="text-2xl font-bold">Trois mises en situation</h1>
          <p className="text-sm text-gray-300">Si ton portefeuille perd 15 % en un mois, tu…</p>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => setRisk("prudent")} className={`px-3 py-2 rounded-lg border text-left ${risk === "prudent" ? "border-[var(--accent)]" : "border-gray-700"}`}>réduis le risque</button>
            <button type="button" onClick={() => setRisk("equilibre")} className={`px-3 py-2 rounded-lg border text-left ${risk === "equilibre" ? "border-[var(--accent)]" : "border-gray-700"}`}>attends</button>
            <button type="button" onClick={() => setRisk("dynamique")} className={`px-3 py-2 rounded-lg border text-left ${risk === "dynamique" ? "border-[var(--accent)]" : "border-gray-700"}`}>renforces</button>
          </div>
          <p className="text-sm text-gray-300">Tu auras besoin de cet argent…</p>
          <div className="flex flex-wrap gap-2">
            {([["court", "dans moins de 2 ans"], ["moyen", "d'ici 2 à 5 ans"], ["long", "plus tard"]] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setHorizon(value)} className={`px-3 py-2 rounded-lg border ${horizon === value ? "border-[var(--accent)]" : "border-gray-700"}`}>{label}</button>
            ))}
          </div>
          <p className="text-sm text-gray-300">Le lendemain d&apos;un achat, le cours baisse de 8 %. Tu…</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setRisk("prudent")} className="px-3 py-2 rounded-lg border border-gray-700">vends</button>
            <button type="button" onClick={() => setRisk("equilibre")} className="px-3 py-2 rounded-lg border border-gray-700">gardes</button>
            <button type="button" onClick={() => setRisk("dynamique")} className="px-3 py-2 rounded-lg border border-gray-700">rachètes</button>
          </div>
        </section>
      )}
      {step === 2 && (
        <section className="space-y-3">
          <h1 className="text-2xl font-bold">Centres d&apos;intérêt</h1>
          <div className="flex flex-wrap gap-2">{SECTORS.map((item) => (
            <button key={item} type="button" onClick={() => setSectors((current) => toggle(current, item))} className={`px-3 py-1 rounded-full border ${sectors.includes(item) ? "border-[var(--accent)]" : "border-gray-700"}`}>{item}</button>
          ))}</div>
          <input className="w-full bg-[#0B0E11] border border-gray-700 rounded-lg px-3 py-2" placeholder="Filtrer les symboles" value={query} onChange={(event) => setQuery(event.target.value)} />
          <div className="flex flex-wrap gap-2">{filtered.map((symbol) => (
            <button key={symbol} type="button" onClick={() => setSymbols((current) => toggle(current, symbol))} className={`px-3 py-1 rounded-lg border ${symbols.includes(symbol) ? "border-[var(--accent)]" : "border-gray-700"}`}>{symbol}</button>
          ))}</div>
          <input className="w-full bg-[#0B0E11] border border-gray-700 rounded-lg px-3 py-2" placeholder="Mots-clés, séparés par des virgules" value={keywords} onChange={(event) => setKeywords(event.target.value)} />
        </section>
      )}
      {step === 3 && (
        <section className="space-y-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <div className="flex gap-2">
            <button type="button" onClick={() => setFrequence("instantane")} className={`px-3 py-2 rounded-lg border ${frequence === "instantane" ? "border-[var(--accent)]" : "border-gray-700"}`}>Instantané</button>
            <button type="button" onClick={() => setFrequence("quotidien")} className={`px-3 py-2 rounded-lg border ${frequence === "quotidien" ? "border-[var(--accent)]" : "border-gray-700"}`}>Résumé quotidien</button>
          </div>
          <label className="block text-sm">Heure du résumé
            <input className="mt-1 w-full bg-[#0B0E11] border border-gray-700 rounded-lg px-3 py-2" type="number" min={0} max={23} value={heure} onChange={(event) => setHeure(Number(event.target.value))} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm">Heures calmes, début
              <input className="mt-1 w-full bg-[#0B0E11] border border-gray-700 rounded-lg px-3 py-2" type="number" min={0} max={23} value={quietStart} onChange={(event) => setQuietStart(Number(event.target.value))} />
            </label>
            <label className="text-sm">fin
              <input className="mt-1 w-full bg-[#0B0E11] border border-gray-700 rounded-lg px-3 py-2" type="number" min={0} max={23} value={quietEnd} onChange={(event) => setQuietEnd(Number(event.target.value))} />
            </label>
          </div>
        </section>
      )}
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="flex justify-between">
        <button type="button" className="px-4 py-2" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>Retour</button>
        {step < 3 ? (
          <button type="button" className="px-4 py-2 bg-[var(--accent)] rounded-lg" onClick={() => setStep((value) => value + 1)}>Suivant</button>
        ) : (
          <button type="button" className="px-4 py-2 bg-[var(--accent)] rounded-lg" onClick={finish}>Terminer</button>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return <RequireAuth><OnboardingForm /></RequireAuth>;
}
