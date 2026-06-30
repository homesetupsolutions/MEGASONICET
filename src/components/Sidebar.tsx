'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', icon: '🏠', label: 'Dashboard' },
  { href: '/bookings', icon: '📅', label: 'Bookings' },
  { href: '/calendar', icon: '🗓️', label: 'Calendar' },
  { href: '/reminders', icon: '🔔', label: 'Reminders' },
  { href: '/leads', icon: '🎯', label: 'Live Leads' },
  { href: '/ai', icon: '✨', label: 'Gemini AI' },
  { href: '/pbx', icon: '📞', label: 'PBX Phone' },
  { href: '/square', icon: '🟦', label: 'Square' },
  { href: '/payments', icon: '💳', label: 'Payments' },
  { href: '/settings', icon: '⚙️', label: 'Settings' },
];

const S = {
  aside: {
    width: '220px',
    minWidth: '220px',
    height: '100vh',
    background: '#12121a',
    borderRight: '1px solid #1e1e2e',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    flexShrink: 0,
  },
  logoArea: {
    padding: '16px 12px 12px',
    borderBottom: '1px solid #1e1e2e',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  logoImg: {
    width: '100%',
    height: 'auto',
    maxHeight: '48px',
    objectFit: 'contain' as const,
  },
  divider: {
    height: '1px',
    background: '#1e1e2e',
    margin: '4px 0',
  },
  nav: {
    flex: 1,
    padding: '8px',
    overflowY: 'auto' as const,
  },
  link: (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 10px',
    borderRadius: '8px',
    marginBottom: '2px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
    color: active ? '#00f5ff' : '#a0a0b8',
    background: active ? 'rgba(0,245,255,0.08)' : 'transparent',
    borderLeft: active ? '2px solid #00f5ff' : '2px solid transparent',
    transition: 'all 0.15s',
  }),
  icon: {
    fontSize: '15px',
    width: '20px',
    textAlign: 'center' as const,
  },
  footer: {
    padding: '10px 12px',
    borderTop: '1px solid #1e1e2e',
    fontSize: '10px',
    color: '#444',
    textAlign: 'center' as const,
  },
};

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside style={S.aside}>
      <div style={S.logoArea}>
        <img
          src="/logos/feelbass-logo.png"
          alt="FeelBassVIP"
          style={S.logoImg}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div style={S.divider} />
        <img
          src="/logos/hss-logo.png"
          alt="Home Setup Solutions"
          style={S.logoImg}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
      <nav style={S.nav}>
        {nav.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={S.link(isActive)}>
              <span style={S.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div style={S.footer}>FeelBassVIP &amp; HSS &copy; 2026</div>
    </aside>
  );
}
