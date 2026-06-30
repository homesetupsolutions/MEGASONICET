'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', icon: '🏠', label: 'Dashboard' },
  { href: '/bookings', icon: '📅', label: 'Bookings' },
  { href: '/calendar', icon: '🗓️', label: 'Calendar' },
  { href: '/reminders', icon: '🔔', label: 'Reminders' },
  { href: '/leads', icon: '📡', label: 'Live Leads' },
  { href: '/ai', icon: '✨', label: 'Gemini AI' },
  { href: '/pbx', icon: '📞', label: 'PBX Phone' },
  { href: '/square', icon: '💳', label: 'Square' },
  { href: '/payments', icon: '💰', label: 'Payments' },
  { href: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="h-screen w-60 bg-[#12121a] border-r border-[#1e1e2e] flex flex-col pt-10 group overflow-hidden shrink-0">
      <div className="px-3 mb-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-[#00f5ff] text-xs font-bold tracking-widest">MEGASONIC</p>
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {nav.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 mx-2 rounded-lg mb-1 transition-all ${
                isActive
                  ? 'bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/30'
                  : 'text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1e1e2e]'
              }`}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
