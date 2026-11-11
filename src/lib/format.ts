export function formatPrice(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPct(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)} %`;
}

export function trendLabel(tendance?: string | null): string {
  if (tendance === "haussière") return "Au-dessus de la MM20";
  if (tendance === "baissière") return "Sous la MM20";
  if (tendance === "neutre") return "Sur la MM20";
  return "Moyenne mobile indisponible";
}
