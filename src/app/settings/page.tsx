'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import TitleBar from '@/components/TitleBar'

const SECTIONS = [
  {
    title: 'API Keys',
    color: 'text-[#00f5ff]',
    fields: [
      { key: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Supabase URL', placeholder: 'https://xxxx.supabase.co' },
      { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Supabase Anon Key', placeholder: 'eyJ...' },
      { key: 'SUPABASE_SERVICE_ROLE_KEY', label: 'Supabase Service Role Key', placeholder: 'eyJ...' },
      { key: 'SQUARE_ACCESS_TOKEN', label: 'Square Access Token', placeholder: 'EAAAl...' },
      { key: 'SQUARE_LOCATION_ID', label: 'Square Location ID', placeholder: 'L...' },
      { key: 'SQUARE_ENVIRONMENT', label: 'Square Environment', placeholder: 'sandbox or production' },
      { key: 'GEMINI_API_KEY', label: 'Gemini API Key', placeholder: 'AIza...' },
      { key: 'TWILIO_ACCOUNT_SID', label: 'Twilio Account SID', placeholder: 'AC...' },
      { key: 'TWILIO_AUTH_TOKEN', label: 'Twilio Auth Token', placeholder: 'xxxx' },
      { key: 'TWILIO_FROM_NUMBER', label: 'Twilio From Number', placeholder: '+1...' },
      { key: 'TWILIO_SMS_TO', label: 'SMS Alert To Number', placeholder: '+1...' },
    ]
  },
  {
    title: 'Azure / Microsoft 365',
    color: 'text-[#7c3aed]',
    fields: [
      { key: 'AZURE_TENANT_ID', label: 'Azure Tenant ID', placeholder: 'xxxxxxxx-...' },
      { key: 'AZURE_CLIENT_ID', label: 'Azure Client ID', placeholder: 'xxxxxxxx-...' },
      { key: 'AZURE_CLIENT_SECRET', label: 'Azure Client Secret', placeholder: 'xxxx' },
      { key: 'M365_CALENDAR_EMAIL', label: 'Calendar Email', placeholder: 'vip@feelbass.vip' },
    ]
  },
  {
    title: 'PBX / Callcentric',
    color: 'text-[#00ff88]',
    fields: [
      { key: 'CALLCENTRIC_ACCOUNT', label: 'Callcentric Account', placeholder: '1777XXXXXXX' },
      { key: 'CALLCENTRIC_PASSWORD', label: 'Callcentric Password', placeholder: 'xxxx' },
      { key: 'PBX_SIP_SERVER', label: 'SIP Server', placeholder: 'callcentric.com' },
    ]
  },
]

export default function SettingsPage() {
  const [vals, setVals] = useState<Record<string,string>>({})
  const [saved, setSaved] = useState(false)

  const save = async () => {
    await fetch('/api/azure', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings: vals }) }).catch(() => {})
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex h-screen bg-[#0a0a0f]">
      <TitleBar />
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#00f5ff]">Settings</h1>
            <p className="text-[#64748b] text-sm">API keys and integration credentials — stored in .env</p>
          </div>
          <button onClick={save} className="bg-[#00f5ff] text-black font-bold px-5 py-2 rounded-lg hover:opacity-80 text-sm">
            {saved ? '✓ Saved!' : 'Save All'}
          </button>
        </div>

        <div className="space-y-6">
          {SECTIONS.map(section => (
            <div key={section.title} className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-5">
              <h2 className={`text-sm font-bold uppercase tracking-widest mb-4 ${section.color}`}>{section.title}</h2>
              <div className="grid grid-cols-2 gap-4">
                {section.fields.map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-[#64748b] block mb-1">{f.label}</label>
                    <input
                      type="password"
                      value={vals[f.key] || ''}
                      onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full bg-[#0a0a0f] border border-[#1e1e2e] text-[#e2e8f0] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#00f5ff]"
                    />
                    <p className="text-[10px] text-[#64748b] mt-0.5 font-mono">{f.key}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
