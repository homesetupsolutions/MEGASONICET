'use client'
import Sidebar from '@/components/Sidebar'
import TitleBar from '@/components/TitleBar'

const kpis = [
  { label: 'Revenue MTD', value: '$4,280', delta: '+12%', color: '#00ff88' },
  { label: 'Bookings Today', value: '3', delta: '+1', color: '#00f5ff' },
  { label: 'Open Leads', value: '14', delta: '+3', color: '#facc15' },
  { label: 'Reminders Due', value: '2', delta: 'urgent', color: '#ff3366' },
]

const activity = [
  { time: '11:45 AM', text: 'Booking #B-0041 confirmed – FeelBassVIP Headset x4' },
  { time: '10:20 AM', text: 'Square payment received – $320.00' },
  { time: '9:05 AM', text: 'Reminder sent – Job #J-0039 starts in 26h' },
  { time: 'Yesterday', text: 'New lead scanned – HomeSetup consultation' },
]

const businesses = [
  {
    name: 'FeelBassVIP',
    location: 'Vancouver, BC',
    desc: 'Wearable Bass Experience Rentals',
    tags: ['Bone Conduction Headbands', 'BassSkin Technology', 'Event Rentals', 'Corporate Events'],
    color: '#00f5ff',
  },
  {
    name: 'Home Setup Solutions',
    location: 'Vancouver, BC',
    desc: 'Residential Technology Installation',
    tags: ['TV Mounting', 'WiFi & Networking', 'Smart Home Setup', 'Home Theatre'],
    color: '#7c3aed',
  },
]

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0f', fontFamily: 'Inter, sans-serif', color: '#e2e8f0' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TitleBar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#00f5ff', marginBottom: '4px' }}>Command Center</h1>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '24px' }}>Vancouver, BC — FeelBassVIP &amp; HomeSetupSolutions</p>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {kpis.map((k) => (
              <div key={k.label} style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '10px', padding: '16px' }}>
                <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</p>
                <p style={{ fontSize: '26px', fontWeight: 700, color: k.color, margin: '0 0 4px' }}>{k.value}</p>
                <p style={{ fontSize: '11px', color: '#64748b' }}>{k.delta}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Recent Activity */}
            <div style={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: '10px', padding: '16px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#00f5ff', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent Activity</h2>
              {activity.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: i < activity.length - 1 ? '1px solid #1e1e2e' : 'none' }}>
                  <span style={{ fontSize: '11px', color: '#475569', minWidth: '72px', flexShrink: 0 }}>{a.time}</span>
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>{a.text}</span>
                </div>
              ))}
            </div>

            {/* Business Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {businesses.map((b) => (
                <div key={b.name} style={{ background: '#12121a', border: `1px solid ${b.color}33`, borderLeft: `3px solid ${b.color}`, borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: b.color, margin: 0 }}>{b.name}</h3>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{b.location}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>{b.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
                    {b.tags.map((t) => (
                      <span key={t} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: `${b.color}18`, color: b.color, border: `1px solid ${b.color}33` }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
