"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react";
import AuthFrame from "@/components/AuthFrame";
import { markEntered, useAuth } from "@/lib/auth";
import { saveCache } from "@/lib/db";
import { errorText, http } from "@/lib/http";

type Mode = "login" | "signup";

function strength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  return score;
}

const labels = ["Trop court", "Faible", "Moyen", "Correct", "Solide"];
const field = "w-full min-h-12 rounded-lg border border-cyan-300/80 bg-[#071018]/80 pl-11 text-sm text-white shadow-[0_0_16px_rgba(34,211,238,0.16)] outline-none placeholder:text-gray-500 focus:border-cyan-200";

export default function AuthGate({ initialMode }: { initialMode: Mode }) {
  const router = useRouter();
  const { ready, setUser, enterDemo } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [google, setGoogle] = useState(false);
  const score = strength(password);

  useEffect(() => {
    http.get<{ google: boolean }>("/auth/providers").then((res) => setGoogle(res.data.google)).catch(() => setGoogle(false));
  }, []);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setShow(false);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!email.includes("@")) {
      setError("Saisis une adresse e-mail.");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await http.post("/auth/login", { email, password, remember });
        await saveCache("auth-me", res.data);
        setUser(res.data);
        markEntered();
        router.push(res.data.onboarding_completed ? "/dashboard" : "/onboarding");
      } else {
        const res = await http.post("/auth/register", { email, password, display_name: displayName });
        await saveCache("auth-me", res.data);
        setUser(res.data);
        markEntered();
        router.push("/onboarding");
      }
    } catch (err) {
      if (mode === "login" && axios.isAxiosError(err) && err.response?.status === 429) {
        setError("Trop de tentatives. Réessaie dans une minute.");
      } else if (mode === "login" && axios.isAxiosError(err) && err.response?.status === 401) {
        setError("E-mail ou mot de passe incorrect.");
      } else {
        setError(errorText(err, mode === "login" ? "Connexion impossible." : "Inscription impossible."));
      }
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return <div className="min-h-screen bg-[#07111d]" />;
  }

  const login = mode === "login";

  return (
    <AuthFrame>
      <p className="text-center text-2xl font-bold tracking-[0.18em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-200">MARKETPULSE</p>
      <h1 className="mt-4 text-center text-[1.7rem] font-semibold leading-tight text-white">
        {login ? "Connexion à MarketPulse" : "Créer un compte"}
      </h1>
      <p className="mt-2 mb-6 text-center text-sm text-gray-300">
        {login ? "Bon retour. Accède à ton tableau de bord." : "Un compte suffit pour suivre les cours et les fiches."}
      </p>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {!login && (
          <label className="block text-sm text-gray-200">Nom affiché
            <span className="relative mt-1.5 block">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-200" size={18} aria-hidden />
              <input className={field} value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" required />
            </span>
          </label>
        )}
        <label className="block text-sm text-gray-200">E-mail
          <span className="relative mt-1.5 block">
            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-200" size={18} aria-hidden />
            <input className={field} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </span>
        </label>
        <label className="block text-sm text-gray-200">Mot de passe
          <span className="relative mt-1.5 block">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-200" size={18} aria-hidden />
            <input className={`${field} pr-11`} type={show ? "text" : "password"} autoComplete={login ? "current-password" : "new-password"} minLength={login ? undefined : 8} value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button type="button" className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-cyan-100" aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"} onClick={() => setShow((value) => !value)}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </label>
        {login ? (
          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="inline-flex min-h-11 items-center gap-2 text-gray-300">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              Se souvenir de moi
            </label>
            <Link href="/forgot-password" className="text-cyan-300">Mot de passe oublié ?</Link>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-400" aria-live="polite">Robustesse : {password ? labels[score] : "8 caractères minimum"}</p>
            <div className="mt-2 h-1 rounded-full bg-slate-800" aria-hidden>
              <div className="h-1 rounded-full bg-gradient-to-r from-cyan-300 to-blue-500" style={{ width: `${(score / 4) * 100}%` }} />
            </div>
          </div>
        )}
        {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
        <button className="w-full min-h-12 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 font-semibold text-white shadow-[0_0_24px_rgba(34,211,238,0.35)] disabled:opacity-60" disabled={loading}>
          {loading ? "Patiente…" : login ? "Se connecter" : "Créer le compte"}
        </button>
        {google && (
          <a href="/api/auth/google/start" className="flex min-h-11 w-full items-center justify-center rounded-lg border border-cyan-300/40 text-sm text-cyan-100">Continuer avec Google</a>
        )}
      </form>
      <button
        type="button"
        className="mt-3 flex min-h-11 w-full items-center justify-center rounded-lg border border-cyan-300/30 text-sm text-cyan-100"
        onClick={async () => {
          await enterDemo();
          router.push("/dashboard");
        }}
      >
        Continuer en mode démo
      </button>
      <p className="mt-5 text-center text-sm text-gray-300">
        {login ? "Pas de compte ? " : "Déjà inscrit ? "}
        <button type="button" className="font-medium text-cyan-300" onClick={() => switchMode(login ? "signup" : "login")}>
          {login ? "Créer un compte" : "Se connecter"}
        </button>
      </p>
      <p className="mt-4 text-center text-[11px] text-amber-200/80">Informations pédagogiques, pas un conseil en investissement.</p>
    </AuthFrame>
  );
}
