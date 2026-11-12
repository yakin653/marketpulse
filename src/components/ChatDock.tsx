"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function ChatDock({ symbol }: { symbol: string }) {
  return (
    <Link
      href={`/chat/${encodeURIComponent(symbol)}`}
      data-tour="chat-fab"
      className="fixed bottom-20 right-4 md:bottom-6 z-40 flex items-center gap-2 bg-[var(--accent)] text-white px-4 py-3 rounded-full shadow-lg"
    >
      <MessageCircle size={18} aria-hidden />
      Question sur {symbol}
    </Link>
  );
}
