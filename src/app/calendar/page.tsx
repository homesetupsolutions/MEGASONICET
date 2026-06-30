'use client'
import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'

interface CalEvent { id: string; summary: string; start: string; end: string; location?: string; description?: string }

export default function CalendarPage() {
  const [events, setEvents] = useState<CalEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ summary: '', start: '', end: '', location: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchEvents() }, [])

  async function fetchEvents() {
    setLoading(true)
    const res = await fetch('/api/bookings')
    const data = await res.json()
    // Map bookings to calendar-style events
    setEvents((data || []).map((b: any) => ({
      id: b.id,
      summary: `${b.service_type || 'Event'} — ${b.client_name}`,
      start: b.event_date,
      end: b.event_end || b.event_date,
      location: b.location,
      description: `$${b.total || 0} • ${b.status}`
    })))
    setLoading(false)
  }

  async function createBooking() {
    setSaving(true)
    setMsg('')
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, client_name: form.summary, service_type: 'FeelBassVIP', event_date: form.start, event_end: form.end })
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      setMsg('Booked & synced to vip@feelbass.vip')
      setShowForm(false)
      fetchEvents()
    } else {
      setMsg(data.error || 'Error')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-[#64748b] text-sm">Synced with vip@feelbass.vip</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#00f5ff]/10 border border-[#00f5ff]/30 text-[#00f5ff] px-4 py-2 rounded-lg text-sm hover:bg-[#00f5ff]/20 transition-colors">
          + New Booking
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4 space-y-3">
          <h2 className="text-[#00f5ff] font-bold text-sm uppercase tracking-widest">New Booking</h2>
          {['summary', 'start', 'end', 'location', 'description'].map(f => (
            <div key={f}>
              <label className="text-[#64748b] text-xs capitalize">{f === 'start' ? 'Start Date/Time' : f === 'end' ? 'End Date/Time' : f}</label>
              <input
                type={f === 'start' || f === 'end' ? 'datetime-local' : 'text'}
                value={(form as any)[f]}
                onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                className="w-full bg-[#12121a] border border-[#1e1e2e] text-[#e2e8f0] rounded px-3 py-1.5 text-sm mt-1"
              />
            </div>
          ))}
          {msg && <p className="text-xs text-[#00f5ff]">{msg}</p>}
          <button onClick={createBooking} disabled={saving} className="w-full bg-[#00f5ff]/10 border border-[#00f5ff]/30 text-[#00f5ff] py-2 rounded-lg text-sm hover:bg-[#00f5ff]/20 disabled:opacity-50">
            {saving ? 'Checking availability...' : 'Book & Sync to Calendar'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-[#64748b] text-sm">Loading calendar...</div>
      ) : (
        <div className="space-y-2">
          {events.length === 0 && <div className="text-[#64748b] text-sm">No upcoming events</div>}
          {events.map(evt => (
            <div key={evt.id} className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4 flex items-start gap-4 hover:border-[#00f5ff]/30 transition-colors">
              <div className="bg-[#00f5ff]/10 rounded-lg p-2 text-center min-w-[48px]">
                <div className="text-[#00f5ff] text-xs font-bold">{new Date(evt.start).toLocaleDateString('en-CA', { month: 'short' })}</div>
                <div className="text-white text-lg font-bold leading-tight">{new Date(evt.start).getDate()}</div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{evt.summary}</p>
                <p className="text-[#64748b] text-xs">{formatDate(evt.start)} — {formatDate(evt.end)}</p>
                {evt.location && <p className="text-[#64748b] text-xs">📍 {evt.location}</p>}
                {evt.description && <p className="text-[#00f5ff] text-xs mt-1">{evt.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
