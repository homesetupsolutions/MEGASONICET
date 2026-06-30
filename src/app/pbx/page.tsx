'use client'
import { useEffect, useState, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import TitleBar from '@/components/TitleBar'
import { pbx, type PBXState, type CallRecord, type PBXConfig } from '@/lib/pbx'

const DTMF_KEYS = ['1','2','3','4','5','6','7','8','9','*','0','#']

export default function PBXPage() {
  const [state, setState] = useState<PBXState>('unregistered')
  const [dialInput, setDialInput] = useState('')
  const [callLog, setCallLog] = useState<CallRecord[]>([])
  const [activeCall, setActiveCall] = useState<CallRecord | null>(null)
  const [incomingCall, setIncomingCall] = useState<CallRecord | null>(null)
  const [isHeld, setIsHeld] = useState(false)
  const [config, setConfig] = useState<PBXConfig>({ server: '', username: '', password: '', displayName: 'MegaSonic' })
  const [showConfig, setShowConfig] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<any>(null)

  useEffect(() => {
    pbx.loadCallLog()
    setCallLog(pbx.getCallLog())
    pbx.on('stateChange', (s: PBXState) => setState(s))
    pbx.on('callStarted', (r: CallRecord) => { setActiveCall(r); startTimer() })
    pbx.on('callActive', (r: CallRecord) => setActiveCall({ ...r }))
    pbx.on('callHeld', () => setIsHeld(true))
    pbx.on('callActive', () => setIsHeld(false))
    pbx.on('callEnded', (r: CallRecord) => { setActiveCall(null); setIsHeld(false); stopTimer(); setCallLog(pbx.getCallLog()) })
    pbx.on('incomingCall', ({ record }: any) => setIncomingCall(record))
    return () => pbx.unregister()
  }, [])

  const startTimer = () => { setElapsed(0); timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000) }
  const stopTimer = () => { clearInterval(timerRef.current); setElapsed(0) }
  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const handleRegister = async () => {
    if (!config.server || !config.username || !config.password) return
    try { await pbx.register(config); setShowConfig(false) } catch (e) { alert('Registration failed: ' + e) }
  }

  const handleCall = async () => {
    if (!dialInput) return
    try { await pbx.call(dialInput) } catch (e) { alert('Call failed: ' + e) }
  }

  const statusColor = { unregistered: '#64748b', registering: '#f59e0b', registered: '#00ff88', error: '#ff3366' }[state]
  const statusLabel = { unregistered: 'Not Registered', registering: 'Registering...', registered: 'Registered', error: 'Error' }[state]

  return (
    <div className="flex h-screen bg-[#0a0a0f]">
      <TitleBar />
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#00f5ff]">MegaSonic PBX</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono" style={{color: statusColor}}>{statusLabel}</span>
            <div className="w-2 h-2 rounded-full" style={{background: statusColor}} />
            <button onClick={() => setShowConfig(!showConfig)} className="text-xs bg-[#1e1e2e] text-[#e2e8f0] px-3 py-1.5 rounded-lg hover:bg-[#7c3aed] transition-colors">Settings</button>
            {state === 'registered' && <button onClick={() => pbx.unregister()} className="text-xs bg-[#ff3366]/20 text-[#ff3366] px-3 py-1.5 rounded-lg hover:bg-[#ff3366]/40">Disconnect</button>}
          </div>
        </div>

        {showConfig && (
          <div className="bg-[#12121a] border border-[#7c3aed] rounded-xl p-4 mb-6 grid grid-cols-2 gap-3">
            <div><label className="text-xs text-[#64748b]">SIP WebSocket Server</label><input value={config.server} onChange={e => setConfig({...config, server: e.target.value})} placeholder="wss://sip.callcentric.com:8089/ws" className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded p-2 text-sm text-[#e2e8f0] mt-1" /></div>
            <div><label className="text-xs text-[#64748b]">SIP Username / Extension</label><input value={config.username} onChange={e => setConfig({...config, username: e.target.value})} placeholder="17785550100" className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded p-2 text-sm text-[#e2e8f0] mt-1" /></div>
            <div><label className="text-xs text-[#64748b]">Password</label><input type="password" value={config.password} onChange={e => setConfig({...config, password: e.target.value})} className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded p-2 text-sm text-[#e2e8f0] mt-1" /></div>
            <div><label className="text-xs text-[#64748b]">Display Name</label><input value={config.displayName} onChange={e => setConfig({...config, displayName: e.target.value})} className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded p-2 text-sm text-[#e2e8f0] mt-1" /></div>
            <div className="col-span-2"><button onClick={handleRegister} className="w-full bg-[#00f5ff] text-black font-bold py-2 rounded-lg hover:opacity-80">Register SIP Account</button></div>
          </div>
        )}

        {incomingCall && (
          <div className="bg-[#00ff88]/10 border border-[#00ff88] rounded-xl p-4 mb-6 flex items-center justify-between">
            <div><p className="text-[#00ff88] font-bold">Incoming Call</p><p className="text-sm text-[#e2e8f0]">{incomingCall.remoteName || incomingCall.remoteNumber}</p></div>
            <div className="flex gap-3">
              <button onClick={() => { pbx.answerCall(); setIncomingCall(null) }} className="bg-[#00ff88] text-black px-4 py-2 rounded-lg font-bold">Answer</button>
              <button onClick={() => { pbx.rejectCall(); setIncomingCall(null) }} className="bg-[#ff3366] text-white px-4 py-2 rounded-lg font-bold">Reject</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[#00f5ff] mb-4">Dialpad</h2>
            {activeCall && (
              <div className="mb-4 p-3 bg-[#00f5ff]/10 border border-[#00f5ff]/30 rounded-lg text-center">
                <p className="text-[#00f5ff] font-mono text-xl">{fmt(elapsed)}</p>
                <p className="text-xs text-[#64748b]">{activeCall.remoteNumber} — {isHeld ? 'ON HOLD' : 'ACTIVE'}</p>
              </div>
            )}
            <input value={dialInput} onChange={e => setDialInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCall()} placeholder="Enter number..." className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg p-3 text-center text-xl font-mono text-[#e2e8f0] mb-3" />
            <div className="grid grid-cols-3 gap-2 mb-3">
              {DTMF_KEYS.map(k => (
                <button key={k} onClick={() => { setDialInput(d => d + k); activeCall && pbx.sendDTMF(k) }}
                  className="bg-[#1e1e2e] hover:bg-[#7c3aed] text-[#e2e8f0] font-bold py-3 rounded-lg text-lg transition-colors">{k}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {!activeCall ? (
                <button onClick={handleCall} disabled={state !== 'registered'} className="col-span-2 bg-[#00ff88] text-black font-bold py-3 rounded-lg hover:opacity-80 disabled:opacity-40">Call</button>
              ) : (
                <>
                  <button onClick={() => isHeld ? pbx.unhold() : pbx.hold()} className={`py-3 rounded-lg font-bold ${isHeld ? 'bg-[#00f5ff] text-black' : 'bg-[#1e1e2e] text-[#e2e8f0] hover:bg-[#f59e0b]'}`}>{isHeld ? 'Unhold' : 'Hold'}</button>
                  <button onClick={() => pbx.hangup()} className="bg-[#ff3366] text-white font-bold py-3 rounded-lg hover:opacity-80">Hang Up</button>
                </>
              )}
            </div>
            {activeCall && (
              <div className="mt-2 flex gap-2">
                <input placeholder="Transfer to..." className="flex-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded p-2 text-sm text-[#e2e8f0]" onKeyDown={e => { if(e.key==='Enter') { pbx.transfer((e.target as HTMLInputElement).value) }}} />
                <button className="bg-[#7c3aed] text-white text-sm px-3 rounded">Transfer</button>
              </div>
            )}
          </div>

          <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[#00f5ff] mb-4">Call Log</h2>
            <div className="space-y-2 overflow-y-auto max-h-96">
              {callLog.length === 0 && <p className="text-[#64748b] text-sm text-center py-4">No calls yet</p>}
              {callLog.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2 bg-[#0a0a0f] rounded-lg border border-[#1e1e2e] hover:border-[#00f5ff]/50 cursor-pointer" onClick={() => setDialInput(c.remoteNumber)}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{c.direction === 'inbound' ? '⬇️' : '⬆️'}</span>
                    <div>
                      <p className="text-sm text-[#e2e8f0] font-mono">{c.remoteNumber}</p>
                      <p className="text-xs text-[#64748b]">{new Date(c.startTime).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${ c.status === 'ended' ? 'text-[#64748b]' : c.status === 'missed' ? 'text-[#ff3366]' : 'text-[#00ff88]' }`}>{c.status}</p>
                    {c.duration && <p className="text-xs text-[#64748b]">{fmt(c.duration)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
