'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import TitleBar from '@/components/TitleBar'

const DEMO_PAYMENTS = [
  { id: 'SQ-001', amount: 320.00, name: 'Marcus Rivera', status: 'COMPLETED', created: '2026-06-30T14:22:00Z', method: 'Card' },
  { id: 'SQ-002', amount: 640.00, name: 'Sarah Chen', status: 'COMPLETED', created: '2026-06-29T10:15:00Z', method: 'Card' },
  { id: 'SQ-003', amount: 400.00, name: 'Devon Mills', status: 'PENDING', created: '2026-06-28T18:00:00Z', method: 'Invoice' },
  { id: 'SQ-004', amount: 150.00, name: 'Alex Nguyen', status: 'FAILED', created: '2026-06-27T09:00:00Z', method: 'Card' },
]

const STATUS_COLORS: Record<string,string> = {
  COMPLETED: 'text-[#00ff88] bg-[#00ff88]/10',
  PENDING: 'text-yellow-400 bg-yellow-400/10',
  FAILED: 'text-[#ff3366] bg-[#ff3366]/10',
}

export default function SquarePage() {
  const [payments, setPayments] = useState(DEMO_PAYMENTS)
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch('/api/square')
      .then(r => r.json())
      .then(d => { if (d?.payments?.length) setPayments(d.payments) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const sendInvoice = async () => {
    if (!amount || !note) return
    setSending(true)
    setMsg('')
    const res = await fetch('/api/square', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount), note }),
    })
    const data = await res.json()
    setSending(false)
    setMsg(res.ok ? `Invoice created: ${data.id || 'OK'}` : data.error || 'Error')
    if (res.ok) { setAmount(''); setNote('') }
  }

  const total = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="flex h-screen bg-[#0a0a0f]">
      <TitleBar />
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#00f5ff]">Square</h1>
            <p className="text-[#64748b] text-sm">Payments & invoices via Square</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#64748b]">Total Collected</p>
            <p className="text-2xl font-bold text-[#00ff88]">${total.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-[#12121a] border border-[#7c3aed]/40 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-bold text-[#7c3aed] mb-3 uppercase tracking-widest">Create Invoice / Payment Link</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-[#64748b]">Amount (CAD)</label>
              <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="0.00" className="w-full bg-[#0a0a0f] border border-[#1e1e2e] text-[#e2e8f0] rounded px-3 py-1.5 text-sm mt-1" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-[#64748b]">Note / Description</label>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="FeelBassVIP rental — 4 headsets" className="w-full bg-[#0a0a0f] border border-[#1e1e2e] text-[#e2e8f0] rounded px-3 py-1.5 text-sm mt-1" />
            </div>
          </div>
          {msg && <p className="text-xs text-[#00f5ff] mt-2">{msg}</p>}
          <button onClick={sendInvoice} disabled={sending} className="mt-3 bg-[#7c3aed] text-white font-bold px-6 py-2 rounded-lg hover:opacity-80 disabled:opacity-50 text-sm">
            {sending ? 'Sending...' : 'Create Invoice'}
          </button>
        </div>

        <h2 className="text-sm font-semibold text-[#64748b] uppercase tracking-widest mb-3">Recent Transactions</h2>
        <div className="space-y-2">
          {payments.map(p => (
            <div key={p.id} className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4 flex items-center justify-between hover:border-[#00f5ff]/30 transition-colors">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-[#64748b]">{p.id}</span>
                <span className="font-semibold text-[#e2e8f0]">{p.name}</span>
                <span className="text-xs text-[#64748b]">{p.method}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-[#00f5ff]">${p.amount.toFixed(2)}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || 'text-[#64748b]'}`}>{p.status}</span>
                <span className="text-xs text-[#64748b]">{new Date(p.created).toLocaleDateString('en-CA')}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
