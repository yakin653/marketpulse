/**
 * Moteur de la visite guidée : fonctions pures, testables sans React.
 * Aucun accès à window ici (sauf via paramètres injectés).
 */
import { TOUR_STEPS, TOUR_VERSION } from "./steps.ts";
import type { BubbleBox, RectLike, TourLevel, TourPlacement, TourProgress, TourStep } from "./types.ts";

export const TOUR_STORAGE_PREFIX = "mp_tour_v1";

export function storageKey(userKey: string): string {
  return `${TOUR_STORAGE_PREFIX}:${userKey || "guest"}`;
}

/** Parcours long (debutant) ou express (intermediaire / expert). */
export function selectSteps(level: TourLevel | undefined): TourStep[] {
  if (level === "intermediaire" || level === "expert") {
    return TOUR_STEPS.filter((step) => step.express);
  }
  return TOUR_STEPS.slice();
}

export function defaultProgress(): TourProgress {
  return {
    version: TOUR_VERSION,
    completed: false,
    skippedAt: null,
    inviteDismissed: false,
  };
}

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

/** Mémoire de secours si localStorage est bloqué (mode privé strict, quota…). */
const memory = new Map<string, string>();

export function readProgress(userKey: string, store?: StorageLike | null): TourProgress {
  const key = storageKey(userKey);
  let raw: string | null = null;
  try {
    raw = store?.getItem(key) ?? null;
  } catch {
    raw = null;
  }
  if (raw == null) raw = memory.get(key) ?? null;
  if (!raw) return defaultProgress();
  try {
    const parsed = JSON.parse(raw) as Partial<TourProgress>;
    return {
      version: typeof parsed.version === "number" ? parsed.version : TOUR_VERSION,
      completed: parsed.completed === true,
      skippedAt: typeof parsed.skippedAt === "number" ? parsed.skippedAt : null,
      inviteDismissed: parsed.inviteDismissed === true,
    };
  } catch {
    return defaultProgress();
  }
}

export function writeProgress(userKey: string, progress: TourProgress, store?: StorageLike | null): void {
  const key = storageKey(userKey);
  const payload = JSON.stringify({ ...progress, version: TOUR_VERSION });
  memory.set(key, payload);
  if (!store) return;
  try {
    store.setItem(key, payload);
  } catch {
    /* repli mémoire déjà fait */
  }
}

/** Premier élément vraiment visible parmi plusieurs [data-tour]. */
export function resolveVisibleTarget(
  nodes: Array<{ getBoundingClientRect: () => RectLike; checkVisibility?: () => boolean }>,
  viewport: { width: number; height: number },
): RectLike | null {
  for (const node of nodes) {
    const rect = node.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    const visibleByApi = node.checkVisibility ? node.checkVisibility() : true;
    if (!visibleByApi) continue;
    const inView =
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < viewport.height &&
      rect.left < viewport.width;
    if (inView) return rect;
  }
  return null;
}

const GAP = 12;
const MARGIN = 8;

/**
 * Place la bulle autour de la cible ; repli top↔bottom / left↔right ;
 * puis clamp dans l'écran. Sans cible → centré.
 */
export function placeBubble(
  preferred: TourPlacement,
  target: RectLike | null,
  bubble: { width: number; height: number },
  viewport: { width: number; height: number },
  mobileBottomSheet: boolean,
): { box: BubbleBox; placement: TourPlacement } {
  if (!target || preferred === "center") {
    return {
      placement: "center",
      box: {
        width: bubble.width,
        height: bubble.height,
        top: Math.max(MARGIN, (viewport.height - bubble.height) / 2),
        left: Math.max(MARGIN, (viewport.width - bubble.width) / 2),
      },
    };
  }

  if (mobileBottomSheet) {
    return {
      placement: "bottom",
      box: {
        width: Math.min(bubble.width, viewport.width - MARGIN * 2),
        height: bubble.height,
        top: viewport.height - bubble.height - MARGIN,
        left: MARGIN,
      },
    };
  }

  const order: TourPlacement[] = [preferred];
  if (preferred === "top") order.push("bottom", "right", "left");
  else if (preferred === "bottom") order.push("top", "right", "left");
  else if (preferred === "left") order.push("right", "top", "bottom");
  else if (preferred === "right") order.push("left", "top", "bottom");

  for (const placement of order) {
    const box = candidate(placement, target, bubble, viewport);
    if (fits(box, viewport)) return { placement, box: clamp(box, viewport) };
  }

  const fallback = candidate(preferred, target, bubble, viewport);
  return { placement: preferred, box: clamp(fallback, viewport) };
}

function candidate(
  placement: TourPlacement,
  target: RectLike,
  bubble: { width: number; height: number },
  viewport: { width: number; height: number },
): BubbleBox {
  const midX = target.left + target.width / 2 - bubble.width / 2;
  const midY = target.top + target.height / 2 - bubble.height / 2;
  if (placement === "top") {
    return { top: target.top - bubble.height - GAP, left: midX, width: bubble.width, height: bubble.height };
  }
  if (placement === "bottom") {
    return { top: target.bottom + GAP, left: midX, width: bubble.width, height: bubble.height };
  }
  if (placement === "left") {
    return { top: midY, left: target.left - bubble.width - GAP, width: bubble.width, height: bubble.height };
  }
  if (placement === "right") {
    return { top: midY, left: target.right + GAP, width: bubble.width, height: bubble.height };
  }
  return {
    top: (viewport.height - bubble.height) / 2,
    left: (viewport.width - bubble.width) / 2,
    width: bubble.width,
    height: bubble.height,
  };
}

function fits(box: BubbleBox, viewport: { width: number; height: number }): boolean {
  return (
    box.top >= MARGIN &&
    box.left >= MARGIN &&
    box.top + box.height <= viewport.height - MARGIN &&
    box.left + box.width <= viewport.width - MARGIN
  );
}

function clamp(box: BubbleBox, viewport: { width: number; height: number }): BubbleBox {
  const width = Math.min(box.width, viewport.width - MARGIN * 2);
  const height = Math.min(box.height, viewport.height - MARGIN * 2);
  return {
    width,
    height,
    top: Math.min(Math.max(MARGIN, box.top), viewport.height - height - MARGIN),
    left: Math.min(Math.max(MARGIN, box.left), viewport.width - width - MARGIN),
  };
}

/** La visite ne doit jamais démarrer sur ces routes. */
export function isTourBlockedPath(pathname: string): boolean {
  return pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/onboarding";
}
