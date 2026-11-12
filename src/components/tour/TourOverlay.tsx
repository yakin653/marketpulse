"use client";

/**
 * Bulle + halo de surbrillance. Placement recalculé au scroll / resize.
 * Fermeture : Passer ou Échap uniquement (pas le fond).
 */
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { placeBubble, resolveVisibleTarget } from "@/lib/tour/engine";
import type { TourPlacement, TourStep } from "@/lib/tour/types";

type Props = {
  step: TourStep;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
};

const BUBBLE = { width: 320, height: 220 };

export default function TourOverlay({ step, index, total, onPrev, onNext, onSkip }: Props) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [placement, setPlacement] = useState<TourPlacement>(step.placement);
  const [box, setBox] = useState({ top: 80, left: 24, width: BUBBLE.width, height: BUBBLE.height });
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    prevFocus.current = document.activeElement as HTMLElement | null;
    return () => {
      prevFocus.current?.focus?.();
    };
  }, []);

  useLayoutEffect(() => {
    let cancelled = false;
    let tries = 0;
    const maxTries = 6; // ~3 s à 500 ms

    function measure() {
      if (cancelled) return;
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const mobile = viewport.width < 768;
      let nextRect: DOMRect | null = null;
      if (step.target) {
        const nodes = Array.from(document.querySelectorAll(`[data-tour="${step.target}"]`));
        const found = resolveVisibleTarget(
          nodes.map((node) => ({
            getBoundingClientRect: () => node.getBoundingClientRect(),
            checkVisibility: () => {
              const style = window.getComputedStyle(node);
              if (style.display === "none" || style.visibility === "hidden") return false;
              // md:hidden / hidden md:flex : offsetParent null hors de la variante affichée
              return (node as HTMLElement).offsetParent !== null || style.position === "fixed";
            },
          })),
          viewport,
        );
        if (found) {
          nextRect = found as DOMRect;
        }
      }
      if (!nextRect && step.target && tries < maxTries) {
        tries += 1;
        window.setTimeout(measure, 500);
        return;
      }
      setRect(nextRect);
      const placed = placeBubble(
        step.placement,
        nextRect,
        BUBBLE,
        viewport,
        mobile && Boolean(nextRect),
      );
      setPlacement(placed.placement);
      setBox(placed.box);
      if (nextRect) {
        document.querySelector(`[data-tour="${step.target}"]`)?.scrollIntoView({
          block: "center",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
      }
      setAnnounce(`Étape ${index + 1} sur ${total} : ${step.title}. ${step.body}`);
    }

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step, index, total]);

  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>("button, [href], input")?.focus();
  }, [step.id]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onSkip();
        return;
      }
      if (event.key === "ArrowRight" || event.key === "Enter") {
        event.preventDefault();
        onNext();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrev();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"),
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext, onPrev, onSkip]);

  const highlight = rect
    ? {
        top: rect.top - 6,
        left: rect.left - 6,
        width: rect.width + 12,
        height: rect.height + 12,
      }
    : null;

  return (
    <div className="fixed inset-0 z-[90]" aria-hidden={false}>
      {/* Fond non cliquable pour fermer : capture sans onClick de fermeture */}
      <div className="absolute inset-0 bg-black/50" />
      {highlight && (
        <div
          className="pointer-events-none absolute rounded-xl border-2 border-cyan-300 motion-safe:transition-all"
          style={{
            top: highlight.top,
            left: highlight.left,
            width: highlight.width,
            height: highlight.height,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
          }}
        />
      )}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="absolute flex flex-col gap-3 rounded-xl border border-gray-700 bg-[#161A1E] p-4 text-sm text-gray-100 shadow-xl"
        style={{
          top: box.top,
          left: box.left,
          width: Math.min(box.width, typeof window !== "undefined" ? window.innerWidth - 16 : box.width),
          maxWidth: "min(320px, calc(100vw - 16px))",
        }}
      >
        <p className="text-xs text-gray-400">{index + 1} / {total} · {placement}</p>
        <h2 id={titleId} className="text-lg font-semibold text-white">{step.title}</h2>
        <p id={descId} className="text-sm text-gray-300 leading-relaxed">{step.body}</p>
        <div className="flex gap-1" aria-hidden>
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= index ? "bg-cyan-400" : "bg-gray-700"}`}
            />
          ))}
        </div>
        <div className="mt-1 flex flex-wrap gap-2">
          <button
            type="button"
            className="min-h-11 min-w-11 rounded-lg border border-gray-600 px-3 disabled:opacity-40"
            onClick={onPrev}
            disabled={index === 0}
          >
            Précédent
          </button>
          <button
            type="button"
            className="min-h-11 min-w-11 flex-1 rounded-lg bg-[var(--accent)] px-3 font-medium text-white"
            onClick={onNext}
          >
            {index + 1 >= total ? "Terminer" : "Suivant"}
          </button>
          <button
            type="button"
            className="min-h-11 min-w-11 rounded-lg border border-gray-600 px-3 text-gray-300"
            onClick={onSkip}
          >
            Passer
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{announce}</p>
    </div>
  );
}
