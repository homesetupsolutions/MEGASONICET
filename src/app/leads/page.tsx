'use client'
import { useState, useEffect } from 'react'

const STATUS_COLORS: Record<string,string> = {
  new: 'text-[#00f5ff] bg-[#00f5ff]/10 border-[#00f5ff]/30',
  contacted: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  qualified: 'text-green-400 bg-green-400/10 border-green-400/30',
  lost: 'text-red-400 bg-red-400/10 border-red-400/30',
  converted: 'text-purple-400 bg-purple-400/10 border-purple-400/30'
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', source: 'manual', service_interest: '', estimated_value: '', notes: '' })
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchLeads() }, [])

  async function fetchLeads() {
    setLoading(true)
    const url = filter === 'all' ? '/api/leads' : `/api/leads?status=${filter}`
    const res = await fetch(url)
    setLeads(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchLeads() }, [filter])

  async function addLead() {
    await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowForm(false)
    setForm({ name: '', phone: '', email: '', source: 'manual', service_interest: '', estimated_value: '', notes: '' })
    fetchLeads()
  }

  async function updateStatus(id: string, status: string) {
    await fetch('/api/leads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    fetchLeads()
  }

  const totalValue = leads.reduce((s, l) => s + (l.estimated_value || 0), 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Scanner</h1>
          <p className="text-[#64748b] text-sm">{leads.length} leads • ${totalValue.toLocaleString()} pipeline</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#00f5ff]/10 border border-[#00f5ff]/30 text-[#00f5ff] px-4 py-2 rounded-lg text-sm hover:bg-[#00f5ff]/20">
          + Add Lead
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all','new','contacted','qualified','converted','lost'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs border capitalize transition-colors ${ filter === s ? 'bg-[#00f5ff]/20 border-[#00f5ff]/50 text-[#00f5ff]' : 'border-[#1e1e2e] text-[#64748b] hover:border-[#00f5ff]/30'}`}>
            {s}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4 grid grid-cols-2 gap-3">
          {Object.keys(form).map(f => (
            <div key={f}>
              <label className="text-[#64748b] text-xs capitalize">{f.replace('_',' ')}</label>
              <input value={(form as any)[f]} onChange={e => setForm(p => ({...p, [f]: e.target.value}))}
                className="w-full bg-[#12121a] border border-[#1e1e2e] text-[#e2e8f0] rounded px-3 py-1.5 text-sm mt-1" />
            </div>
          ))}
          <div className="col-span-2">
            <button onClick={addLead} className="w-full bg-[#00f5ff]/10 border border-[#00f5ff]/30 text-[#00f5ff] py-2 rounded-lg text-sm hover:bg-[#00f5ff]/20">Save Lead</button>
          </div>
        </div>
      )}

      {loading ? <p className="text-[#64748b] text-sm">Loading...</p> : (
        <div className="space-y-2">
          {leads.length === 0 && <p className="text-[#64748b] text-sm">No leads found</p>}
          {leads.map(l => (
            <div key={l.id} className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4 flex items-center gap-4 hover:border-[#00f5ff]/30 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold">{l.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[l.status] || 'text-gray-400 bg-gray-400/10 border-gray-400/30'}`}>{l.status}</span>
                </div>
                <p className="text-[#64748b] text-xs">{l.phone} {l.email && `• ${l.email}`} {l.service_interest && `• ${l.service_interest}`}</p>
                {l.estimated_value > 0 && <p className="text-green-400 text-xs">${l.estimated_value.toLocaleString()} est.</p>}
              </div>
              <select value={l.status} onChange={e => updateStatus(l.id, e.target.value)}
                className="bg-[#12121a] border border-[#1e1e2e] text-[#e2e8f0] text-xs rounded px-2 py-1">
                {['new','contacted','qualified','converted','lost'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
