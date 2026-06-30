'use client'
import { useState, useEffect } from 'react'

const DTMF_KEYS = ['1','2','3','4','5','6','7','8','9','*','0','#']

export default function PBXPage() {
  const [status, setStatus] = useState<'idle'|'connecting'|'active'|'error'>('idle')
  const [dialInput, setDialInput] = useState('')
  const [callLog, setCallLog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [timer, setTimer] = useState<any>(null)

  useEffect(() => {
    fetchCallLog()
    return () => { if (timer) clearInterval(timer) }
  }, [])

  async function fetchCallLog() {
    setLoading(true)
    try {
      const res = await fetch('/api/pbx')
      const data = await res.json()
      setCallLog(Array.isArray(data) ? data : [])
    } catch { setCallLog([]) }
    setLoading(false)
  }

  function startTimer() {
    setElapsed(0)
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    setTimer(t)
  }

  function stopTimer() {
    if (timer) clearInterval(timer)
    setTimer(null)
    setElapsed(0)
  }

  async function initiateCall() {
    if (!dialInput.trim()) return
    setStatus('connecting')
    try {
      const res = await fetch('/api/pbx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'call', number: dialInput })
      })
      const data = await res.json()
      if (data.success) {
        setStatus('active')
        startTimer()
      } else {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 3000)
      }
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  function hangup() {
    setStatus('idle')
    stopTimer()
    fetchCallLog()
  }

  function pressKey(k: string) {
    setDialInput(d => d + k)
  }

  const fmtTime = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const statusColors: Record<string,string> = {
    idle: 'text-gray-400',
    connecting: 'text-yellow-400',
    active: 'text-green-400',
    error: 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#00f5ff]">PBX / Phone</h1>
          <p className="text-gray-400 mt-1">Callcentric VoIP Integration</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dialer */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Dialer</h2>
              <span className={`text-sm capitalize ${statusColors[status]}`}>{status}</span>
            </div>

            {status === 'active' && (
              <div className="text-center py-3 mb-4">
                <div className="text-3xl font-mono text-green-400">{fmtTime(elapsed)}</div>
                <div className="text-sm text-gray-400 mt-1">Connected to {dialInput}</div>
              </div>
            )}

            <input
              value={dialInput}
              onChange={e => setDialInput(e.target.value)}
              placeholder="Enter phone number"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center text-xl font-mono placeholder-gray-600 focus:outline-none focus:border-[#00f5ff]/50 mb-4"
            />

            <div className="grid grid-cols-3 gap-2 mb-4">
              {DTMF_KEYS.map(k => (
                <button key={k} onClick={() => pressKey(k)}
                  className="py-3 bg-white/5 border border-white/10 rounded-xl text-lg font-mono hover:bg-white/10 active:scale-95 transition-all">
                  {k}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              {status === 'active' ? (
                <button onClick={hangup}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-all">
                  Hang Up
                </button>
              ) : (
                <button onClick={initiateCall} disabled={!dialInput.trim() || status === 'connecting'}
                  className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 transition-all">
                  {status === 'connecting' ? 'Connecting...' : 'Call'}
                </button>
              )}
              <button onClick={() => setDialInput('')}
                className="px-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                CLR
              </button>
            </div>
          </div>

          {/* Call Log */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Call Log</h2>
              <button onClick={fetchCallLog} className="text-sm text-[#00f5ff] hover:underline">Refresh</button>
            </div>
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading...</div>
            ) : callLog.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No call records.</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {callLog.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-lg">
                    <div>
                      <div className="font-mono text-sm">{c.number || c.from || '—'}</div>
                      <div className="text-xs text-gray-400">{c.direction || 'outbound'} · {c.duration ? fmtTime(c.duration) : '—'}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-0.5 rounded-full border ${
                        c.status === 'answered' ? 'text-green-400 bg-green-400/10 border-green-400/30' :
                        c.status === 'missed' ? 'text-red-400 bg-red-400/10 border-red-400/30' :
                        'text-gray-400 bg-gray-400/10 border-gray-400/30'
                      }`}>{c.status || 'completed'}</div>
                      <div className="text-xs text-gray-500 mt-1">{c.date ? new Date(c.date).toLocaleDateString() : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
