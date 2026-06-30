'use client'
import { useState } from 'react'

const SECTIONS = [
  { id: 'general', label: 'General' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'billing', label: 'Billing' },
]

const ENV_KEYS = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Supabase URL', section: 'integrations', type: 'url' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Supabase Anon Key', section: 'integrations', type: 'password' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', label: 'Supabase Service Role Key', section: 'integrations', type: 'password' },
  { key: 'SQUARE_ACCESS_TOKEN_FEELBASSVIP', label: 'Square Token (FeelBassVIP)', section: 'integrations', type: 'password' },
  { key: 'SQUARE_ACCESS_TOKEN_HSS', label: 'Square Token (HSS)', section: 'integrations', type: 'password' },
  { key: 'SQUARE_LOCATION_ID_FEELBASSVIP', label: 'Square Location ID (FeelBassVIP)', section: 'integrations', type: 'text' },
  { key: 'SQUARE_LOCATION_ID_HSS', label: 'Square Location ID (HSS)', section: 'integrations', type: 'text' },
  { key: 'GEMINI_API_KEY', label: 'Gemini API Key', section: 'integrations', type: 'password' },
  { key: 'CALLCENTRIC_ACCOUNT', label: 'Callcentric Account', section: 'integrations', type: 'text' },
  { key: 'CALLCENTRIC_SIP_PASSWORD', label: 'Callcentric SIP Password', section: 'integrations', type: 'password' },
  { key: 'AZURE_STORAGE_CONNECTION_STRING', label: 'Azure Storage Connection', section: 'integrations', type: 'password' },
  { key: 'AZURE_STORAGE_CONTAINER', label: 'Azure Storage Container', section: 'integrations', type: 'text' },
  { key: 'TWILIO_ACCOUNT_SID', label: 'Twilio SID', section: 'integrations', type: 'text' },
  { key: 'TWILIO_AUTH_TOKEN', label: 'Twilio Auth Token', section: 'integrations', type: 'password' },
  { key: 'TWILIO_PHONE_NUMBER', label: 'Twilio Phone Number', section: 'integrations', type: 'text' },
  { key: 'NOTIFICATION_EMAIL', label: 'Notification Email', section: 'notifications', type: 'email' },
  { key: 'SMTP_HOST', label: 'SMTP Host', section: 'notifications', type: 'text' },
  { key: 'SMTP_PORT', label: 'SMTP Port', section: 'notifications', type: 'text' },
  { key: 'SMTP_USER', label: 'SMTP User', section: 'notifications', type: 'text' },
  { key: 'SMTP_PASS', label: 'SMTP Password', section: 'notifications', type: 'password' },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general')
  const [showKey, setShowKey] = useState<Record<string,boolean>>({})
  const [copied, setCopied] = useState('')

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const sectionKeys = ENV_KEYS.filter(k => k.section === activeSection)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#00f5ff]">Settings</h1>
          <p className="text-gray-400 mt-1">MEGASONICET configuration and integrations</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-48 shrink-0">
            <nav className="space-y-1">
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                    activeSection === s.id
                      ? 'bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}>{s.label}</button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeSection === 'general' && (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Business Info</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Business 1', value: 'FeelBassVIP', sub: 'Sensory Experience Rentals' },
                      { label: 'Business 2', value: 'Home Setup Solutions', sub: 'Technology Installation' },
                      { label: 'Platform', value: 'MEGASONICET', sub: 'Unified Command Center' },
                      { label: 'Region', value: 'Calgary, AB, Canada', sub: 'MST / MDT Timezone' },
                    ].map(item => (
                      <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                        <div className="font-semibold text-[#00f5ff]">{item.value}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold mb-4">System Status</h2>
                  <div className="space-y-3">
                    {[
                      { name: 'Supabase DB', key: 'NEXT_PUBLIC_SUPABASE_URL' },
                      { name: 'Square POS', key: 'SQUARE_ACCESS_TOKEN_FEELBASSVIP' },
                      { name: 'Gemini AI', key: 'GEMINI_API_KEY' },
                      { name: 'Callcentric VoIP', key: 'CALLCENTRIC_ACCOUNT' },
                      { name: 'Azure Storage', key: 'AZURE_STORAGE_CONNECTION_STRING' },
                    ].map(svc => (
                      <div key={svc.name} className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                        <span className="text-sm">{svc.name}</span>
                        <span className="text-xs px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">Configure in Vercel</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'integrations' && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-2">API Keys & Integrations</h2>
                <p className="text-sm text-gray-400 mb-6">These values are managed as environment variables in Vercel. Never commit secrets to GitHub.</p>
                <div className="space-y-4">
                  {sectionKeys.map(k => (
                    <div key={k.key}>
                      <label className="text-xs text-gray-400 block mb-1">{k.label}</label>
                      <div className="flex gap-2">
                        <div className="flex-1 px-4 py-2.5 bg-black/30 border border-white/10 rounded-lg font-mono text-xs text-gray-300 flex items-center">
                          {showKey[k.key] ? k.key : '•'.repeat(32)}
                        </div>
                        <button onClick={() => setShowKey(p => ({...p, [k.key]: !p[k.key]}))} className="px-3 py-2 border border-white/10 rounded-lg text-xs hover:bg-white/10 text-gray-400">
                          {showKey[k.key] ? 'Hide' : 'Show'}
                        </button>
                        <button onClick={() => copyToClipboard(k.key, k.key)} className="px-3 py-2 border border-white/10 rounded-lg text-xs hover:bg-white/10 text-gray-400">
                          {copied === k.key ? 'Copied!' : 'Copy Key'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-xl">
                  <p className="text-xs text-yellow-400">Set these in: <a href="https://vercel.com" target="_blank" className="underline">Vercel Dashboard</a> &rarr; Project &rarr; Settings &rarr; Environment Variables</p>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-2">Notification Settings</h2>
                <p className="text-sm text-gray-400 mb-6">Configure email and SMS notification channels.</p>
                <div className="space-y-4">
                  {ENV_KEYS.filter(k => k.section === 'notifications').map(k => (
                    <div key={k.key}>
                      <label className="text-xs text-gray-400 block mb-1">{k.label}</label>
                      <div className="px-4 py-2.5 bg-black/30 border border-white/10 rounded-lg font-mono text-xs text-gray-300">{k.key}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-blue-400/5 border border-blue-400/20 rounded-xl">
                  <p className="text-xs text-blue-400">Twilio SMS and email alerts are triggered from reminder and booking API routes automatically.</p>
                </div>
              </div>
            )}

            {activeSection === 'billing' && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">Billing & Plans</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {[
                    { name: 'Vercel', plan: 'Hobby', status: 'Active', color: 'text-green-400' },
                    { name: 'Supabase', plan: 'Free Tier', status: 'Active', color: 'text-green-400' },
                    { name: 'Square', plan: 'No monthly fee', status: 'Active', color: 'text-green-400' },
                    { name: 'Callcentric', plan: 'Pay-as-you-go', status: 'Active', color: 'text-green-400' },
                    { name: 'Gemini API', plan: 'Free tier (1M tokens/day)', status: 'Active', color: 'text-green-400' },
                    { name: 'Twilio', plan: 'Pay-as-you-go', status: 'Optional', color: 'text-yellow-400' },
                  ].map(b => (
                    <div key={b.name} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{b.name}</div>
                        <div className="text-xs text-gray-400">{b.plan}</div>
                      </div>
                      <span className={`text-xs ${b.color}`}>{b.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
