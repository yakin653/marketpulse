"use client";

// Ancienne barre. L'écran connecté passe par AppShell ; ce fichier garde les mêmes liens.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, LayoutDashboard, LineChart, MessageCircle, Star, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { http } from "@/lib/http";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/markets", label: "Marchés", icon: LineChart },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/learn", label: "Méthode", icon: BookOpen },
  { href: "/notifications", label: "Alertes", icon: Bell },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    http.get<{ unread: number }>("/notifications").then((res) => setUnread(res.data.unread)).catch(() => setUnread(0));
  }, [user]);

  return (
    <nav className="fixed bottom-0 w-full bg-[var(--surface)] border-t border-gray-800 md:static md:w-64 md:h-screen md:border-r md:border-t-0 flex md:flex-col justify-around md:justify-start p-2 md:p-4 z-50">
      <div className="hidden md:block mb-8 px-4">
        <h1 className="text-xl font-bold text-[var(--text)]">MarketPulse</h1>
        <p className="text-xs text-gray-500 mt-1">Lecture de marché, pas un ordre.</p>
        <div className="flex gap-3 mt-4 text-sm">
          <Link href="/notifications" className="relative text-gray-300">
            <Bell size={18} aria-label="Notifications" />
            {unread > 0 && <span className="absolute -top-2 -right-2 text-[10px] bg-red-500 text-white rounded-full px-1">{unread}</span>}
          </Link>
          <Link href={user ? "/profile" : "/login"} className="text-gray-300 flex items-center gap-1">
            <UserRound size={18} aria-hidden /> {user ? "Profil" : "Connexion"}
          </Link>
        </div>
      </div>

      <div className="flex w-full md:flex-col justify-around md:justify-start gap-1 md:gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg transition-colors ${
                isActive
                  ? "text-[var(--accent)] bg-gray-800/50"
                  : "text-gray-400 hover:text-[var(--text)] hover:bg-gray-800/30"
              }`}
            >
              <Icon size={20} aria-hidden />
              <span className="text-xs md:text-sm font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
