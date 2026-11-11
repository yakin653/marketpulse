"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import { readCache, saveCache } from "@/lib/db";
import { http } from "@/lib/http";

type Note = { id: string; title: string; body: string; symbol: string | null; read: boolean };

function Inbox() {
  const [items, setItems] = useState<Note[]>([]);

  useEffect(() => {
    http.get<{ items: Note[] }>("/notifications").then(async (res) => {
      setItems(res.data.items);
      await saveCache("notifications", res.data.items);
    }).catch(async () => {
      const cached = await readCache<Note[]>("notifications");
      if (cached) setItems(cached.data);
    });
  }, []);

  async function mark(id: string) {
    await http.post(`/notifications/${id}/read`).catch(() => undefined);
    setItems((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }

  return (
    <div className="max-w-lg mx-auto space-y-3">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <p className="text-sm text-gray-400">Elles restent dans l&apos;application même si le push n&apos;est pas autorisé.</p>
      {items.length === 0 && <p className="text-sm text-gray-400">Aucune notification pour le moment.</p>}
      {items.map((item) => (
        <article key={item.id} className="bg-[var(--surface)] border border-gray-800 rounded-xl p-3">
          <p className="font-medium">{item.title}</p>
          <p className="text-sm text-gray-400">{item.body}</p>
          <div className="flex gap-3 mt-2 text-sm">
            {item.symbol && <Link className="text-[var(--accent)]" href={`/asset/${item.symbol}`}>Voir {item.symbol}</Link>}
            {!item.read && <button type="button" onClick={() => mark(item.id)}>Marquer comme lu</button>}
          </div>
        </article>
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  return <RequireAuth><Inbox /></RequireAuth>;
}
