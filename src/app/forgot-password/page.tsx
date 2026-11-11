"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import axios from "axios";
import AuthFrame from "@/components/AuthFrame";
import { errorText, http } from "@/lib/http";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await http.post<{ detail: string }>("/auth/forgot-password", { email });
      setMessage(res.data.detail);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setError("Trop de tentatives. Réessaie dans une minute.");
      } else {
        setError(errorText(err, "Envoi impossible."));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame title="Mot de passe oublié">
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm text-gray-400">La réponse est la même, que l&apos;adresse existe ou non.</p>
        <label className="block text-sm text-gray-200">E-mail
          <input className="mt-1.5 w-full min-h-12 rounded-lg border border-cyan-300/80 bg-[#071018]/80 px-3 text-sm text-white outline-none" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        {message && <p className="text-sm text-emerald-300" role="status">{message}</p>}
        {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
        <button className="w-full min-h-12 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 font-semibold disabled:opacity-60" disabled={loading}>{loading ? "Envoi…" : "Recevoir un lien"}</button>
        <Link href="/login" className="inline-flex min-h-11 items-center text-sm text-cyan-300">Retour à la connexion</Link>
      </form>
    </AuthFrame>
  );
}
