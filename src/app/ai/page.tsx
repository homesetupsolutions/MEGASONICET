'use client'
import { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant', text: string }

const QUICK_PROMPTS = [
  'Summarize today\'s bookings',
  'Show recent leads pipeline',
  'Draft a follow-up email for a lead',
  'What\'s my total revenue this month?',
  'Create a reminder for tomorrow'
]

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hey! I am your Gemini AI assistant. Ask me about bookings, leads, payments, reminders, or anything about your business.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (msg?: string) => {
    const text = (msg || input).trim()
    if (!text || loading) return
    setMessages(p => [...p, { role: 'user', text }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      })
      const data = await res.json()
      setMessages(p => [...p, { role: 'assistant', text: data.reply || data.error || 'No response.' }])
    } catch {
      setMessages(p => [...p, { role: 'assistant', text: 'Error reaching Gemini. Check your API key.' }])
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#00f5ff]">AI Assistant</h1>
          <p className="text-gray-400 text-sm">Powered by Google Gemini</p>
        </div>
        <button onClick={() => setMessages([{ role: 'assistant', text: 'New conversation started. How can I help?' }])}
          className="text-sm text-gray-400 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5">
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-4xl w-full mx-auto">
        {messages.length === 1 && (
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-3">Quick prompts:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map(p => (
                <button key={p} onClick={() => send(p)}
                  className="text-sm px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-[#00f5ff]/10 hover:border-[#00f5ff]/30 transition-all">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-[#00f5ff]/20 border border-[#00f5ff]/30 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-100'
              }`}>
                {m.role === 'assistant' && <span className="text-[#00f5ff] text-xs font-semibold block mb-1">Gemini</span>}
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#00f5ff] rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                  <span className="w-2 h-2 bg-[#00f5ff] rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                  <span className="w-2 h-2 bg-[#00f5ff] rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-4 max-w-4xl w-full mx-auto">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Ask anything about your business..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00f5ff]/50"
          />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            className="px-5 bg-[#00f5ff] text-black rounded-xl font-semibold disabled:opacity-50 hover:bg-[#00f5ff]/80 transition-all">
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
