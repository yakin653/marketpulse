"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function subscribeDismiss(onStoreChange: () => void) {
  window.addEventListener("mp-install-dismissed", onStoreChange);
  return () => window.removeEventListener("mp-install-dismissed", onStoreChange);
}

function dismissed() {
  return sessionStorage.getItem("mp-install-dismissed") === "1";
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

/** Bannette d'installation PWA, visible en production / après build. */
export default function InstallPrompt() {
  const hide = useSyncExternalStore(
    subscribeDismiss,
    () => dismissed() || isStandalone(),
    () => true,
  );
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function onPrompt(raw: Event) {
      raw.preventDefault();
      setEvent(raw as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hide) return null;

  async function install() {
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    setEvent(null);
    sessionStorage.setItem("mp-install-dismissed", "1");
    window.dispatchEvent(new Event("mp-install-dismissed"));
  }

  function dismiss() {
    sessionStorage.setItem("mp-install-dismissed", "1");
    window.dispatchEvent(new Event("mp-install-dismissed"));
  }

  return (
    <div className="mb-4 rounded-xl border border-cyan-400/30 bg-[#0b1626]/90 px-4 py-3 text-sm text-gray-200">
      <p className="font-medium text-white">Installer MarketPulse</p>
      <p className="mt-1 text-gray-400">
        {event
          ? "Ajoute l'application à l'écran d'accueil pour l'ouvrir hors navigateur."
          : "Sur Chrome : menu ⋮ → Installer l'application. Sur iPhone : Partager → Sur l'écran d'accueil."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {event && (
          <button type="button" className="min-h-11 rounded-lg bg-[var(--accent)] px-4 font-medium" onClick={install}>
            Installer
          </button>
        )}
        <button type="button" className="min-h-11 rounded-lg border border-gray-700 px-4" onClick={dismiss}>
          Plus tard
        </button>
      </div>
    </div>
  );
}
