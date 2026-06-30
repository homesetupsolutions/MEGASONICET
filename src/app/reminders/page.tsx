'use client';
import { useEffect, useState } from 'react';

interface Reminder {
  id: string;
  clientName: string;
  phone: string;
  email: string;
  eventDate: string;
  reminderType: '50h' | '26h' | 'sameday';
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  bookingId: string;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent'>('all');

  useEffect(() => {
    fetchReminders();
  }, []);

  async function fetchReminders() {
    try {
      const res = await fetch('/api/reminders');
      const data = await res.json();
      setReminders(data.reminders || []);
    } catch {
      // demo fallback
      const now = new Date();
      const plus50h = new Date(now.getTime() + 50 * 3600 * 1000);
      const plus26h = new Date(now.getTime() + 26 * 3600 * 1000);
      setReminders([
        { id: 'r1', clientName: 'Sarah Demo', phone: '+14165550101', email: 'sarah@demo.com', eventDate: plus50h.toISOString(), reminderType: '50h', status: 'pending', bookingId: 'b1' },
        { id: 'r2', clientName: 'Mike Demo', phone: '+14165550102', email: 'mike@demo.com', eventDate: plus26h.toISOString(), reminderType: '26h', status: 'pending', bookingId: 'b2' },
        { id: 'r3', clientName: 'Past Client', phone: '+14165550103', email: 'past@demo.com', eventDate: new Date(now.getTime() - 86400000).toISOString(), reminderType: 'sameday', status: 'sent', sentAt: new Date(now.getTime() - 90000000).toISOString(), bookingId: 'b3' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function sendReminder(id: string) {
    setSending(id);
    try {
      const reminder = reminders.find(r => r.id === id);
      if (!reminder) return;
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: reminder.bookingId,
          reminderType: reminder.reminderType,
          clientName: reminder.clientName,
          phone: reminder.phone,
          email: reminder.email,
          eventDate: reminder.eventDate,
        }),
      });
      const data = await res.json();
      if (data.success || data.demo) {
        setReminders(prev => prev.map(r =>
          r.id === id ? { ...r, status: 'sent', sentAt: new Date().toISOString() } : r
        ));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(null);
    }
  }

  async function sendAllPending() {
    const pending = reminders.filter(r => r.status === 'pending');
    for (const r of pending) {
      await sendReminder(r.id);
    }
  }

  const filtered = reminders.filter(r => filter === 'all' || r.status === filter);

  const typeLabel: Record<string, string> = {
    '50h': '50h Before',
    '26h': '26h Before',
    'sameday': 'Same Day',
  };

  const typeColor: Record<string, string> = {
    '50h': '#00f5ff',
    '26h': '#ff8c00',
    'sameday': '#ff4444',
  };

  const statusColor: Record<string, string> = {
    pending: '#ff8c00',
    sent: '#00ff88',
    failed: '#ff4444',
  };

  function hoursUntil(dateStr: string) {
    const diff = new Date(dateStr).getTime() - Date.now();
    const h = Math.round(diff / 3600000);
    if (h < 0) return 'Past';
    if (h < 24) return `${h}h`;
    return `${Math.round(h / 24)}d`;
  }

  const pendingCount = reminders.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e2e8f0] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#00f5ff]">Reminders</h1>
          <p className="text-[#64748b] text-sm">Auto-send SMS/email at 50h, 26h & same-day windows</p>
        </div>
        <div className="flex gap-3">
          {pendingCount > 0 && (
            <button
              onClick={sendAllPending}
              className="px-4 py-2 bg-[#ff8c00]/20 border border-[#ff8c00]/50 text-[#ff8c00] rounded-lg text-sm hover:bg-[#ff8c00]/30"
            >
              Send All Pending ({pendingCount})
            </button>
          )}
          <button
            onClick={fetchReminders}
            className="px-4 py-2 bg-[#00f5ff]/10 border border-[#00f5ff]/30 text-[#00f5ff] rounded-lg text-sm hover:bg-[#00f5ff]/20"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl">
        <p className="text-sm text-[#64748b]">
          <span className="text-[#00f5ff] font-medium">Reminder Windows:</span> 
          &nbsp;• <span style={{ color: typeColor['50h'] }}>50h Before</span> - 2 days early heads-up
          &nbsp;• <span style={{ color: typeColor['26h'] }}>26h Before</span> - Day-before confirmation
          &nbsp;• <span style={{ color: typeColor['sameday'] }}>Same Day</span> - Morning of event reminder
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'sent'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
              filter === f
                ? 'bg-[#00f5ff]/20 border border-[#00f5ff]/50 text-[#00f5ff]'
                : 'bg-[#0d0d1a] border border-[#1e1e2e] text-[#64748b] hover:text-[#e2e8f0]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex gap-2">
            {[0, 150, 300].map(d => (
              <div key={d} className="w-3 h-3 bg-[#00f5ff] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-[#64748b]">
          <p className="text-4xl mb-3">🔔</p>
          <p>No reminders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4 flex items-center gap-4">
              {/* Type badge */}
              <div
                className="px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0"
                style={{ color: typeColor[r.reminderType], borderColor: typeColor[r.reminderType] + '50', backgroundColor: typeColor[r.reminderType] + '15' }}
              >
                {typeLabel[r.reminderType]}
              </div>

              {/* Client info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#e2e8f0]">{r.clientName}</p>
                <p className="text-xs text-[#64748b]">{r.phone} &bull; {r.email}</p>
              </div>

              {/* Event info */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-[#e2e8f0]">
                  {new Date(r.eventDate).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs" style={{ color: typeColor[r.reminderType] }}>
                  {hoursUntil(r.eventDate)}
                </p>
              </div>

              {/* Status */}
              <div
                className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
                style={{ color: statusColor[r.status], backgroundColor: statusColor[r.status] + '20' }}
              >
                {r.status}
              </div>

              {/* Action */}
              {r.status === 'pending' && (
                <button
                  onClick={() => sendReminder(r.id)}
                  disabled={sending === r.id}
                  className="px-4 py-2 bg-[#00f5ff]/10 border border-[#00f5ff]/30 text-[#00f5ff] rounded-lg text-sm hover:bg-[#00f5ff]/20 disabled:opacity-50 flex-shrink-0"
                >
                  {sending === r.id ? 'Sending...' : 'Send Now'}
                </button>
              )}
              {r.status === 'sent' && r.sentAt && (
                <p className="text-xs text-[#64748b] flex-shrink-0">
                  Sent {new Date(r.sentAt).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
