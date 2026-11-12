"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  Bell,
  BookOpen,
  LayoutDashboard,
  LineChart,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Star,
  UserRound,
} from "lucide-react";
import AuthGate from "@/components/AuthGate";
import Disclaimer from "@/components/Disclaimer";
import InstallPrompt from "@/components/InstallPrompt";
import OfflineBanner from "@/components/OfflineBanner";
import SearchBar from "@/components/SearchBar";
import { hasEntered, useAuth } from "@/lib/auth";
import { http } from "@/lib/http";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useToast } from "@/components/Toast";
import { useTour } from "@/components/tour/TourProvider";

const BARE = new Set(["/", "/login", "/register", "/forgot-password", "/reset-password"]);

const pages = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/markets", label: "Marchés", icon: LineChart },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/learn", label: "Méthode", icon: BookOpen },
  { href: "/compare", label: "Comparer", icon: LineChart },
  { href: "/academy", label: "Académie", icon: BookOpen },
  { href: "/alerts", label: "Alertes", icon: Bell },
  { href: "/notifications", label: "Notifs", icon: Bell },
  { href: "/profile", label: "Profil", icon: UserRound },
];

const mobile = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/markets", label: "Marchés", icon: LineChart },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/alerts", label: "Alertes", icon: Bell },
];

function active(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (BARE.has(pathname)) return <div className="fixed inset-0 z-40 overflow-y-auto bg-[#07111d]">{children}</div>;
  return <Guarded pathname={pathname}>{children}</Guarded>;
}

function subscribeEntered(onStoreChange: () => void) {
  window.addEventListener("mp-entered", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("mp-entered", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function Guarded({ pathname, children }: { pathname: string; children: ReactNode }) {
  const { user, ready } = useAuth();
  const entered = useSyncExternalStore(subscribeEntered, hasEntered, () => false);

  if (!ready) return <div className="fixed inset-0 bg-[#07111d]" />;
  if (!user || !entered) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07111d]">
        <AuthGate initialMode="login" />
      </div>
    );
  }
  return <Chrome pathname={pathname}>{children}</Chrome>;
}

