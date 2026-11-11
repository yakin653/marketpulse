"use client";

import { useState } from "react";
import type { PulsePart } from "@/lib/pulse";

const WEIGHTS = [
  { key: "tendance", label: "Position vs moyennes", poids: 0.45 },
  { key: "volatilite", label: "Stabilité", poids: 0.3 },
  { key: "drawdown", label: "Repli maximal", poids: 0.25 },
];

/** Recalcul local. Un score de 50 est le point neutre de chaque composante. */
export default function PulseLab({ parts }: { parts: PulsePart[] }) {
  const initial = Object.fromEntries(WEIGHTS.map((item) => {
    const found = parts.find((part) => part.key === item.key);
    return [item.key, found?.note ?? 50];
  }));
  const [notes, setNotes] = useState<Record<string, number>>(initial);
  const score = Math.round(WEIGHTS.reduce((sum, item) => sum + notes[item.key] * item.poids, 0));

  return (
    <section className="bg-[var(--surface)] border border-gray-800 rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-bold">Pourquoi ce score ?</h2>
      <p className="text-sm text-gray-400">Les curseurs « Et si… ? » recalculent le score dans le navigateur. Ils ne prédisent pas un cours.</p>
      <p className="text-3xl font-bold num">{score} / 100</p>
      {WEIGHTS.map((item) => {
        const contribution = Math.round((notes[item.key] - 50) * item.poids);
        return (
          <label key={item.key} className="block text-sm">
            {item.label} · {Math.round(item.poids * 100)} % · {contribution > 0 ? "+" : ""}{contribution} pts vs 50
            <input
              className="w-full mt-1"
              type="range"
              min={0}
              max={100}
              value={notes[item.key]}
              onChange={(event) => setNotes((current) => ({ ...current, [item.key]: Number(event.target.value) }))}
            />
          </label>
        );
      })}
    </section>
  );
}
