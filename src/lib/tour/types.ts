/** Types de la visite guidée (purs, sans DOM). */

export type TourLevel = "debutant" | "intermediaire" | "expert";

export type TourPlacement = "top" | "bottom" | "left" | "right" | "center";

export type TourStep = {
  id: string;
  /** Route Next à ouvrir avant d'afficher l'étape (optionnel). */
  route?: string;
  /** Attribut data-tour="…" ; absent = carte centrée. */
  target?: string;
  title: string;
  body: string;
  placement: TourPlacement;
  required: boolean;
  /** Inclus dans le parcours express (intermediaire / expert). */
  express?: boolean;
};

export type TourProgress = {
  version: number;
  completed: boolean;
  skippedAt: number | null;
  inviteDismissed: boolean;
};

export type RectLike = { top: number; left: number; width: number; height: number; bottom: number; right: number };

export type BubbleBox = { top: number; left: number; width: number; height: number };