function Chrome({ pathname, children }: { pathname: string; children: ReactNode }) {
  const { user, logout } = useAuth();
  const online = useOnlineStatus();
  const router = useRouter();
  const { push } = useToast();
  const { startTour } = useTour();
  const [open, setOpen] = useState(true);
  const [more, setMore] = useState(false);
  const [palette, setPalette] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [unread, setUnread] = useState(0);
  const [fresh, setFresh] = useState("fraîcheur inconnue");

  useEffect(() => {
    if (!user) return;
    http.get<{ unread: number }>("/notifications").then((res) => setUnread(res.data.unread)).catch(() => setUnread(0));
    http.get<{ label?: string }>("/meta/freshness").then((res) => {
      if (res.data.label) setFresh(res.data.label);
    }).catch(() => setFresh("fraîcheur inconnue"));
  }, [user, pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette(true);
      }
      if (event.key === "Escape") {
        setPalette(false);
        setMore(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hits = useMemo(
    () => pages.filter((page) => page.label.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  );

  async function openAsset() {
    const text = query.trim();
    if (!text) return;
    try {
      const res = await http.post<{ symbol?: string }>(`/assets/add/${encodeURIComponent(text)}`);
      if (res.data.symbol) {
        setPalette(false);
        router.push(`/asset/${res.data.symbol}`);
      }
    } catch {
      push("Aucune série réelle pour cette recherche.", "err");
    }
  }

  async function signOut() {
    await logout();
    push("Session fermée sur cet appareil.");
    router.push("/");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {user && (
        <aside className={`hidden md:flex flex-col border-r border-gray-800 bg-[var(--surface)] ${open ? "w-64" : "w-16"} shrink-0`}>
          <div className="flex items-center justify-between p-3">
            {open && <span className="font-bold px-2">MarketPulse</span>}
            <button type="button" className="min-h-11 min-w-11" aria-expanded={open} aria-label={open ? "Réduire le menu" : "Ouvrir le menu"} onClick={() => setOpen((value) => !value)}>
              <Menu size={18} />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-2" data-tour="nav-main">
            {pages.map((page) => {
              const Icon = page.icon;
              return (
                <Link key={page.href} href={page.href} className={`min-h-11 flex items-center gap-3 rounded-lg px-3 ${active(pathname, page.href) ? "bg-gray-800 text-[var(--accent)]" : "text-gray-300"}`}>
                  <Icon size={18} aria-hidden />
                  {open && <span className="text-sm">{page.label}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-gray-800 px-4 py-3 flex items-center gap-3">
          {!user && <Link href="/" className="font-bold shrink-0">MarketPulse</Link>}
          <div className="flex-1 min-w-0" data-tour="global-search">
            <SearchBar compact />
          </div>
          <p className="hidden lg:block text-xs text-gray-400 shrink-0">{online ? fresh : "hors ligne"}</p>
          <span data-tour="online-indicator" className={`text-xs shrink-0 ${online ? "text-emerald-300" : "text-amber-200"}`}>{online ? "en ligne" : "hors ligne"}</span>
          {user ? (
            <>
              <Link href="/notifications" data-tour="notif-bell" className="relative min-h-11 min-w-11 inline-flex items-center justify-center" aria-label="Notifications">
                <Bell size={18} />
                {unread > 0 && <span className="absolute top-1 right-1 text-[10px] bg-red-500 text-white rounded-full px-1">{unread}</span>}
              </Link>
              <div className="relative" data-tour="help-menu">
                <button type="button" className="min-h-11 text-sm text-gray-300" aria-expanded={helpOpen} onClick={() => setHelpOpen((v) => !v)}>Aide</button>
                {helpOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-gray-700 bg-[#161A1E] p-2 shadow-lg">
                    <button type="button" className="min-h-11 w-full rounded-lg px-3 text-left text-sm hover:bg-gray-800" onClick={() => { setHelpOpen(false); startTour(); }}>Lancer la visite guidée</button>
                    <Link href="/learn" className="min-h-11 flex items-center rounded-lg px-3 text-sm hover:bg-gray-800" onClick={() => setHelpOpen(false)}>Page Méthode</Link>
                  </div>
                )}
              </div>
              <button type="button" className="min-h-11 text-sm" onClick={() => { startTour(); }}>Visite</button>
              <button type="button" className="min-h-11 text-sm" onClick={signOut}>Quitter</button>
            </>
          ) : (
            <Link href="/login" className="min-h-11 inline-flex items-center text-sm">Connexion</Link>
          )}
          <button type="button" className="hidden md:inline-flex min-h-11 text-xs text-gray-400" onClick={() => setPalette(true)}>Ctrl+K</button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 safe-bottom">
          <OfflineBanner />
          <InstallPrompt />
          <Disclaimer />
          {children}
        </main>
      </div>
      {user && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--surface)] border-t border-gray-800 flex justify-around" data-tour="nav-main">
          {mobile.map((page) => {
            const Icon = page.icon;
            return (
              <Link key={page.href} href={page.href} className={`min-h-11 flex-1 flex flex-col items-center justify-center text-[10px] ${active(pathname, page.href) ? "text-[var(--accent)]" : "text-gray-400"}`}>
                <Icon size={18} aria-hidden />
                {page.label}
              </Link>
            );
          })}
          <button type="button" className="min-h-11 flex-1 flex flex-col items-center justify-center text-[10px] text-gray-400" onClick={() => setMore(true)}>
            <MoreHorizontal size={18} aria-hidden />
            Plus
          </button>
        </nav>
      )}
      {more && (
        <div className="md:hidden fixed inset-0 z-50">
          <button type="button" aria-label="Fermer le menu" className="absolute inset-0 h-full w-full cursor-default bg-black/60" onClick={() => setMore(false)} />
          <div className="absolute bottom-0 inset-x-0 bg-[var(--surface)] rounded-t-2xl p-4 space-y-2">
            <Link className="min-h-11 flex items-center" href="/watchlist" onClick={() => setMore(false)}>Watchlist</Link>
            <Link className="min-h-11 flex items-center" href="/alerts" onClick={() => setMore(false)}>Alertes</Link>
            <Link className="min-h-11 flex items-center" href="/notifications" onClick={() => setMore(false)}>Notifications</Link>
            <Link className="min-h-11 flex items-center" href="/learn" onClick={() => setMore(false)}>Méthode</Link>
            <Link className="min-h-11 flex items-center" href="/compare" onClick={() => setMore(false)}>Comparer</Link>
            <Link className="min-h-11 flex items-center" href="/academy" onClick={() => setMore(false)}>Académie</Link>
            <Link className="min-h-11 flex items-center" href="/status" onClick={() => setMore(false)}>État</Link>
            <Link className="min-h-11 flex items-center" href="/profile" onClick={() => setMore(false)}>Profil</Link>
            <button type="button" className="min-h-11" onClick={() => { setMore(false); startTour(); }}>Lancer la visite guidée</button>
            <button type="button" className="min-h-11" onClick={signOut}>Quitter</button>
          </div>
        </div>
      )}
      {palette && (
        <div className="fixed inset-0 z-50 p-4">
          <button type="button" aria-label="Fermer la palette" className="absolute inset-0 h-full w-full cursor-default bg-black/60" onClick={() => setPalette(false)} />
          <div className="relative max-w-lg mx-auto mt-16 bg-[var(--surface)] rounded-xl border border-gray-800 p-4" role="dialog" aria-label="Palette de commandes">
            <input
              autoFocus
              aria-label="Aller à une page ou chercher un actif"
              className="w-full min-h-11 bg-[#0B0E11] border border-gray-700 rounded-lg px-3"
              placeholder="Page ou symbole"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query.trim() && (
              <button type="button" className="mt-3 min-h-11 text-sm text-[var(--accent)]" onClick={openAsset}>
                Chercher l&apos;actif « {query.trim()} »
              </button>
            )}
            <ul className="mt-3 space-y-1">
              <li>
                <button type="button" className="min-h-11 flex w-full items-center text-left text-[var(--accent)]" onClick={() => { setPalette(false); startTour(); }}>
                  Lancer la visite guidée
                </button>
              </li>
              {hits.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className="min-h-11 flex items-center" onClick={() => setPalette(false)}>{page.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
