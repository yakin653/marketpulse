"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

/** Garde côté client : Next 16 a renommé le middleware en proxy, inutile pour un cookie vérifié par l'API. */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready) return <p className="text-gray-400">Chargement de la session…</p>;
  if (!user) return null;
  return children;
}
