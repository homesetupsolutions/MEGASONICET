'use client';
import { useEffect, useState } from 'react';

interface KPI {
  label: string;
  value: string;
  sub?: string;
  color: string;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  time: string;
}

interface HuntLead {
  id: string;
  name: string;
  value: string;
  status: string;
  phone: string;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [huntLeads, setHuntLeads] = useState<HuntLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Load bookings for KPIs
        const [bookingsRes, leadsRes, paymentsRes] = await Promise.all([
          fetch('/api/bookings').then(r => r.json()).catch(() => ({ bookings: [] })),
          fetch('/api/leads').then(r => r.json()).catch(() => ({ leads: [] })),
          fetch('/api/square?action=payments').then(r => r.json()).catch(() => ({ payments: [] })),
        ]);

        const bookings = bookingsRes.bookings || [];
        const leads = leadsRes.leads || [];
        const payments = paymentsRes.payments || [];

        const today = new Date().toDateString();
        const todayBookings = bookings.filter((b: {date: string}) => new Date(b.date).toDateString() === today);
        const totalRevenue = payments.filter((p: {status: string}) => p.status === 'COMPLETED')
          .reduce((sum: number, p: {amount_money?: {amount: number}}) => sum + ((p.amount_money?.amount || 0) / 100), 0);
        const hotLeads = leads.filter((l: {status: string}) => l.status === 'hot' || l.status === 'warm');

        setKpis([
          { label: "Today's Bookings", value: String(todayBookings.length), sub: `${bookings.length} total`, color: '#00f5ff' },
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, sub: 'CAD all time', color: '#00ff88' },
          { label: 'Hot Leads', value: String(hotLeads.length), sub: `${leads.length} total leads`, color: '#ff6b35' },
          { label: 'Upcoming Reminders', value: String(bookings.filter((b: {reminderSent: boolean}) => !b.reminderSent).length), sub: 'pending alerts', color: '#a855f7' },
        ]);

        // Build activity feed
        const acts: Activity[] = [
          ...bookings.slice(0, 3).map((b: {id: string; clientName: string; date: string}) => ({
            id: b.id,
            type: 'booking',
            message: `Booking: ${b.clientName}`,
            time: new Date(b.date).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }),
          })),
          ...leads.slice(0, 2).map((l: {id: string; name: string; status: string; createdAt: string}) => ({
            id: l.id,
            type: 'lead',
            message: `Lead: ${l.name} (${l.status})`,
            time: new Date(l.createdAt).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }),
          })),
        ];
        setActivity(acts);

        // Hunt for money - unpaid/hot leads
        const hunt: HuntLead[] = leads
          .filter((l: {status: string}) => l.status === 'hot' || l.status === 'warm')
          .slice(0, 5)
          .map((l: {id: string; name: string; value?: number; status: string; phone?: string}) => ({
            id: l.id,
            name: l.name,
            value: l.value ? `$${l.value}` : 'TBD',
            status: l.status,
            phone: l.phone || 'N/A',
          }));
        setHuntLeads(hunt);
      } catch (e) {
        console.error('Dashboard load error', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const statusColor: Record<string, string> = {
    hot: '#ff4444',
    warm: '#ff8c00',
    cold: '#4488ff',
    new: '#00f5ff',
  };

  const activityIcon: Record<string, string> = {
    booking: '📅',
    lead: '🎯',
    payment: '💳',
    reminder: '🔔',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e2e8f0] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#00f5ff] tracking-wide">MEGASONIC</h1>
          <p className="text-[#64748b] text-sm">Command Center Dashboard</p>
        </div>
        <div className="text-right">
          <p className="text-[#00f5ff] font-mono text-lg">
            {currentTime.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-[#64748b] text-sm">
            {currentTime.toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex gap-2">
            {[0, 150, 300].map(d => (
              <div key={d} className="w-3 h-3 bg-[#00f5ff] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((k, i) => (
              <div key={i} className="bg-[#0d0d1a] border rounded-xl p-5" style={{ borderColor: k.color + '40' }}>
                <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">{k.label}</p>
                <p className="text-3xl font-bold" style={{ color: k.color }}>{k.value}</p>
                {k.sub && <p className="text-xs text-[#64748b] mt-1">{k.sub}</p>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Feed */}
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-5">
              <h2 className="text-[#00f5ff] font-bold mb-4 uppercase tracking-wider text-sm">Live Activity</h2>
              {activity.length === 0 ? (
                <p className="text-[#64748b] text-sm">No recent activity. Demo mode active.</p>
              ) : (
                <div className="space-y-3">
                  {activity.map(a => (
                    <div key={a.id} className="flex items-center gap-3 p-3 bg-[#0a0a0f] rounded-lg border border-[#1e1e2e]">
                      <span className="text-xl">{activityIcon[a.type] || '📌'}</span>
                      <div className="flex-1">
                        <p className="text-sm text-[#e2e8f0]">{a.message}</p>
                      </div>
                      <span className="text-xs text-[#64748b]">{a.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hunt For Money */}
            <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-5">
              <h2 className="text-[#ff6b35] font-bold mb-4 uppercase tracking-wider text-sm">Hunt For Money 🎯</h2>
              {huntLeads.length === 0 ? (
                <p className="text-[#64748b] text-sm">No hot leads yet. Add leads to start hunting.</p>
              ) : (
                <div className="space-y-3">
                  {huntLeads.map(l => (
                    <div key={l.id} className="flex items-center gap-3 p-3 bg-[#0a0a0f] rounded-lg border border-[#1e1e2e]">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: statusColor[l.status] || '#888' }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#e2e8f0]">{l.name}</p>
                        <p className="text-xs text-[#64748b]">{l.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#00ff88]">{l.value}</p>
                        <p className="text-xs capitalize" style={{ color: statusColor[l.status] || '#888' }}>{l.status}</p>
                      </div>
                      <a
                        href={`/pbx?call=${encodeURIComponent(l.phone)}`}
                        className="ml-2 px-3 py-1 bg-[#00f5ff]/10 border border-[#00f5ff]/30 text-[#00f5ff] rounded text-xs hover:bg-[#00f5ff]/20"
                      >
                        Call
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Nav */}
          <div className="mt-6 grid grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Bookings', href: '/bookings', icon: '📅', color: '#00f5ff' },
              { label: 'Calendar', href: '/calendar', icon: '🗓️', color: '#00ff88' },
              { label: 'Leads', href: '/leads', icon: '🎯', color: '#ff6b35' },
              { label: 'Payments', href: '/payments', icon: '💳', color: '#a855f7' },
              { label: 'Monica AI', href: '/monica', icon: '🤖', color: '#00f5ff' },
              { label: 'PBX Phone', href: '/pbx', icon: '📞', color: '#00ff88' },
            ].map(n => (
              <a
                key={n.href}
                href={n.href}
                className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4 text-center hover:border-[#00f5ff]/50 transition-colors group"
              >
                <div className="text-2xl mb-2">{n.icon}</div>
                <p className="text-xs font-medium" style={{ color: n.color }}>{n.label}</p>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
