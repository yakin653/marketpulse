"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AuthFrame from "@/components/AuthFrame";
import { errorText, http } from "@/lib/http";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await http.post("/auth/reset-password", { token, password });
      setDone(true);
    } catch (err) {
      setError(errorText(err, "Lien invalide ou expiré."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame title="Nouveau mot de passe">
      {done ? (
        <p className="text-center text-sm text-gray-200">Mot de passe mis à jour. <Link className="text-cyan-300" href="/login">Se connecter</Link></p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {!token && <p className="text-sm text-red-300">Lien incomplet. Recommence depuis « Mot de passe oublié ».</p>}
          <label className="block text-sm text-gray-200">Nouveau mot de passe
            <input className="mt-1.5 w-full min-h-12 rounded-lg border border-cyan-300/80 bg-[#071018]/80 px-3 text-sm text-white outline-none" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
          <button type="submit" className="w-full min-h-12 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 font-semibold disabled:opacity-60" disabled={loading || !token}>{loading ? "Enregistrement…" : "Enregistrer"}</button>
        </form>
      )}
    </AuthFrame>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-gray-400">Chargement…</p>}>
      <ResetForm />
    </Suspense>
  );
}
