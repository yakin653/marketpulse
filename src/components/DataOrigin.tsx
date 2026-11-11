const LABELS: Record<string, string> = {
  yahoo: "Cours Yahoo Finance",
  simulation: "Séries simulées",
  mock: "Jeu local de démonstration",
  cache: "Copie enregistrée",
};

export default function DataOrigin({
  origine,
  asOf,
}: {
  origine?: string | null;
  asOf?: string | null;
}) {
  if (!origine) return null;
  const label = LABELS[origine] ?? "Origine non précisée";
  return (
    <span
      className="text-xs px-2 py-1 rounded-full border border-gray-700 text-gray-300 whitespace-nowrap"
      title={asOf ? `Dernière séance ${asOf}` : undefined}
    >
      {label}
      {asOf ? ` · ${asOf}` : ""}
    </span>
  );
}
