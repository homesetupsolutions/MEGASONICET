'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import TitleBar from '@/components/TitleBar'

export default function GeminiPage() {
  const [messages, setMessages] = useState<{role:'user'|'assistant', text:string}[]>([
    { role: 'assistant', text: 'Hey! I am Gemini. Ask me anything about your business — bookings, leads, payments, reminders, or anything else.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim() || loading) return
    const msg = input.trim()
    setMessages(p => [...p, { role: 'user', text: msg }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg }) })
      const data = await res.json()
      setMessages(p => [...p, { role: 'assistant', text: data.reply || 'No response.' }])
    } catch {
      setMessages(p => [...p, { role: 'assistant', text: 'Error reaching Gemini.' }])
    }
    setLoading(false)
  }

  return (
    <div className="flex h-screen bg-[#0a0a0f]">
      <TitleBar />
      <Sidebar />
      <main className="flex-1 flex flex-col mt-8 overflow-hidden">
        <div className="p-4 border-b border-[#1e1e2e] flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <h1 className="text-2xl font-bold text-[#00f5ff]">Gemini AI</h1>
            <p className="text-[#64748b] text-xs">Powered by Google Gemini — connected to your MegaSonic data</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${ m.role === 'user' ? 'bg-[#00f5ff]/20 text-white' : 'bg-[#12121a] border border-[#1e1e2e] text-[#e2e8f0]' }`}>
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl px-4 py-2">
                <span className="text-[#64748b] text-sm">Gemini is thinking...</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-[#1e1e2e] flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Ask Gemini about your bookings, leads, payments..."
            className="flex-1 bg-[#12121a] border border-[#1e1e2e] text-[#e2e8f0] rounded-lg px-4 py-2 focus:outline-none focus:border-[#00f5ff] text-sm"
          />
          <button onClick={send} disabled={loading} className="bg-[#00f5ff] text-black font-bold px-5 py-2 rounded-lg hover:opacity-80 disabled:opacity-50 text-sm">Send</button>
        </div>
      </main>
    </div>
  )
}
