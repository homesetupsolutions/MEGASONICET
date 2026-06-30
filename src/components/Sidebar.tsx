'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', icon: '🏠', label: 'Dashboard' },
  { href: '/bookings', icon: '📋', label: 'Bookings' },
  { href: '/calendar', icon: '📅', label: 'Calendar' },
  { href: '/reminders', icon: '🔔', label: 'Reminders' },
  { href: '/leads', icon: '🎯', label: 'Live Leads' },
  { href: '/ai', icon: '✨', label: 'Gemini AI' },
  { href: '/pbx', icon: '📞', label: 'PBX Phone' },
  { href: '/square', icon: '💳', label: 'Square' },
  { href: '/payments', icon: '💰', label: 'Payments' },
  { href: '/settings', icon: '⚙️', label: 'Settings' },
];

// Nav item accent colors cycling through neon palette
const accentColors = [
  '#00f5ff', '#b44fff', '#00ff88', '#ff2d78',
  '#ff8c00', '#00f5ff', '#b44fff', '#00ff88',
  '#ff2d78', '#ff8c00',
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: '200px',
      minWidth: '200px',
      height: '100vh',
      background: '#0a0a14',
      borderRight: '1px solid #1a1a2e',
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Logo area */}
      <div style={{
        padding: '16px 14px 12px',
        borderBottom: '1px solid #1a1a2e',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '6px',
      }}>
        <div style={{ position: 'relative', width: '100px', height: '38px' }}>
          <Image
            src="/logos/feelbass-logo.png"
            alt="FeelBass VIP"
            fill
            style={{ objectFit: 'contain' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        <div style={{
          fontSize: '0.6rem',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase' as const,
          background: 'linear-gradient(90deg, #00f5ff, #b44fff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>MEGASONIC</div>
        <div style={{
          fontSize: '0.5rem',
          letterSpacing: '0.12em',
          color: '#4b5563',
          textTransform: 'uppercase' as const,
        }}>Command Center</div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' as const }}>
        {nav.map(({ href, icon, label }, i) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          const accent = accentColors[i % accentColors.length];
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 14px',
                margin: '1px 8px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.04em',
                color: isActive ? accent : '#9ca3af',
                background: isActive
                  ? `linear-gradient(135deg, ${accent}18, ${accent}08)`
                  : 'transparent',
                border: isActive
                  ? `1px solid ${accent}40`
                  : '1px solid transparent',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? `0 0 8px ${accent}20` : 'none',
              }}
            >
              <span style={{ fontSize: '0.9rem', minWidth: '18px', textAlign: 'center' }}>{icon}</span>
              <span>{label}</span>
              {isActive && (
                <span style={{
                  marginLeft: 'auto',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: accent,
                  boxShadow: `0 0 6px ${accent}`,
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid #1a1a2e',
        fontSize: '0.6rem',
        color: '#374151',
        letterSpacing: '0.06em',
        textAlign: 'center' as const,
      }}>
        <div style={{ marginBottom: '4px' }}>
          <span style={{
            display: 'inline-block',
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: '#00ff88',
            boxShadow: '0 0 6px #00ff88',
            marginRight: '5px',
            verticalAlign: 'middle',
          }} />
          LIVE
        </div>
        FeelBassVIP & HSS © 2026
      </div>
    </aside>
  );
}
