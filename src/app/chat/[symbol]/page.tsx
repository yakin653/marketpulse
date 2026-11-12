"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Loader2, Send, MessageSquare, AlertCircle } from "lucide-react";
import type { ChatLevel } from "@/lib/chatApi";
import mockData from "@/mock/data.json";

const LEVELS: { id: ChatLevel; label: string }[] = [
  { id: "debutant", label: "Débutant" },
  { id: "standard", label: "Standard" },
  { id: "expert", label: "Expert" },
];

function suggestionsFor(symbol: string): string[] {
  return [
    `Qu'est-ce que ${symbol} en termes simples ?`,
    `Quels sont les risques principaux de ${symbol} ?`,
    `Comment lire le Pulse Score de ${symbol} ?`,
    `Donne 3 points clés avant d'investir dans ${symbol}.`,
  ];
}

function messageText(message: {
  parts?: Array<{ type: string; text?: string }>;
}): string {
  if (!message.parts?.length) return "";
  return message.parts
    .filter((p) => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text as string)
    .join("");
}

export default function ChatSymbolPage() {
  const params = useParams<{ symbol: string }>();
  const symbol = (params?.symbol || "AAPL").toString().toUpperCase();

  const availableSymbols = useMemo(() => {
    const fromMock = Array.isArray(mockData.assets) ? mockData.assets : [];
    return fromMock.length > 0 ? fromMock : [symbol];
  }, [symbol]);

  const [level, setLevel] = useState<ChatLevel>("standard");
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        // Route Next dédiée Gemini — évite d'écraser le rewrite FastAPI /api/chat
        api: "/api/ai-chat",
        fetch: async (input, init) => {
          const res = await fetch(input, init);
          if (!res.ok) {
            let detail = `Erreur HTTP ${res.status}`;
            try {
              const data = (await res.clone().json()) as { error?: string };
              if (data?.error) detail = data.error;
            } catch {
              /* ignore */
            }
            throw new Error(detail);
          }
          return res;
        },
      }),
    []
  );

  const { messages, sendMessage, status, error, clearError } = useChat({
    transport,
  });

  const busy = status === "submitted" || status === "streaming";

  async function submitText(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    clearError();
    setInput("");
    await sendMessage(
      { text: q },
      {
        body: { symbol, level },
      }
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void submitText(input);
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4 pb-8 min-h-[70vh]">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="text-[var(--accent)]" size={24} />
            Chat IA — {symbol}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Vercel AI SDK + Gemini · données via FastAPI
          </p>
        </div>

        <label className="text-sm text-gray-400 flex flex-col gap-1">
          Actif
          <select
            value={symbol}
            onChange={(e) => {
              window.location.href = `/chat/${e.target.value}`;
            }}
            className="rounded-lg bg-[#161A1E] border border-gray-800 px-3 py-2 text-white"
          >
            {availableSymbols.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="flex flex-wrap gap-2" data-tour="chat-suggestions">
        {LEVELS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLevel(item.id)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              level === item.id
                ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                : "border-gray-700 text-gray-300 hover:border-gray-500"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg px-3 py-2 text-sm bg-amber-500/10 border border-amber-500/30 text-amber-100 flex gap-2">
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
        <span>
          Les réponses viennent de Gemini (clé serveur GOOGLE_GENERATIVE_AI_API_KEY,
          gratuite via Google AI Studio). Aucune réponse n&apos;est inventée si la
          clé manque ou si l&apos;API échoue. Hors ligne : le chat IA ne peut pas
          générer de réponse.
        </span>
      </div>

      <div className="flex-1 rounded-xl border border-gray-800 bg-[#161A1E] p-4 space-y-3 min-h-[320px] max-h-[50vh] overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-gray-500">
            Posez une question sur {symbol}. Niveau actuel : {level}.
          </p>
        )}

        {messages.map((m) => {
          const text = messageText(m);
          if (!text) return null;
          return (
            <div
              key={m.id}
              className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[var(--accent)]/20 border border-[var(--accent)]/30 ml-6"
                  : "bg-black/30 border border-gray-700 mr-6"
              }`}
            >
              {text}
            </div>
          );
        })}

        {busy && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 className="animate-spin" size={16} />
            Génération Gemini en cours…
          </div>
        )}

        {error && (
          <div
            className="rounded-lg px-3 py-2 text-sm bg-red-500/10 border border-red-500/40 text-red-200 flex gap-2"
            role="alert"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>Erreur : {error.message}</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">Questions suggérées</p>
        <div className="flex flex-wrap gap-2">
          {suggestionsFor(symbol).map((s) => (
            <button
              key={s}
              type="button"
              disabled={busy}
              onClick={() => void submitText(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-300 hover:border-[var(--accent)] disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Posez une question sur ${symbol}…`}
          disabled={busy}
          className="flex-1 rounded-lg bg-[#161A1E] border border-gray-800 px-3 py-3 text-white disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-lg bg-[var(--accent)] hover:bg-blue-600 disabled:opacity-50 px-4 py-3 text-white font-medium flex items-center justify-center gap-2"
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          Envoyer
        </button>
      </form>

      <p className="text-xs text-gray-500">
        Endpoint UI : <code>/api/ai-chat</code> (AI SDK + Gemini). Données :
        FastAPI <code>/assets/{"{symbol}"}</code>.{" "}
        <Link href="/chat" className="text-[var(--accent)] hover:underline">
          Chat conversations
        </Link>
        {" · "}
        <Link href="/watchlist" className="text-[var(--accent)] hover:underline">
          Watchlist
        </Link>
      </p>
    </div>
  );
}
