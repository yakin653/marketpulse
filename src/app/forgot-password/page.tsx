"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import AuthFrame from "@/components/AuthFrame";
import { markEntered, useAuth } from "@/lib/auth";
import { saveCache } from "@/lib/db";
import { errorText, http } from "@/lib/http";

type MailMode = "smtp" | "local" | "logs";

const WHERE: Record<MailMode, string> = {
  smtp: "Regarde ta boîte de réception, et le dossier Spam.",
  local: "Mode local : le message arrive dans la boîte de test Mailpit (http://localhost:8025), pas dans ta vraie boîte mail.",
  logs: "Aucun serveur d'e-mail n'est configuré : en développement, le code est écrit dans les journaux de l'API.",
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mail, setMail] = useState<MailMode>("smtp");

  // L'API dit où part le message : vraie boîte, boîte de test locale, ou journal.
  useEffect(() => {
    http.get<{ mail?: MailMode }>("/auth/providers").then((res) => setMail(res.data.mail ?? "smtp")).catch(() => setMail("smtp"));
  }, []);

  async function sendCode() {
    const res = await http.post<{ detail: string }>("/auth/forgot-password", { email });
    setMessage(res.data.detail);
    setStep("code");
  }

  async function onSend(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendCode();
    } catch (err) {
      setError(errorText(err, "Envoi impossible."));
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setLoading(true);
    setError(null);
    setCode("");
    try {
      await sendCode();
    } catch (err) {
      setError(errorText(err, "Envoi impossible."));
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await http.post("/auth/verify-code", { email, code });
      await saveCache("auth-me", res.data);
      setUser(res.data);
      markEntered();
      router.push(res.data.onboarding_completed ? "/dashboard" : "/onboarding");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setError("Trop de tentatives. Demande un nouveau code.");
      } else if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Code invalide ou expiré.");
      } else {
        setError(errorText(err, "Vérification impossible."));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame title="Mot de passe oublié">
      {step === "email" ? (
        <form onSubmit={onSend} className="space-y-4">
          <p className="text-sm text-gray-400">On t&apos;envoie un code à 6 chiffres. La réponse est la même, que l&apos;adresse existe ou non.</p>
          <label className="block text-sm text-gray-200">E-mail
            <input className="mt-1.5 w-full min-h-12 rounded-lg border border-cyan-300/80 bg-[#071018]/80 px-3 text-sm text-white outline-none" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
          <button type="submit" className="w-full min-h-12 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 font-semibold disabled:opacity-60" disabled={loading}>{loading ? "Envoi…" : "Recevoir un code"}</button>
          <Link href="/login" className="inline-flex min-h-11 items-center text-sm text-cyan-300">Retour à la connexion</Link>
        </form>
      ) : (
        <form onSubmit={onVerify} className="space-y-4">
          <p className="text-sm text-gray-400">Code envoyé à <span className="text-gray-200">{email}</span> (valable 10 minutes, 5 essais). {WHERE[mail]}</p>
          {message && <p className="text-sm text-emerald-300" role="status">{message}</p>}
          <label className="block text-sm text-gray-200">Code à 6 chiffres
            <input className="mt-1.5 w-full min-h-12 rounded-lg border border-cyan-300/80 bg-[#071018]/80 px-3 text-center text-lg tracking-[0.4em] text-white outline-none" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} required />
          </label>
          {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
          <button type="submit" className="w-full min-h-12 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 font-semibold disabled:opacity-60" disabled={loading || code.length !== 6}>{loading ? "Vérification…" : "Me connecter avec ce code"}</button>
          <div className="flex items-center justify-between">
            <button type="button" onClick={onResend} disabled={loading} className="inline-flex min-h-11 items-center text-sm text-cyan-300 disabled:opacity-60">Renvoyer un code</button>
            <button type="button" onClick={() => { setStep("email"); setError(null); }} className="inline-flex min-h-11 items-center text-sm text-gray-400">Changer d&apos;e-mail</button>
          </div>
          <Link href="/login" className="inline-flex min-h-11 items-center text-sm text-cyan-300">Retour à la connexion</Link>
        </form>
      )}
    </AuthFrame>
  );
}
