"use client";

import Link from "next/link";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OfflinePage() {
  const online = useOnlineStatus();

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 gap-4">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">MarketPulse</p>
      <h1 className="text-2xl font-semibold">Mode hors ligne</h1>
      <p className="text-gray-400 max-w-md">
        {online
          ? "La connexion est de retour. Tu peux revenir dans l'application."
          : "Cette page a été préparée pour le mode hors ligne. Les pages déjà ouvertes et la watchlist restent disponibles dans le navigateur."}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="min-h-11 inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-5 font-medium">
          Retour à l&apos;accueil
        </Link>
        <Link href="/watchlist" className="min-h-11 inline-flex items-center justify-center rounded-lg border border-gray-700 px-5">
          Ouvrir la watchlist
        </Link>
      </div>
    </main>
  );
}
