'use client'
import { useState, useEffect, useRef } from 'react'
import { pbx, PBXState, CallRecord } from '@/lib/pbx'

const EXTENSIONS = [
  { ext: '100', label: 'CALL NEW', full: '17778140621100' },
  { ext: '101', label: 'HSS Customer Service', full: '17778140621101' },
  { ext: '102', label: 'Calgary Office', full: '17778140621102' },
  { ext: '103', label: 'HSS Field Tech', full: '17778140621103' },
  { ext: '104', label: 'FEELBASSVIP SYSTEM', full: '17778140621104' },
  { ext: '105', label: 'FEELBASSVIP CONF', full: '17778140621105' },
  { ext: '106', label: 'AI Line', full: '17778140621106' },
  { ext: '107', label: 'FEELBASSVIP Mobile', full: '17778140621107' },
]

const DTMF_KEYS = ['1','2','3','4','5','6','7','8','9','*','0','#']

export default function PhoneDialer() {
  const [pbxState, setPbxState] = useState<PBXState>('unregistered')
  const [dialInput, setDialInput] = useState('')
  const [activeCall, setActiveCall] = useState<CallRecord | null>(null)
  const [callLog, setCallLog] = useState<CallRecord[]>([])
  const [muted, setMuted] = useState(false)
  const [selectedExt, setSelectedExt] = useState('100')
  const [password, setPassword] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [error, setError] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    pbx.on('stateChange', (s: PBXState) => setPbxState(s))
    pbx.on('callConnected', (c: CallRecord) => { setActiveCall(c); setCallLog(pbx.getCallLog()) })
    pbx.on('callEnded', () => { setActiveCall(null); setCallLog(pbx.getCallLog()) })
    pbx.on('outboundCall', (c: CallRecord) => { setActiveCall(c) })
    pbx.on('inboundCall', (c: CallRecord, offer: any) => {
      setActiveCall(c)
      if (window.confirm(`Inbound call from ${c.remoteNumber}. Answer?`)) pbx.answer(offer)
      else pbx.hangup()
    })
    pbx.on('remoteAudio', (stream: MediaStream) => {
      if (audioRef.current) { audioRef.current.srcObject = stream; audioRef.current.play() }
    })
    pbx.on('error', (msg: string) => setError(msg))
    return () => {}
  }, [])

  function connect() {
    const ext = EXTENSIONS.find(e => e.ext === selectedExt)
    if (!ext || !password) { setError('Select extension and enter password'); return }
    setError('')
    pbx.connect({
      wsUrl: process.env.NEXT_PUBLIC_PBX_WS_URL || 'wss://sip.callcentric.com:8089/ws',
      extension: ext.full,
      password,
      displayName: ext.label,
      stunServer: 'stun:stun.l.google.com:19302'
    })
  }

  function dial() {
    if (!dialInput) return
    pbx.call(dialInput).catch(e => setError(e.message))
  }

  function handleDTMF(d: string) {
    setDialInput(p => p + d)
    if (activeCall) pbx.sendDTMF(d)
  }

  function toggleMute() {
    pbx.setMute(!muted)
    setMuted(!muted)
  }

  const stateColor: Record<PBXState, string> = {
    unregistered: 'text-gray-400',
    registering: 'text-yellow-400',
    registered: 'text-[#00f5ff]',
    error: 'text-red-400'
  }

  return (
    <div className="bg-[#0d0d1a] border border-[#1e1e2e] rounded-xl p-4 w-80 space-y-3">
      <audio ref={audioRef} autoPlay hidden />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[#00f5ff] font-bold text-sm uppercase tracking-widest">MegaSonic PBX</h2>
        <span className={`text-xs font-bold uppercase ${stateColor[pbxState]}`}>{pbxState}</span>
      </div>

      {/* Config Toggle */}
      {pbxState === 'unregistered' || pbxState === 'error' ? (
        <div className="space-y-2">
          <select
            value={selectedExt}
            onChange={e => setSelectedExt(e.target.value)}
            className="w-full bg-[#12121a] border border-[#1e1e2e] text-[#e2e8f0] text-xs rounded px-2 py-1.5"
          >
            {EXTENSIONS.map(e => (
              <option key={e.ext} value={e.ext}>Ext {e.ext} — {e.label}</option>
            ))}
          </select>
          <input
            type="password"
            placeholder="Extension password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-[#12121a] border border-[#1e1e2e] text-[#e2e8f0] text-xs rounded px-2 py-1.5"
          />
          <button onClick={connect} className="w-full bg-[#00f5ff]/10 border border-[#00f5ff]/30 text-[#00f5ff] text-xs py-1.5 rounded hover:bg-[#00f5ff]/20 transition-colors">
            Connect to Callcentric
          </button>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      ) : (
        <>
          {/* Active Call Banner */}
          {activeCall && (
            <div className="bg-[#00f5ff]/10 border border-[#00f5ff]/30 rounded-lg px-3 py-2">
              <p className="text-[#00f5ff] text-xs font-bold uppercase">{activeCall.status}</p>
              <p className="text-white text-sm font-mono">{activeCall.remoteNumber}</p>
            </div>
          )}

          {/* Dial Display */}
          <input
            value={dialInput}
            onChange={e => setDialInput(e.target.value)}
            placeholder="Enter number..."
            className="w-full bg-[#12121a] border border-[#1e1e2e] text-white text-center font-mono text-lg rounded px-2 py-2 tracking-widest"
          />

          {/* DTMF Pad */}
          <div className="grid grid-cols-3 gap-1.5">
            {DTMF_KEYS.map(k => (
              <button
                key={k}
                onClick={() => handleDTMF(k)}
                className="bg-[#12121a] border border-[#1e1e2e] text-white text-sm font-bold py-2 rounded hover:border-[#00f5ff]/50 hover:text-[#00f5ff] transition-colors"
              >{k}</button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            {!activeCall ? (
              <button onClick={dial} className="col-span-2 bg-green-600/20 border border-green-500/40 text-green-400 text-xs py-2 rounded hover:bg-green-600/30 transition-colors">CALL</button>
            ) : (
              <>
                <button onClick={() => pbx.hangup()} className="bg-red-600/20 border border-red-500/40 text-red-400 text-xs py-2 rounded hover:bg-red-600/30">HANG UP</button>
                <button onClick={() => pbx.hold()} className="bg-yellow-600/20 border border-yellow-500/40 text-yellow-400 text-xs py-2 rounded hover:bg-yellow-600/30">HOLD</button>
              </>
            )}
            <button onClick={toggleMute} className={`text-xs py-2 rounded border transition-colors ${ muted ? 'bg-red-600/20 border-red-500/40 text-red-400' : 'bg-[#12121a] border-[#1e1e2e] text-gray-400'}`}>
              {muted ? 'UNMUTE' : 'MUTE'}
            </button>
          </div>

          {/* Disconnect */}
          <button onClick={() => pbx.disconnect()} className="w-full text-xs text-gray-500 hover:text-red-400 transition-colors py-1">
            Disconnect
          </button>
        </>
      )}

      {/* Call Log */}
      {callLog.length > 0 && (
        <div className="border-t border-[#1e1e2e] pt-2 space-y-1 max-h-32 overflow-y-auto">
          <p className="text-[#64748b] text-xs uppercase tracking-wider mb-1">Recent Calls</p>
          {callLog.slice(0, 8).map(c => (
            <div key={c.id} className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#e2e8f0]">{c.remoteNumber}</span>
              <span className={`text-xs uppercase ${ c.status === 'ended' ? 'text-gray-500' : c.status === 'missed' ? 'text-red-400' : 'text-[#00f5ff]'}`}>{c.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
