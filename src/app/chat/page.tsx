"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import SafeMarkdown from "@/components/SafeMarkdown";
import { useAuth } from "@/lib/auth";
import { readCache, saveCache } from "@/lib/db";
import { apiUnreachable, errorText, http } from "@/lib/http";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

type Fiche = { slug: string; title: string };
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  messageId?: string;
  payload?: { used_facts?: unknown; source?: string; intent?: string; mode?: string; fiches?: Fiche[]; sparkline?: number[] };
};

type Conversation = { id: string; title: string };

function suggestions(level: string | undefined, symbol: string) {
  const name = symbol || "AAPL";
  if (level === "debutant") return [`C'est quoi un ETF ?`, `C'est quoi le Pulse Score ?`, `Quel est le cours de ${name} ?`];
  if (level === "expert") return [`Tendance et MM20 de ${name}`, `Compare ${name} et MSFT`, `Le modèle bat-il la baseline ?`];
  return [`Quel est le cours de ${name} ?`, `C'est quoi le ratio de Sharpe ?`, `Compare ${name} et MSFT`];
}

function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${28 - ((value - min) / span) * 24}`).join(" ");
  return <svg viewBox="0 0 100 32" className="w-28 h-8" aria-hidden><polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} /></svg>;
}

function Typed({ text }: { text: string }) {
  const [shown, setShown] = useState(text);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let index = 0;
    const timer = window.setInterval(() => {
      index += 4;
      setShown(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, 16);
    return () => window.clearInterval(timer);
  }, [text]);
  return <SafeMarkdown text={shown} />;
}

function ChatScreen() {
  const params = useSearchParams();
  const symbol = (params.get("symbol") || "").toUpperCase();
  const { user } = useAuth();
  const online = useOnlineStatus();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [query, setQuery] = useState("");
  const [latest, setLatest] = useState("");

  useEffect(() => {
    if (!online) {
      readCache<ChatMessage[]>("chat-history").then((cached) => { if (cached) setMessages(cached.data); }).catch(() => undefined);
      return;
    }
    http.get<{ conversations: Conversation[] }>("/chat/conversations").then((res) => setConversations(res.data.conversations)).catch(() => undefined);
  }, [online, conversationId]);

  async function send(message: string) {
    if (!online) {
      setError("Hors ligne : lecture seule. L'envoi reprendra avec le réseau.");
      return;
    }
    const next = [...messages, { role: "user" as const, content: message }];
    setMessages(next);
    setLoading(true);
    setError(null);
    try {
      const res = await http.post("/chat", { message, symbol: symbol || null, conversation_id: conversationId, pulse: [] }, { timeout: 70000 });
      setConversationId(res.data.conversation_id);
      setLatest(res.data.answer);
      const assistant: ChatMessage = {
        role: "assistant",
        content: res.data.answer,
        messageId: res.data.message_id,
        payload: res.data,
      };
      const saved = [...next, assistant];
      setMessages(saved);
      await saveCache("chat-history", saved);
    } catch (err) {
      setError(
        apiUnreachable(err)
          ? "L'API MarketPulse n'est pas joignable, et le chat en a besoin. Sur la démo publique, elle n'est pas hébergée ; en local, vérifie que Docker tourne."
          : errorText(err, "Le chat n'a pas répondu."),
      );
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const message = text.trim();
    if (!message || loading) return;
    setText("");
    void send(message);
  }

  async function openConversation(id: string) {
    const res = await http.get<{ messages: ChatMessage[] }>(`/chat/${id}`);
    setConversationId(id);
    setMessages(res.data.messages);
    setLatest("");
  }

  async function vote(messageId: string | undefined, voteValue: "up" | "down") {
    if (!messageId) return;
    await http.post("/chat/feedback", { message_id: messageId, vote: voteValue }).catch(() => undefined);
  }

  const visible = conversations.filter((item) => item.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto grid md:grid-cols-[220px_1fr] gap-4">
      <aside className="space-y-2">
        <button type="button" className="min-h-11 w-full rounded-lg bg-[var(--accent)]" onClick={() => { setConversationId(null); setMessages([]); }}>Nouvelle</button>
        <input aria-label="Chercher une conversation" className="w-full min-h-11 rounded-lg bg-[#0B0E11] border border-gray-700 px-3" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Chercher" />
        <ul className="space-y-1 max-h-64 overflow-y-auto">
          {visible.map((item) => (
            <li key={item.id} className="flex gap-1">
              <button type="button" className="min-h-11 flex-1 text-left text-sm truncate px-2" onClick={() => openConversation(item.id)}>{item.title}</button>
              <button type="button" className="min-h-11 text-xs text-gray-400" onClick={() => {
                const title = window.prompt("Nouveau titre", item.title);
                if (title) http.patch(`/chat/conversations/${item.id}`, { title }).then(() => setConversations((current) => current.map((row) => row.id === item.id ? { ...row, title } : row)));
              }}>Renommer</button>
              <button type="button" className="min-h-11 text-xs text-red-300" onClick={() => http.delete(`/chat/conversations/${item.id}`).then(() => setConversations((current) => current.filter((row) => row.id !== item.id)))}>Suppr.</button>
            </li>
          ))}
        </ul>
      </aside>
      <section>
        <h1 className="text-2xl font-bold mb-1">Chat</h1>
        <p className="text-xs text-gray-500 mb-3">Informations pédagogiques. Les chiffres viennent des faits calculés ou d&apos;une fiche.</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions(user?.profile?.level, symbol).map((item) => (
            <button key={item} type="button" className="min-h-11 text-sm border border-gray-700 rounded-full px-3" onClick={() => send(item)}>{item}</button>
          ))}
        </div>
        <div className="space-y-3 mb-4" aria-live="polite">
          {messages.length === 0 && <p className="text-sm text-gray-400">Pose une question sur un cours, une notion ou la méthode. Hors de ce cadre, le chat le dira.</p>}
          {messages.map((message, index) => (
            <article key={`${message.role}-${index}`} className="rounded-xl border border-gray-800 bg-[var(--surface)] p-3">
              <p className="text-xs text-gray-500 mb-1">{message.role === "user" ? "Toi" : "MarketPulse"}</p>
              {message.role === "assistant" && message.content === latest ? <Typed text={message.content} /> : <SafeMarkdown text={message.content} />}
              {message.payload?.intent === "comparaison" && <p className="text-xs mt-2"><Link className="underline" href="/compare">Ouvrir le comparateur</Link></p>}
              {message.payload?.sparkline && <div className="text-[var(--accent)] mt-2"><Spark values={message.payload.sparkline} /></div>}
              {message.payload?.fiches && message.payload.fiches.length > 0 && (
                <p className="text-xs mt-2 flex flex-wrap gap-2">
                  {message.payload.fiches.map((fiche) => <Link key={fiche.slug} className="underline" href={`/academy/${fiche.slug}`}>Fiche : {fiche.title}</Link>)}
                </p>
              )}
              {message.role === "assistant" && (
                <div className="flex gap-2 mt-2">
                  <button type="button" className="min-h-11 text-xs" onClick={() => navigator.clipboard.writeText(message.content)}>Copier</button>
                  <button type="button" className="min-h-11 text-xs" onClick={() => vote(message.messageId, "up")}>Utile</button>
                  <button type="button" className="min-h-11 text-xs" onClick={() => vote(message.messageId, "down")}>Pas utile</button>
                  <button type="button" className="min-h-11 text-xs" onClick={() => send(messages[index - 1]?.content || "")}>Régénérer</button>
                </div>
              )}
            </article>
          ))}
        </div>
        {error && <p className="text-sm text-red-300 mb-2" role="alert">{error}</p>}
        <form onSubmit={onSubmit} className="flex gap-2">
          <label className="flex-1">
            <span className="sr-only">Message</span>
            <input className="w-full min-h-11 rounded-lg bg-[#0B0E11] border border-gray-700 px-3" value={text} onChange={(event) => setText(event.target.value)} disabled={!online || loading} placeholder={online ? "Une question" : "Hors ligne"} />
          </label>
          <button type="submit" className="min-h-11 px-4 rounded-lg bg-[var(--accent)] disabled:opacity-50" disabled={!online || loading}>{loading ? "…" : "Envoyer"}</button>
        </form>
      </section>
    </div>
  );
}

export default function ChatPage() {
  return <RequireAuth><Suspense fallback={<p className="text-sm text-gray-400">Chargement…</p>}><ChatScreen /></Suspense></RequireAuth>;
}
