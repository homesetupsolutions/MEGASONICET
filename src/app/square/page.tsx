'use client'
import { useState, useEffect } from 'react'

const BUSINESSES: ('FEELBASSVIP' | 'HSS')[] = ['FEELBASSVIP', 'HSS']

export default function SquarePage() {
  const [business, setBusiness] = useState<'FEELBASSVIP' | 'HSS'>('FEELBASSVIP')
  const [payments, setPayments] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showLink, setShowLink] = useState(false)
  const [linkForm, setLinkForm] = useState({ amount: '', description: '', email: '' })
  const [linkResult, setLinkResult] = useState<any>(null)
  const [creating, setCreating] = useState(false)
  const [tab, setTab] = useState<'payments'|'locations'|'link'>('payments')

  useEffect(() => { fetchData() }, [business])

  async function fetchData() {
    setLoading(true)
    try {
      const [pRes, lRes] = await Promise.all([
        fetch(`/api/square?business=${business}`),
        fetch(`/api/square?action=locations&business=${business}`)
      ])
      const pData = await pRes.json()
      const lData = await lRes.json()
      setPayments(Array.isArray(pData) ? pData : pData.payments || [])
      setLocations(lData.locations || [])
    } catch { setPayments([]); setLocations([]) }
    setLoading(false)
  }

  async function createLink() {
    if (!linkForm.amount) return
    setCreating(true)
    try {
      const res = await fetch('/api/square', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business,
          amount_cents: Math.round(parseFloat(linkForm.amount) * 100),
          currency: 'CAD',
          description: linkForm.description || `${business} Payment`,
          customer_email: linkForm.email || undefined
        })
      })
      const data = await res.json()
      setLinkResult(data)
    } catch { setLinkResult({ error: 'Failed' }) }
    setCreating(false)
  }

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`
  const totalVolume = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + (p.amount_money?.amount || 0) / 100, 0)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#00f5ff]">Square POS</h1>
            <p className="text-gray-400 mt-1">Payments and checkout links</p>
          </div>
          <div className="flex gap-2">
            {BUSINESSES.map(b => (
              <button key={b} onClick={() => setBusiness(b)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  business === b ? 'bg-[#00f5ff] text-black' : 'border border-white/10 text-gray-400 hover:bg-white/10'
                }`}>{b}</button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Completed Volume</div>
            <div className="text-xl font-bold text-green-400">${totalVolume.toFixed(2)} CAD</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Transactions</div>
            <div className="text-xl font-bold">{payments.length}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Locations</div>
            <div className="text-xl font-bold text-[#00f5ff]">{locations.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {(['payments','locations','link'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm capitalize border transition-all ${
                tab === t ? 'bg-[#00f5ff]/20 border-[#00f5ff] text-[#00f5ff]' : 'border-white/10 text-gray-400 hover:border-white/30'
              }`}>{t === 'link' ? 'Create Link' : t}</button>
          ))}
        </div>

        {loading && <div className="text-center py-12 text-gray-500">Loading Square data...</div>}

        {!loading && tab === 'payments' && (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10 text-gray-400">
                <th className="text-left px-5 py-3">ID</th>
                <th className="text-left px-5 py-3">Amount</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Date</th>
              </tr></thead>
              <tbody>
                {payments.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-gray-500">No payments.</td></tr>}
                {payments.map((p: any) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-5 py-3 font-mono text-xs text-gray-400">{p.id?.slice(0,14)}...</td>
                    <td className="px-5 py-3 text-green-400 font-semibold">{fmt(p.amount_money?.amount || 0)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        p.status === 'COMPLETED' ? 'text-green-400 bg-green-400/10 border-green-400/30' :
                        p.status === 'FAILED' ? 'text-red-400 bg-red-400/10 border-red-400/30' :
                        'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
                      }`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === 'locations' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {locations.length === 0 && <div className="text-gray-500 col-span-2 py-12 text-center">No locations found.</div>}
            {locations.map((l: any) => (
              <div key={l.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="font-semibold text-[#00f5ff]">{l.name}</div>
                <div className="text-xs text-gray-400 mt-1 font-mono">{l.id}</div>
                {l.address && <div className="text-sm text-gray-300 mt-2">{l.address.address_line_1}, {l.address.locality}</div>}
                <div className="text-xs text-gray-500 mt-1">{l.status} · {l.currency}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'link' && (
          <div className="max-w-md">
            {linkResult ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                {linkResult.error ? (
                  <div className="text-red-400">{linkResult.error}</div>
                ) : (
                  <>
                    <div className="text-green-400 font-semibold mb-3">Payment link created!</div>
                    {linkResult.url && (
                      <a href={linkResult.url} target="_blank" rel="noopener noreferrer"
                        className="block w-full px-4 py-3 bg-[#00f5ff]/10 border border-[#00f5ff]/30 rounded-lg text-[#00f5ff] text-sm break-all hover:bg-[#00f5ff]/20">
                        {linkResult.url}
                      </a>
                    )}
                    {linkResult.demo && <p className="text-xs text-gray-500 mt-2">Demo mode - configure Square API keys in Vercel</p>}
                  </>
                )}
                <button onClick={() => { setLinkResult(null); setLinkForm({ amount:'', description:'', email:'' }) }}
                  className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20">Create Another</button>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold">Generate Payment Link</h2>
                <input type="number" placeholder="Amount (CAD)" value={linkForm.amount} onChange={e => setLinkForm({...linkForm, amount: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00f5ff]/50" />
                <input placeholder="Description" value={linkForm.description} onChange={e => setLinkForm({...linkForm, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00f5ff]/50" />
                <input type="email" placeholder="Customer email (optional)" value={linkForm.email} onChange={e => setLinkForm({...linkForm, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00f5ff]/50" />
                <button onClick={createLink} disabled={creating || !linkForm.amount}
                  className="w-full bg-[#00f5ff] text-black py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-[#00f5ff]/80">
                  {creating ? 'Creating...' : 'Generate Link'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
