"use client";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div className="bg-amber-500/15 text-amber-300 text-sm text-center py-2 px-4">
      Mode hors ligne : affichage des dernières données enregistrées
    </div>
  );
}