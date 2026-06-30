'use client'
import { useState, useEffect } from 'react'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const [filter, setFilter] = useState('all')
  const [showCharge, setShowCharge] = useState(false)
  const [chargeForm, setChargeForm] = useState({ amount: '', note: '', email: '' })
  const [chargeResult, setChargeResult] = useState<any>(null)
  const [charging, setCharging] = useState(false)

  useEffect(() => { fetchPayments() }, [])

  async function fetchPayments() {
    setLoading(true)
    try {
      const res = await fetch('/api/payments')
      const data = await res.json()
      setPayments(Array.isArray(data) ? data : [])
      if (data[0]?.id?.startsWith('DEMO')) setIsDemo(true)
    } catch { setPayments([]) }
    setLoading(false)
  }

  async function createCharge() {
    setCharging(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(parseFloat(chargeForm.amount) * 100),
          currency: 'CAD',
          note: chargeForm.note,
          email: chargeForm.email
        })
      })
      const data = await res.json()
      setChargeResult(data)
      fetchPayments()
    } catch (e) { setChargeResult({ error: 'Failed' }) }
    setCharging(false)
  }

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`
  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter)
  const total = payments.reduce((s, p) => s + (p.amount_money?.amount || 0) / 100, 0)
  const completed = payments.filter(p => p.status === 'COMPLETED').length

  const statusColor: Record<string,string> = {
    COMPLETED: 'text-green-400 bg-green-400/10 border-green-400/30',
    FAILED: 'text-red-400 bg-red-400/10 border-red-400/30',
    PENDING: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    CANCELED: 'text-gray-400 bg-gray-400/10 border-gray-400/30'
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#00f5ff]">Payments</h1>
            <p className="text-gray-400 mt-1">Square POS Integration{isDemo ? ' — Demo Mode' : ''}</p>
          </div>
          <button onClick={() => setShowCharge(true)} className="bg-[#00f5ff] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#00f5ff]/80">
            + New Charge
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="text-gray-400 text-sm mb-1">Total Volume</div>
            <div className="text-2xl font-bold text-green-400">${total.toFixed(2)}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="text-gray-400 text-sm mb-1">Completed</div>
            <div className="text-2xl font-bold text-[#00f5ff]">{completed}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="text-gray-400 text-sm mb-1">Total Records</div>
            <div className="text-2xl font-bold">{payments.length}</div>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          {['all','COMPLETED','FAILED','PENDING'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                filter === s ? 'bg-[#00f5ff]/20 border-[#00f5ff] text-[#00f5ff]' : 'border-white/10 text-gray-400 hover:border-white/30'
              }`}>{s}</button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading payments...</div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10 text-gray-400">
                <th className="text-left px-5 py-3">ID</th>
                <th className="text-left px-5 py-3">Amount</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Note</th>
              </tr></thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-500">No payments found.</td></tr>
                )}
                {filtered.map((p: any) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="px-5 py-3 font-mono text-xs text-gray-400">{p.id?.slice(0,12)}...</td>
                    <td className="px-5 py-3 text-green-400 font-semibold">{fmt(p.amount_money?.amount || 0)} {p.amount_money?.currency}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[p.status] || 'text-gray-400 bg-gray-400/10 border-gray-400/30'}`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                    <td className="px-5 py-3 text-gray-400">{p.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showCharge && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
              <h2 className="text-xl font-bold text-[#00f5ff] mb-4">New Charge</h2>
              {chargeResult ? (
                <div className="text-center py-4">
                  {chargeResult.error ? (
                    <div className="text-red-400">{chargeResult.error}</div>
                  ) : (
                    <div className="text-green-400">Charge created!<br/><span className="text-xs text-gray-400">{chargeResult.id}</span></div>
                  )}
                  <button onClick={() => { setShowCharge(false); setChargeResult(null); setChargeForm({ amount: '', note: '', email: '' }) }}
                    className="mt-4 px-6 py-2 bg-[#00f5ff] text-black rounded-lg font-semibold">Done</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input placeholder="Amount (CAD)" value={chargeForm.amount} onChange={e => setChargeForm({...chargeForm, amount: e.target.value})}
                    type="number" className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00f5ff]/50" />
                  <input placeholder="Note" value={chargeForm.note} onChange={e => setChargeForm({...chargeForm, note: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00f5ff]/50" />
                  <input placeholder="Customer email (optional)" value={chargeForm.email} onChange={e => setChargeForm({...chargeForm, email: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00f5ff]/50" />
                  <div className="flex gap-3 mt-2">
                    <button onClick={createCharge} disabled={charging || !chargeForm.amount}
                      className="flex-1 bg-[#00f5ff] text-black py-2 rounded-lg font-semibold disabled:opacity-50">{charging ? 'Processing...' : 'Charge'}</button>
                    <button onClick={() => setShowCharge(false)} className="flex-1 border border-white/20 py-2 rounded-lg hover:bg-white/5">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
