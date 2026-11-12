"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import { errorText, http } from "@/lib/http";

function urlBase64ToUint8Array(value: string) {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

function ProfileForm() {
  const { user, refresh, logout } = useAuth();
  const router = useRouter();
  const profile = user?.profile;
  const [keywords, setKeywords] = useState(profile?.news_keywords.join(", ") ?? "");
  const [frequence, setFrequence] = useState(profile?.notif_prefs.frequence ?? "instantane");
  const [heure, setHeure] = useState(profile?.notif_prefs.heure ?? 8);
  const [emailOn, setEmailOn] = useState(profile?.notif_prefs.email === true);
  const [mailMode, setMailMode] = useState<"smtp" | "local" | "logs" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pushState, setPushState] = useState<string | null>(null);

  useEffect(() => {
    http.get<{ mail?: "smtp" | "local" | "logs" }>("/auth/providers")
      .then((res) => setMailMode(res.data.mail ?? null))
      .catch(() => setMailMode(null));
  }, []);

  async function save() {
    if (!profile) return;
    try {
      await http.put("/me/profile", {
        ...profile,
        news_keywords: keywords.split(",").map((item) => item.trim()).filter(Boolean),
        notif_prefs: { ...profile.notif_prefs, frequence, heure, email: emailOn },
        onboarding_completed: true,
      });
      await refresh();
      setMessage("Préférences enregistrées.");
    } catch (error) {
      setMessage(errorText(error, "Enregistrement impossible."));
    }
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(user, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "marketpulse-donnees.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function removeAccount() {
    if (!confirm("Supprimer le compte et ses données ?")) return;
    await http.delete("/me");
    await logout();
    router.push("/");
  }

  async function enablePush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushState("Ce navigateur ne propose pas les notifications push.");
      return;
    }
    const key = await http.get<{ public_key: string | null }>("/push/public-key");
    if (!key.data.public_key) {
      setPushState("Clés VAPID absentes. Les notifications dans l'application restent actives.");
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key.data.public_key),
    });
    const json = subscription.toJSON();
    await http.post("/push/subscribe", { endpoint: subscription.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth });
    setPushState("Notifications push activées.");
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Profil</h1>
      <p className="text-sm text-gray-400">{user?.display_name} · {user?.email}</p>
      <p className="text-sm text-gray-300">Niveau {profile?.level}, horizon {profile?.horizon}, tolérance {profile?.risk_tolerance}.</p>
      <label className="block text-sm">Mots-clés de news
        <input className="mt-1 w-full bg-[#0B0E11] border border-gray-700 rounded-lg px-3 py-2" value={keywords} onChange={(event) => setKeywords(event.target.value)} />
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={() => setFrequence("instantane")} className={`px-3 py-2 rounded-lg border ${frequence === "instantane" ? "border-[var(--accent)]" : "border-gray-700"}`}>Instantané</button>
        <button type="button" onClick={() => setFrequence("quotidien")} className={`px-3 py-2 rounded-lg border ${frequence === "quotidien" ? "border-[var(--accent)]" : "border-gray-700"}`}>Résumé</button>
      </div>
      <label className="block text-sm">Heure du résumé
        <input className="mt-1 w-24 bg-[#0B0E11] border border-gray-700 rounded-lg px-3 py-2" type="number" min={0} max={23} value={heure} onChange={(event) => setHeure(Number(event.target.value))} />
      </label>
      <label className="flex items-start gap-3 text-sm min-h-11">
        <input type="checkbox" className="mt-1 h-5 w-5" checked={emailOn} onChange={(event) => setEmailOn(event.target.checked)} />
        <span>
          Recevoir aussi mes notifications par e-mail
          <span className="block text-xs text-gray-400">
            Envoyées à {user?.email}, même quand tu es déconnecté. 10 e-mails par jour au plus.
            {mailMode === "logs" && " Attention : le serveur n'a pas d'envoi d'e-mails configuré, rien ne partira."}
            {mailMode === "local" && " Ici l'envoi va dans la boîte de test locale (Mailpit), pas dans ta vraie boîte."}
          </span>
        </span>
      </label>
      {message && <p className="text-sm text-gray-300">{message}</p>}
      <button type="button" className="px-4 py-2 bg-[var(--accent)] rounded-lg" onClick={save}>Enregistrer</button>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="px-4 py-2 border border-gray-700 rounded-lg" onClick={exportData}>Exporter mes données</button>
        <button type="button" className="px-4 py-2 border border-gray-700 rounded-lg" onClick={enablePush}>Activer le push</button>
        <button type="button" className="px-4 py-2 border border-gray-700 rounded-lg" onClick={async () => {
          const res = await http.post<{ detail: string }>("/push/test").catch(() => null);
          setPushState(res?.data.detail || "Le test n'a pas abouti.");
        }}>Envoyer une notification de test</button>
        <button type="button" className="px-4 py-2 border border-red-800 text-red-300 rounded-lg" onClick={removeAccount}>Supprimer le compte</button>
      </div>
      {pushState && <p className="text-sm text-gray-400">{pushState}</p>}
      <p className="text-xs text-gray-500">Le push se teste avec npm run build puis npm start. Sur iOS, l&apos;app doit être installée sur l&apos;écran d&apos;accueil.</p>
    </div>
  );
}

export default function ProfilePage() {
  return <RequireAuth><ProfileForm /></RequireAuth>;
}
