'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LineChart, MessageSquare, BookOpen } from 'lucide-react';

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/markets', label: 'Marchés', icon: LineChart },
  { href: '/chat/AAPL', label: 'Chat IA', icon: MessageSquare },
  { href: '/learn', label: 'Apprendre', icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full bg-[var(--surface)] border-t border-gray-800 md:static md:w-64 md:h-screen md:border-r md:border-t-0 flex md:flex-col justify-around md:justify-start p-2 md:p-4 z-50">
      <div className="hidden md:block mb-8 px-4">
        <h1 className="text-xl font-bold text-[var(--text)]">MarketPulse</h1>
      </div>
      
      <div className="flex w-full md:flex-col justify-around md:justify-start gap-2 md:gap-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-[var(--accent)] bg-gray-800/50' 
                  : 'text-gray-400 hover:text-[var(--text)] hover:bg-gray-800/30'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs md:text-sm font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
