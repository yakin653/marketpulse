"use client";

/**
 * Contexte de la visite guidée : démarrage, navigation d'étapes, invitation toast.
 * Aucun appel réseau. Persistance localStorage via le moteur.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  isTourBlockedPath,
  readProgress,
  selectSteps,
  writeProgress,
} from "@/lib/tour/engine";
import { TOUR_DEFAULT_SYMBOL, TOUR_VERSION } from "@/lib/tour/steps";
import type { TourLevel, TourProgress, TourStep } from "@/lib/tour/types";
import { useAuth } from "@/lib/auth";
import TourOverlay from "@/components/tour/TourOverlay";

type TourApi = {
  startTour: () => void;
  stopTour: () => void;
  active: boolean;
};

const TourContext = createContext<TourApi>({
  startTour: () => undefined,
  stopTour: () => undefined,
  active: false,
});

export function useTour() {
  return useContext(TourContext);
}

function userStorageKey(userId: string | undefined, demo: boolean): string {
  if (demo) return "demo";
  if (!userId) return "guest";
  return userId;
}

const emptySubscribe = () => () => undefined;

export function TourProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [invite, setInvite] = useState(false);

  const demo = Boolean(user && (user.id.startsWith("demo") || user.email === "demo@marketpulse.local"));
  const storageId = userStorageKey(user?.id, demo);
  const level = (user?.profile?.level ?? "debutant") as TourLevel;

  const persist = useCallback(
    (patch: Partial<TourProgress>) => {
      if (typeof window === "undefined") return;
      const current = readProgress(storageId, window.localStorage);
      writeProgress(storageId, { ...current, ...patch, version: TOUR_VERSION }, window.localStorage);
    },
    [storageId],
  );

  const stopTour = useCallback(() => {
    setActive(false);
    setIndex(0);
  }, []);

  const startTour = useCallback(() => {
    if (typeof window === "undefined") return;
    if (isTourBlockedPath(pathname)) return;
    const list = selectSteps(level).map((step) => {
      if (step.id !== "pulse") return step;
      const card = document.querySelector<HTMLElement>("[data-tour='company-card']");
      const href = card?.closest("a")?.getAttribute("href") || card?.getAttribute("href");
      const match = href?.match(/\/asset\/([^/?#]+)/);
      const symbol = match?.[1] || TOUR_DEFAULT_SYMBOL;
      return { ...step, route: `/asset/${symbol}` };
    });
    setSteps(list);
    setIndex(0);
    setInvite(false);
    setActive(true);
    const first = list[0];
    if (first?.route && first.route !== pathname) {
      router.push(first.route);
    }
  }, [level, pathname, router]);

  // Après onboarding : drapeau session → auto-start sur /dashboard (différé pour le linter).
  useEffect(() => {
    if (!mounted || !user || isTourBlockedPath(pathname)) return;
    if (pathname !== "/dashboard") return;
    let flag = false;
    try {
      flag = sessionStorage.getItem("mp_tour_autostart") === "1";
      if (flag) sessionStorage.removeItem("mp_tour_autostart");
    } catch {
      return;
    }
    if (!flag) return;
    const progress = readProgress(storageId, window.localStorage);
    if (progress.completed || progress.skippedAt != null) return;
    const timer = window.setTimeout(() => startTour(), 0);
    return () => window.clearTimeout(timer);
  }, [mounted, user, pathname, startTour, storageId]);

  // Invitation discrète (une fois) pour comptes qui n'ont jamais vu la visite
  useEffect(() => {
    if (!mounted || !user || active || isTourBlockedPath(pathname)) return;
    if (pathname !== "/dashboard") return;
    const progress = readProgress(storageId, window.localStorage);
    if (progress.completed || progress.skippedAt != null || progress.inviteDismissed) return;
    const timer = window.setTimeout(() => setInvite(true), 800);
    return () => window.clearTimeout(timer);
  }, [mounted, user, active, pathname, storageId]);

  const onNext = useCallback(() => {
    const next = index + 1;
    if (next >= steps.length) {
      persist({ completed: true, skippedAt: null });
      stopTour();
      return;
    }
    const step = steps[next];
    setIndex(next);
    if (step.route && step.route !== pathname) {
      router.push(step.route);
    }
  }, [index, steps, persist, stopTour, pathname, router]);

  const onPrev = useCallback(() => {
    if (index <= 0) return;
    const prev = index - 1;
    const step = steps[prev];
    setIndex(prev);
    if (step.route && step.route !== pathname) {
      router.push(step.route);
    }
  }, [index, steps, pathname, router]);

  const onSkip = useCallback(() => {
    persist({ skippedAt: index, completed: false });
    stopTour();
  }, [index, persist, stopTour]);

  const api = useMemo(
    () => ({ startTour, stopTour, active }),
    [startTour, stopTour, active],
  );

  return (
    <TourContext.Provider value={api}>
      {children}
      {mounted && active && steps[index] && (
        <TourOverlay
          step={steps[index]}
          index={index}
          total={steps.length}
          onPrev={onPrev}
          onNext={onNext}
          onSkip={onSkip}
        />
      )}
      {mounted && invite && !active && (
        <div
          className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-4 z-[85] max-w-sm rounded-xl border border-gray-700 bg-[#161A1E] p-4 shadow-lg"
          role="status"
        >
          <p className="text-sm text-gray-100 mb-3">Découvrir MarketPulse en 2 minutes ?</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="min-h-11 flex-1 rounded-lg bg-[var(--accent)] px-3 text-white"
              onClick={() => {
                setInvite(false);
                startTour();
              }}
            >
              Commencer
            </button>
            <button
              type="button"
              className="min-h-11 flex-1 rounded-lg border border-gray-600 px-3"
              onClick={() => {
                setInvite(false);
                persist({ inviteDismissed: true });
              }}
            >
              Plus tard
            </button>
          </div>
        </div>
      )}
    </TourContext.Provider>
  );
}
