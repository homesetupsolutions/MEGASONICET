'use client'
import { useState, useEffect } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => { fetchPayments() }, [])

  async function fetchPayments() {
    setLoading(true)
    const res = await fetch('/api/payments')
    const data = await res.json()
    setPayments(Array.isArray(data) ? data : [])
    if (data[0]?.id?.startsWith('DEMO')) setIsDemo(true)
    setLoading(false)
  }

  const total = payments.reduce((s, p) => s + (p.amount_money?.amount || 0) / 100, 0)
  const completed = payments.filter(p => p.status === 'COMPLETED').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-[#64748b] text-sm">Square POS Integration{isDemo ? ' — Demo Mode' : ''}</p>
        </div>
        {isDemo && (
          <span className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs px-3 py-1 rounded-full">DEMO MODE</span>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(total), color: 'text-[#00f5ff]' },
          { label: 'Transactions', value: payments.length.toString(), color: 'text-white' },
          { label: 'Completed', value: completed.toString(), color: 'text-green-400' }
        ].map(k => (
          <div key={k.label} className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4">
            <p className="text-[#64748b] text-xs uppercase tracking-wider mb-1">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {loading ? <p className="text-[#64748b] text-sm">Loading payments...</p> : (
        <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                {['Payment ID','Amount','Status','Date','Note'].map(h => (
                  <th key={h} className="text-left text-[#64748b] text-xs uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-[#64748b] text-sm">No payments found</td></tr>
              )}
              {payments.map(p => (
                <tr key={p.id} className="border-b border-[#1e1e2e]/50 hover:bg-[#00f5ff]/5 transition-colors">
                  <td className="px-4 py-3 text-[#e2e8f0] font-mono text-xs">{p.id?.slice(0,12)}...</td>
                  <td className="px-4 py-3 text-[#00f5ff] font-bold">{formatCurrency((p.amount_money?.amount || 0) / 100)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${ p.status === 'COMPLETED' ? 'text-green-400 bg-green-400/10 border-green-400/30' : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[#64748b] text-xs">{p.created_at ? formatDate(p.created_at) : '—'}</td>
                  <td className="px-4 py-3 text-[#64748b] text-xs">{p.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
