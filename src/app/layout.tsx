import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'MegaSonic Command Center',
  description: 'Business Operating System for FeelBassVIP & HomeSetupSolutions',
}

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/bookings', label: 'Bookings', icon: '📅' },
  { href: '/calendar', label: 'Calendar', icon: '🗓️' },
  { href: '/leads', label: 'Leads', icon: '🎯' },
  { href: '/payments', label: 'Payments', icon: '💳' },
  { href: '/square', label: 'Square POS', icon: '🟦' },
  { href: '/pbx', label: 'PBX / Phones', icon: '📞' },
  { href: '/reminders', label: 'Reminders', icon: '🔔' },
  { href: '/ai', label: 'AI Assistant', icon: '🤖' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-sonic-bg text-sonic-text h-screen overflow-hidden flex">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 bg-black/40 border-r border-white/10 flex flex-col h-full overflow-y-auto">
          <div className="px-4 py-5 border-b border-white/10">
            <span className="text-[#00f5ff] font-bold text-lg tracking-wide">MEGASONIC</span>
            <p className="text-xs text-gray-500 mt-0.5">Command Center</p>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {NAV_LINKS.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="px-4 py-3 border-t border-white/10 text-xs text-gray-600">
            FeelBassVIP &amp; HSS
          </div>
        </aside>
        {/* Main content */}
        <main className="flex-1 h-full overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
