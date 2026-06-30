'use client'
import Sidebar from '@/components/Sidebar'
import TitleBar from '@/components/TitleBar'
import { useState } from 'react'

export default function Dashboard() {
  const kpis = [
    { label: 'Revenue MTD', value: '$4,280', delta: '+12%', color: 'text-sonic-green' },
    { label: 'Bookings Today', value: '3', delta: '+1', color: 'text-sonic-accent' },
    { label: 'Open Leads', value: '14', delta: '+3', color: 'text-yellow-400' },
    { label: 'Reminders Due', value: '2', delta: 'urgent', color: 'text-sonic-red' },
  ]

  const activity = [
    { time: '11:45 AM', text: 'Booking #B-0041 confirmed — FeelBassVIP Headset x4' },
    { time: '10:20 AM', text: 'Square payment received — $320.00' },
    { time: '9:05 AM', text: 'Reminder sent — Job #J-0039 starts in 26h' },
    { time: 'Yesterday', text: 'New lead scanned — HomeSetup consultation' },
  ]

  return (
    <div className="flex h-screen bg-[#0a0a0f]">
      <TitleBar />
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 mt-8">
        <h1 className="text-2xl font-bold text-[#00f5ff] mb-6">Command Center</h1>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {kpis.map((k) => (
            <div key={k.label} className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4 hover:border-[#00f5ff] transition-colors">
              <p className="text-[#64748b] text-xs mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-xs text-[#64748b] mt-1">{k.delta}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-[#00f5ff] mb-3">Recent Activity</h2>
            <div className="space-y-3">
              {activity.map((a, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-[#64748b] text-xs w-20 shrink-0">{a.time}</span>
                  <span className="text-sm text-[#e2e8f0]">{a.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-[#7c3aed] mb-3">Hunt for Money</h2>
            <div className="space-y-2">
              <div className="p-2 bg-[#0a0a0f] rounded-lg border border-[#1e1e2e]">
                <p className="text-xs text-[#00ff88]">Follow up: Lead from March 12</p>
                <p className="text-xs text-[#64748b]">Potential: $800 install job</p>
              </div>
              <div className="p-2 bg-[#0a0a0f] rounded-lg border border-[#1e1e2e]">
                <p className="text-xs text-[#00ff88]">Upsell: FeelBassVIP client renewal</p>
                <p className="text-xs text-[#64748b]">Due: This week</p>
              </div>
              <div className="p-2 bg-[#0a0a0f] rounded-lg border border-[#1e1e2e]">
                <p className="text-xs text-yellow-400]">Unpaid invoice: #INV-0038</p>
                <p className="text-xs text-[#64748b]">Amount: $640.00</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
