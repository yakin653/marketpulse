"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { clearSessionData, readCache, saveCache } from "./db";
import { http } from "./http";

export type Profile = {
  level: "debutant" | "intermediaire" | "expert";
  horizon: "court" | "moyen" | "long";
  risk_tolerance: "prudent" | "equilibre" | "dynamique";
  goals: string[];
  sectors: string[];
  favorite_symbols: string[];
  news_keywords: string[];
  language: string;
  notif_prefs: { frequence: "instantane" | "quotidien"; heure: number; quiet_start: number; quiet_end: number };
  onboarding_completed: boolean;
};

export type Account = {
  id: string;
  email: string;
  display_name: string;
  onboarding_completed: boolean;
  profile: Profile | null;
};

type AuthValue = {
  user: Account | null;
  ready: boolean;
  refresh: () => Promise<Account | null>;
  setUser: (user: Account | null) => void;
  logout: () => Promise<void>;
  enterDemo: () => Promise<Account>;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ENTERED_KEY = "mp-entered";

export function markEntered() {
  sessionStorage.setItem(ENTERED_KEY, "1");
  window.dispatchEvent(new Event("mp-entered"));
}

export function hasEntered() {
  return sessionStorage.getItem(ENTERED_KEY) === "1";
}

export function clearEntered() {
  sessionStorage.removeItem(ENTERED_KEY);
  window.dispatchEvent(new Event("mp-entered"));
}

function freshAccount(cached: { data: Account; savedAt: number } | undefined) {
  if (!cached || Date.now() - cached.savedAt > WEEK_MS) return null;
  return cached.data;
}

const AuthContext = createContext<AuthValue>({
  user: null,
  ready: false,
  refresh: async () => null,
  setUser: () => undefined,
  logout: async () => undefined,
  enterDemo: async () => {
    throw new Error("AuthProvider manquant");
  },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await http.get<Account>("/auth/me");
      await saveCache("auth-me", res.data);
      setUser(res.data);
      return res.data;
    } catch {
      const cached = await readCache<Account>("auth-me").catch(() => undefined);
      const account = freshAccount(cached);
      if (account) {
        setUser(account);
        return account;
      }
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let alive = true;
    http.get<Account>("/auth/me").then(async (res) => {
      if (!alive) return;
      await saveCache("auth-me", res.data);
      setUser(res.data);
      setReady(true);
    }).catch(async () => {
      const cached = await readCache<Account>("auth-me").catch(() => undefined);
      if (!alive) return;
      const account = freshAccount(cached);
      if (account) setUser(account);
      else setUser(null);
      setReady(true);
    });
    return () => { alive = false; };
  }, []);

  const enterDemo = useCallback(async () => {
    const demo: Account = {
      id: "demo-local",
      email: "demo@marketpulse.local",
      display_name: "Démo",
      onboarding_completed: true,
      profile: {
        level: "debutant",
        horizon: "moyen",
        risk_tolerance: "equilibre",
        goals: ["Comprendre"],
        sectors: [],
        favorite_symbols: ["AAPL", "MSFT"],
        news_keywords: [],
        language: "fr",
        notif_prefs: { frequence: "quotidien", heure: 8, quiet_start: 22, quiet_end: 7 },
        onboarding_completed: true,
      },
    };
    await saveCache("auth-me", demo);
    setUser(demo);
    markEntered();
    return demo;
  }, []);

  const logout = useCallback(async () => {
    await http.post("/auth/logout").catch(() => undefined);
    await clearSessionData().catch(() => undefined);
    if (typeof caches !== "undefined") {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
    }
    clearEntered();
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, ready, refresh, setUser, logout, enterDemo }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
