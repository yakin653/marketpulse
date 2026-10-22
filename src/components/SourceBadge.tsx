import type { DataSource } from "@/lib/data";

const LABELS: Record<DataSource, string> = {
  network: "Données en direct",
  cache: "Dernières données enregistrées",
  mock: "Données de démonstration",
};

export default function SourceBadge({ source }: { source?: DataSource }) {
  if (!source) return null;
  return (
    <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">
      {LABELS[source]}
    </span>
  );
}