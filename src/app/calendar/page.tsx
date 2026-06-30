'use client'
import { useState, useEffect } from 'react'

interface CalEvent { id: string; summary: string; start: string; end: string; location?: string; description?: string }

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function CalendarPage() {
  const [events, setEvents] = useState<CalEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ summary: '', start: '', end: '', location: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  useEffect(() => { fetchEvents() }, [])

  async function fetchEvents() {
    setLoading(true)
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      const list = data?.bookings || data || []
      setEvents(list.map((b: any) => ({
        id: b.id,
        summary: `${b.service || b.service_type || 'Event'} - ${b.customer_name || b.client_name}`,
        start: b.event_date,
        end: b.event_end || b.event_date,
        location: b.location || '',
        description: `$${(b.amount_cents||0)/100} - ${b.status}`
      })))
    } catch { setEvents([]) }
    setLoading(false)
  }

  async function createBooking() {
    setSaving(true); setMsg('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.summary,
          event_date: form.start,
          event_end: form.end,
          location: form.location,
          notes: form.description,
          business: 'HSS',
          service: 'General',
          status: 'pending'
        })
      })
      if (res.ok) { setMsg('Event created!'); setShowForm(false); setForm({ summary:'',start:'',end:'',location:'',description:'' }); fetchEvents() }
      else setMsg('Failed to create.')
    } catch { setMsg('Error.') }
    setSaving(false)
  }

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1)

  function eventsOnDay(day: number) {
    const d = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return events.filter(e => e.start?.startsWith(d))
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#00f5ff]">Calendar</h1>
            <p className="text-gray-400 mt-1">Bookings and events overview</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-[#00f5ff] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#00f5ff]/80">+ New Event</button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => setViewDate(new Date(year, month-1, 1))} className="px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/10">&larr;</button>
          <h2 className="text-lg font-semibold w-44 text-center">{MONTHS[month]} {year}</h2>
          <button onClick={() => setViewDate(new Date(year, month+1, 1))} className="px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/10">&rarr;</button>
          <button onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))} className="ml-auto text-sm text-[#00f5ff] border border-[#00f5ff]/30 px-3 py-1.5 rounded-lg hover:bg-[#00f5ff]/10">Today</button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-8">
          <div className="grid grid-cols-7 border-b border-white/10">
            {DAYS.map(d => <div key={d} className="text-center py-2 text-xs font-semibold text-gray-400">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const isToday = day !== null && day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              const dayEvts = day ? eventsOnDay(day) : []
              return (
                <div key={i} className={`min-h-[80px] p-2 border-b border-r border-white/5 ${!day ? '' : isToday ? 'bg-[#00f5ff]/5' : 'hover:bg-white/5'}`}>
                  {day && (
                    <>
                      <span className={`text-sm font-medium ${isToday ? 'text-[#00f5ff] font-bold' : 'text-gray-300'}`}>{day}</span>
                      <div className="mt-1 space-y-0.5">
                        {dayEvts.slice(0,2).map(e => <div key={e.id} className="text-xs truncate bg-[#00f5ff]/20 text-[#00f5ff] px-1.5 py-0.5 rounded">{e.summary}</div>)}
                        {dayEvts.length > 2 && <div className="text-xs text-gray-500">+{dayEvts.length-2} more</div>}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
        {loading ? <div className="text-gray-500 py-8 text-center">Loading...</div> : events.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No events. Add a booking above.</div>
        ) : (
          <div className="space-y-3">
            {events.slice(0,10).map(e => (
              <div key={e.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-4">
                <div className="w-12 h-12 bg-[#00f5ff]/10 border border-[#00f5ff]/20 rounded-lg flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs text-[#00f5ff]">{e.start ? new Date(e.start).toLocaleString('default',{month:'short'}) : '-'}</span>
                  <span className="text-lg font-bold text-[#00f5ff]">{e.start ? new Date(e.start).getDate() : '-'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{e.summary}</div>
                  {e.location && <div className="text-sm text-gray-400 truncate">{e.location}</div>}
                  {e.description && <div className="text-sm text-gray-500">{e.description}</div>}
                </div>
                <div className="text-sm text-gray-400 shrink-0">{e.start ? new Date(e.start).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''}</div>
              </div>
            ))}
          </div>
        )}

        {msg && <div className="mt-4 text-sm text-green-400">{msg}</div>}

        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-[#00f5ff] mb-4">New Event</h2>
              <div className="space-y-3">
                <input placeholder="Title / Client Name" value={form.summary} onChange={e => setForm({...form,summary:e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00f5ff]/50" />
                <input type="datetime-local" value={form.start} onChange={e => setForm({...form,start:e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00f5ff]/50" />
                <input type="datetime-local" value={form.end} onChange={e => setForm({...form,end:e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00f5ff]/50" />
                <input placeholder="Location" value={form.location} onChange={e => setForm({...form,location:e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00f5ff]/50" />
                <textarea placeholder="Notes" value={form.description} onChange={e => setForm({...form,description:e.target.value})} rows={2} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00f5ff]/50 resize-none" />
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={createBooking} disabled={saving} className="flex-1 bg-[#00f5ff] text-black py-2 rounded-lg font-semibold disabled:opacity-50">{saving ? 'Saving...' : 'Create'}</button>
                <button onClick={() => setShowForm(false)} className="flex-1 border border-white/20 py-2 rounded-lg hover:bg-white/5">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
