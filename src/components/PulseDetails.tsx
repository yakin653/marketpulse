import type { PulsePart } from "@/lib/pulse";

export default function PulseDetails({
  score,
  parts,
  explication,
}: {
  score: number | null;
  parts: PulsePart[];
  explication: string;
}) {
  return (
    <div className="bg-[var(--surface)] p-6 rounded-xl border border-gray-800">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h2 className="text-lg font-bold">Lecture du Pulse Score</h2>
        <span className="num text-sm text-gray-400 whitespace-nowrap">{score == null ? "—" : `${score} / 100`}</span>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed mb-4">{explication}</p>
      {parts.length === 0 ? (
        <p className="text-sm text-gray-500">Pas assez d&apos;indicateurs pour décomposer le score.</p>
      ) : (
        <ul className="space-y-3">
          {parts.map((part) => (
            <li key={part.key}>
              <div className="flex justify-between text-sm mb-1 gap-3">
                <span className="font-medium">{part.label}</span>
                <span className="num text-gray-300 shrink-0">
                  {part.note}/100 · {Math.round(part.poids * 100)} %
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-[var(--accent)]" style={{ width: `${part.note}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">{part.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
