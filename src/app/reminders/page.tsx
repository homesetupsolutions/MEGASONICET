'use client'
import { useState, useEffect } from 'react'

const CHANNELS = ['email', 'sms', 'both']

export default function RemindersPage() {
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', remind_at: '', channel: 'email' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchReminders() }, [])

  async function fetchReminders() {
    setLoading(true)
    try {
      const res = await fetch('/api/reminders')
      const data = await res.json()
      setReminders(Array.isArray(data) ? data : [])
    } catch { setReminders([]) }
    setLoading(false)
  }

  async function createReminder() {
    if (!form.title || !form.remind_at) return
    setSaving(true); setMsg('')
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        setMsg('Reminder created!')
        setShowForm(false)
        setForm({ title: '', body: '', remind_at: '', channel: 'email' })
        fetchReminders()
      } else setMsg('Failed to create.')
    } catch { setMsg('Error.') }
    setSaving(false)
  }

  async function deleteReminder(id: string) {
    await fetch(`/api/reminders`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchReminders()
  }

  const now = new Date()
  const upcoming = reminders.filter(r => new Date(r.remind_at) >= now)
  const past = reminders.filter(r => new Date(r.remind_at) < now)

  const channelIcon: Record<string,string> = { email: '✉️', sms: '📱', both: '🔔' }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#00f5ff]">Reminders</h1>
            <p className="text-gray-400 mt-1">Scheduled alerts via email and SMS</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-[#00f5ff] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#00f5ff]/80">+ New Reminder</button>
        </div>

        {msg && <div className="mb-4 text-sm text-green-400">{msg}</div>}

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Upcoming ({upcoming.length})</h2>
                <div className="space-y-3">
                  {upcoming.map((r: any) => (
                    <div key={r.id} className="flex items-start gap-4 bg-white/5 border border-[#00f5ff]/20 rounded-xl px-5 py-4">
                      <div className="text-2xl shrink-0">{channelIcon[r.channel] || '🔔'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{r.title}</div>
                        {r.body && <div className="text-sm text-gray-400 mt-0.5">{r.body}</div>}
                        <div className="text-xs text-[#00f5ff] mt-1">
                          {new Date(r.remind_at).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Edmonton' })} MDT
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          r.status === 'sent' ? 'text-green-400 bg-green-400/10 border-green-400/30' :
                          r.status === 'failed' ? 'text-red-400 bg-red-400/10 border-red-400/30' :
                          'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
                        }`}>{r.status || 'pending'}</span>
                        <button onClick={() => deleteReminder(r.id)} className="text-xs text-gray-500 hover:text-red-400 transition-colors">✕ Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {upcoming.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-white/5 border border-white/10 rounded-2xl mb-8">
                No upcoming reminders. Create one!
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Past ({past.length})</h2>
                <div className="space-y-2">
                  {past.slice(0, 10).map((r: any) => (
                    <div key={r.id} className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-xl px-5 py-3 opacity-60">
                      <div className="text-xl shrink-0">{channelIcon[r.channel] || '🔔'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{r.title}</div>
                        <div className="text-xs text-gray-500">{new Date(r.remind_at).toLocaleDateString()}</div>
                      </div>
                      <span className="text-xs text-gray-500">{r.status || 'sent'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-[#00f5ff] mb-4">New Reminder</h2>
              <div className="space-y-3">
                <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00f5ff]/50" />
                <textarea placeholder="Message body (optional)" value={form.body} onChange={e => setForm({...form, body: e.target.value})}
                  rows={2} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00f5ff]/50 resize-none" />
                <input type="datetime-local" value={form.remind_at} onChange={e => setForm({...form, remind_at: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00f5ff]/50" />
                <select value={form.channel} onChange={e => setForm({...form, channel: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none">
                  {CHANNELS.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={createReminder} disabled={saving || !form.title || !form.remind_at}
                  className="flex-1 bg-[#00f5ff] text-black py-2 rounded-lg font-semibold disabled:opacity-50">{saving ? 'Saving...' : 'Create'}</button>
                <button onClick={() => setShowForm(false)} className="flex-1 border border-white/20 py-2 rounded-lg hover:bg-white/5">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
