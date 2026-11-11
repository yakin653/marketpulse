export type PulsePart = {
  key: string;
  label: string;
  note: number;
  poids: number;
  detail: string;
};

export const PULSE_EXPLICATION =
  "Le Pulse Score résume la structure de prix observée : position face aux moyennes mobiles, stabilité et repli maximal. La probabilité du modèle n'entre pas dans ce score, car l'évaluation du projet montre que le modèle ne dépasse pas une baseline naïve. Ce n'est pas une prévision de rendement.";

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

type AssetInput = {
  prix_actuel?: number | null;
  ma20?: number | null;
  ma50?: number | null;
  volatilite_annualisee_pct?: number | null;
  max_drawdown_pct?: number | null;
} | null;

export function calculatePulseScore(asset: AssetInput): {
  score: number | null;
  composantes: PulsePart[];
  explication: string;
} {
  if (!asset) return { score: null, composantes: [], explication: PULSE_EXPLICATION };

  const parts: Array<Omit<PulsePart, "poids"> & { weight: number }> = [];
  const price = num(asset.prix_actuel);
  const ma20 = num(asset.ma20);
  const ma50 = num(asset.ma50);

  if (price !== null && price > 0 && ma20 !== null && ma20 > 0) {
    let note = 50;
    const gap20 = (price - ma20) / ma20;
    if (ma50 !== null && ma50 > 0) {
      note += clamp(gap20 * 400, -25, 25);
      note += clamp((ma20 - ma50) / ma50 * 400, -25, 25);
    } else {
      note += clamp(gap20 * 800, -50, 50);
    }
    parts.push({
      key: "tendance",
      label: "Position vs moyennes",
      note: clamp(note),
      weight: 0.45,
      detail: ma50
        ? "Écart du cours à la MM20, puis écart de la MM20 à la MM50."
        : "Écart du cours à la MM20. La MM50 n'est pas encore calculable.",
    });
  }

  const vol = num(asset.volatilite_annualisee_pct);
  if (vol !== null) {
    parts.push({
      key: "volatilite",
      label: "Stabilité",
      note: clamp(100 - (vol / 60) * 100),
      weight: 0.3,
      detail: "100 si la volatilité annualisée est nulle, 0 à partir de 60 %.",
    });
  }

  const drawdown = num(asset.max_drawdown_pct);
  if (drawdown !== null) {
    parts.push({
      key: "drawdown",
      label: "Repli maximal",
      note: clamp(100 - (Math.abs(drawdown) / 40) * 100),
      weight: 0.25,
      detail: "100 sans repli sur la fenêtre, 0 si le repli atteint 40 %.",
    });
  }

  const weightSum = parts.reduce((sum, part) => sum + part.weight, 0);
  if (!weightSum) return { score: null, composantes: [], explication: PULSE_EXPLICATION };

  const composantes: PulsePart[] = parts.map((part) => ({
    key: part.key,
    label: part.label,
    note: Math.round(part.note),
    poids: part.weight / weightSum,
    detail: part.detail,
  }));
  const score = Math.round(composantes.reduce((sum, part) => sum + part.note * part.poids, 0));
  return { score: clamp(score), composantes, explication: PULSE_EXPLICATION };
}

export function moodLabel(score: number | null): string {
  if (score == null) return "Climat indisponible";
  if (score >= 60) return "Climat plutôt constructif";
  if (score <= 40) return "Climat plutôt fragile";
  return "Climat équilibré";
}
