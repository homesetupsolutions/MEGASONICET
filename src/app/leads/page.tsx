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
  const [search, setSearch] = useState('')

  useEffect(() => { fetchLeads() }, [filter])

  async function fetchLeads() {
    setLoading(true)
    const url = filter === 'all' ? '/api/leads' : `/api/leads?status=${filter}`
    const res = await fetch(url)
    setLeads(await res.json())
    setLoading(false)
  }

  async function addLead() {
    await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowForm(false)
    setForm({ name: '', phone: '', email: '', source: 'manual', service_interest: '', estimated_value: '', notes: '' })
    fetchLeads()
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    fetchLeads()
  }

  const filtered = leads.filter(l => l.name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#00f5ff]">Leads</h1>
            <p className="text-gray-400 mt-1">Track and manage your sales pipeline</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-[#00f5ff] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#00f5ff]/80">
            + New Lead
          </button>
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          {['all','new','contacted','qualified','converted','lost'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm capitalize border transition-all ${
                filter === s ? 'bg-[#00f5ff]/20 border-[#00f5ff] text-[#00f5ff]' : 'border-white/10 text-gray-400 hover:border-white/30'
              }`}>{s}</button>
          ))}
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search leads..." className="ml-auto px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00f5ff]/50" />
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading leads...</div>
        ) : (
          <div className="grid gap-4">
            {filtered.length === 0 && <div className="text-center py-20 text-gray-500">No leads found.</div>}
            {filtered.map((lead: any) => (
              <div key={lead.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-lg">{lead.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[lead.status] || 'text-gray-400 bg-gray-400/10 border-gray-400/30'}`}>{lead.status}</span>
                  </div>
                  <div className="text-sm text-gray-400 space-y-0.5">
                    {lead.email && <div>{lead.email}</div>}
                    {lead.phone && <div>{lead.phone}</div>}
                    {lead.service_interest && <div className="text-[#00f5ff]/70">Interest: {lead.service_interest}</div>}
                    {lead.estimated_value && <div className="text-green-400">Value: ${lead.estimated_value}</div>}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['contacted','qualified','converted','lost'].map(s => (
                    <button key={s} onClick={() => updateStatus(lead.id, s)}
                      className="text-xs px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/10 capitalize transition-all">{s}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-[#00f5ff] mb-4">Add Lead</h2>
              <div className="space-y-3">
                {(['name','phone','email','service_interest','estimated_value','notes'] as const).map(f => (
                  <input key={f} placeholder={f.replace('_',' ')} value={(form as any)[f]}
                    onChange={e => setForm({...form, [f]: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00f5ff]/50" />
                ))}
                <select value={form.source} onChange={e => setForm({...form, source: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none">
                  {['manual','website','referral','square','callcentric','other'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={addLead} className="flex-1 bg-[#00f5ff] text-black py-2 rounded-lg font-semibold hover:bg-[#00f5ff]/80">Save</button>
                <button onClick={() => setShowForm(false)} className="flex-1 border border-white/20 py-2 rounded-lg hover:bg-white/5">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
