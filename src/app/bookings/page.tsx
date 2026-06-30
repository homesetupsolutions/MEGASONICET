'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import TitleBar from '@/components/TitleBar'
import { supabase, DEMO_MODE } from '@/lib/supabase'

const DEMO_BOOKINGS = [
  { id: 'B-0041', client_name: 'Marcus Rivera', service: 'FeelBassVIP Headset x4', event_date: '2026-07-04', start_time: '14:00', end_time: '18:00', status: 'confirmed', deposit: 150, total: 600, notes: 'Birthday party' },
  { id: 'B-0040', client_name: 'Sarah Chen', service: 'HomeSetup TV Mount + Sound', event_date: '2026-07-02', start_time: '10:00', end_time: '13:00', status: 'pending', deposit: 0, total: 320, notes: '' },
  { id: 'B-0039', client_name: 'Devon Mills', service: 'FeelBassVIP Headset x2', event_date: '2026-07-01', start_time: '18:00', end_time: '22:00', status: 'confirmed', deposit: 100, total: 400, notes: 'Corporate event' },
]

const STATUS_COLORS: Record<string,string> = { confirmed: 'text-[#00ff88]', pending: 'text-yellow-400', cancelled: 'text-[#ff3366]', completed: 'text-[#64748b]' }

export default function BookingsPage() {
  const [bookings, setBookings] = useState(DEMO_BOOKINGS)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ client_name:'', service:'', event_date:'', start_time:'', end_time:'', total:'', deposit:'', notes:'' })

  useEffect(() => {
    if (DEMO_MODE) return
    supabase.from('bookings').select('*').order('event_date').then(({ data }) => { if (data) setBookings(data as any) })
  }, [])

  const handleSubmit = async () => {
    if (!form.client_name || !form.event_date) return
    if (!DEMO_MODE) {
      await supabase.from('bookings').insert([{ ...form, status: 'pending', total: Number(form.total), deposit: Number(form.deposit) }])
    } else {
      setBookings(b => [{ id: `B-${Date.now()}`, ...form, status: 'pending', total: Number(form.total), deposit: Number(form.deposit) } as any, ...b])
    }
    setShowForm(false)
    setForm({ client_name:'', service:'', event_date:'', start_time:'', end_time:'', total:'', deposit:'', notes:'' })
  }

  return (
    <div className="flex h-screen bg-[#0a0a0f]">
      <TitleBar /><Sidebar />
      <main className="flex-1 overflow-y-auto p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#00f5ff]">Bookings</h1>
          {DEMO_MODE && <span className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-2 py-1 rounded">Demo Mode</span>}
          <button onClick={() => setShowForm(!showForm)} className="bg-[#00f5ff] text-black font-bold px-4 py-2 rounded-lg hover:opacity-80">+ New Booking</button>
        </div>
        {showForm && (
          <div className="bg-[#12121a] border border-[#7c3aed] rounded-xl p-4 mb-6 grid grid-cols-3 gap-3">
            {[['Client Name','client_name','text'],['Service','service','text'],['Event Date','event_date','date'],['Start Time','start_time','time'],['End Time','end_time','time'],['Total ($)','total','number'],['Deposit ($)','deposit','number'],['Notes','notes','text']].map(([label,field,type]) => (
              <div key={field}><label className="text-xs text-[#64748b]">{label}</label>
                <input type={type} value={(form as any)[field]} onChange={e => setForm(f => ({...f,[field]:e.target.value}))} className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded p-2 text-sm text-[#e2e8f0] mt-1" /></div>
            ))}
            <div className="col-span-3 flex gap-2">
              <button onClick={handleSubmit} className="flex-1 bg-[#00f5ff] text-black font-bold py-2 rounded-lg">Save Booking</button>
              <button onClick={() => setShowForm(false)} className="px-4 bg-[#1e1e2e] text-[#64748b] rounded-lg">Cancel</button>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4 hover:border-[#00f5ff]/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-[#64748b] font-mono text-sm">{b.id}</span>
                  <span className="font-semibold text-[#e2e8f0]">{b.client_name}</span>
                  <span className="text-sm text-[#64748b]">{b.service}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#e2e8f0]">{b.event_date} {b.start_time}–{b.end_time}</span>
                  <span className="text-sm font-bold text-[#00f5ff]">${b.total}</span>
                  <span className={`text-xs font-bold uppercase ${STATUS_COLORS[b.status] || 'text-[#64748b]'}`}>{b.status}</span>
                </div>
              </div>
              {b.notes && <p className="text-xs text-[#64748b] mt-1 ml-20">{b.notes}</p>}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
