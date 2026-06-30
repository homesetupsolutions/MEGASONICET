'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface StatsData {
  bookings: { total: number; pending: number; confirmed: number }
  leads: { total: number; new_count: number }
  payments: { total_cents: number; count: number }
  calls: { total: number; missed: number }
}

const QUICK_LINKS = [
  { href: '/bookings', label: 'Bookings', icon: '📅', color: 'bg-purple-600' },
  { href: '/leads', label: 'Leads', icon: '🎯', color: 'bg-blue-600' },
  { href: '/payments', label: 'Payments', icon: '💳', color: 'bg-green-600' },
  { href: '/pbx', label: 'PBX / Calls', icon: '📞', color: 'bg-orange-600' },
  { href: '/ai', label: 'AI Assistant', icon: '🤖', color: 'bg-indigo-600' },
  { href: '/calendar', label: 'Calendar', icon: '📆', color: 'bg-pink-600' },
  { href: '/reminders', label: 'Reminders', icon: '🔔', color: 'bg-yellow-600' },
  { href: '/settings', label: 'Settings', icon: '⚙️', color: 'bg-gray-600' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState<'FEELBASSVIP' | 'HSS'>('FEELBASSVIP')
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [bookRes, leadRes, payRes, pbxRes] = await Promise.all([
          fetch(`/api/bookings?business=${business}&limit=100`).then(r => r.json()),
          fetch(`/api/leads?business=${business}&limit=100`).then(r => r.json()),
          fetch(`/api/payments?business=${business}&limit=100`).then(r => r.json()),
          fetch(`/api/pbx?business=${business}&limit=100`).then(r => r.json()),
        ])
        const bookings = bookRes.bookings || []
        const leads = leadRes.leads || []
        const payments = payRes.payments || []
        const calls = pbxRes.logs || []
        setStats({
          bookings: {
            total: bookings.length,
            pending: bookings.filter((b: any) => b.status === 'pending').length,
            confirmed: bookings.filter((b: any) => b.status === 'confirmed').length,
          },
          leads: {
            total: leads.length,
            new_count: leads.filter((l: any) => l.status === 'new').length,
          },
          payments: {
            total_cents: payments.reduce((s: number, p: any) => s + (p.amount_money?.amount || p.amount_cents || 0), 0),
            count: payments.length,
          },
          calls: {
            total: calls.length,
            missed: calls.filter((c: any) => c.status === 'missed').length,
          },
        })
      } catch (e) {
        console.error('Dashboard load error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [business])

  const formatCAD = (cents: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(cents / 100)

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">MEGASONICET Command Center</h1>
          <p className="text-gray-400 mt-1">
            {time.toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}{' '}
            &mdash; {time.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setBusiness('FEELBASSVIP')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              business === 'FEELBASSVIP' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            FeelBassVIP
          </button>
          <button
            onClick={() => setBusiness('HSS')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              business === 'HSS' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Home Setup
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-xl p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Bookings" value={stats.bookings.total} sub={`${stats.bookings.pending} pending`} color="purple" />
          <StatCard label="Leads" value={stats.leads.total} sub={`${stats.leads.new_count} new`} color="blue" />
          <StatCard label="Revenue" value={formatCAD(stats.payments.total_cents)} sub={`${stats.payments.count} transactions`} color="green" />
          <StatCard label="Calls" value={stats.calls.total} sub={`${stats.calls.missed} missed`} color="orange" />
        </div>
      ) : null}

      {/* Quick Links */}
      <h2 className="text-xl font-semibold text-gray-300 mb-4">Quick Navigation</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {QUICK_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`${link.color} rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
          >
            <span className="text-3xl">{link.icon}</span>
            <span className="font-semibold text-sm">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Business Status */}
      <div className="grid md:grid-cols-2 gap-6">
        <BusinessCard
          name="FeelBassVIP"
          description="Wearable Bass Experience Rentals"
          location="Calgary, AB"
          services={['Bone Conduction Headbands', 'BassSkin Technology', 'Event Rentals', 'Corporate Events']}
          color="purple"
        />
        <BusinessCard
          name="Home Setup Solutions"
          description="Residential Technology Installation"
          location="Calgary, AB"
          services={['TV Mounting', 'WiFi & Networking', 'Smart Home Setup', 'Home Theatre']}
          color="blue"
        />
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  const colors: Record<string, string> = {
    purple: 'border-purple-500 bg-purple-900/20',
    blue: 'border-blue-500 bg-blue-900/20',
    green: 'border-green-500 bg-green-900/20',
    orange: 'border-orange-500 bg-orange-900/20',
  }
  return (
    <div className={`rounded-xl p-5 border-l-4 ${colors[color] || colors.purple} bg-gray-900`}>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      <p className="text-gray-500 text-xs mt-1">{sub}</p>
    </div>
  )
}

function BusinessCard({ name, description, location, services, color }: {
  name: string; description: string; location: string; services: string[]; color: string
}) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
        color === 'purple' ? 'bg-purple-900 text-purple-300' : 'bg-blue-900 text-blue-300'
      }`}>
        {location}
      </div>
      <h3 className="text-lg font-bold text-white">{name}</h3>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {services.map(s => (
          <span key={s} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">{s}</span>
        ))}
      </div>
    </div>
  )
}
