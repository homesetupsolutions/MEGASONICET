// MegaSonic Custom PBX Engine
// Built from scratch using native WebRTC + WebSocket signaling
// NO third-party PBX/SIP libraries used

export interface PBXConfig {
  wsUrl: string        // e.g. wss://yourdomain.com/pbx-signal
  extension: string   // e.g. '1001'
  password: string
  displayName: string
  stunServer?: string  // e.g. 'stun:stun.l.google.com:19302'
}

export interface CallRecord {
  id: string
  direction: 'inbound' | 'outbound'
  remoteNumber: string
  remoteName?: string
  startTime: Date
  endTime?: Date
  duration?: number
  status: 'calling' | 'active' | 'held' | 'ended' | 'missed' | 'failed'
  notes?: string
}

export type PBXState = 'unregistered' | 'registering' | 'registered' | 'error'

type EventCallback = (...args: any[]) => void

export class MegaSonicPBX {
  private ws: WebSocket | null = null
  private pc: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private config: PBXConfig | null = null
  private state: PBXState = 'unregistered'
  private callLog: CallRecord[] = []
  private listeners: Map<string, EventCallback[]> = new Map()
  private activeCall: CallRecord | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null

  // ─── Event Bus ───────────────────────────────────────────────
  on(event: string, cb: EventCallback) {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event)!.push(cb)
  }
  off(event: string, cb: EventCallback) {
    const arr = this.listeners.get(event) || []
    this.listeners.set(event, arr.filter(f => f !== cb))
  }
  private emit(event: string, ...args: any[]) {
    ;(this.listeners.get(event) || []).forEach(cb => cb(...args))
  }

  // ─── WebSocket Signaling ─────────────────────────────────────
  connect(config: PBXConfig) {
    this.config = config
    this.setState('registering')
    this.ws = new WebSocket(config.wsUrl)

    this.ws.onopen = () => {
      this.send({ type: 'REGISTER', extension: config.extension, password: config.password, displayName: config.displayName })
      this.startHeartbeat()
    }

    this.ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data)
        this.handleSignal(msg)
      } catch {}
    }

    this.ws.onerror = () => {
      this.setState('error')
      this.emit('error', 'WebSocket connection failed')
    }

    this.ws.onclose = () => {
      this.setState('unregistered')
      this.stopHeartbeat()
      this.emit('disconnected')
    }
  }

  disconnect() {
    this.send({ type: 'UNREGISTER', extension: this.config?.extension })
    this.stopHeartbeat()
    this.ws?.close()
    this.ws = null
    this.setState('unregistered')
  }

  private send(msg: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    }
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'PING', extension: this.config?.extension })
    }, 25000)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
    this.heartbeatTimer = null
  }

  private setState(s: PBXState) {
    this.state = s
    this.emit('stateChange', s)
  }

  getState(): PBXState { return this.state }
  getCallLog(): CallRecord[] { return [...this.callLog] }
  getActiveCall(): CallRecord | null { return this.activeCall }

  // ─── Signal Handler ───────────────────────────────────────────
  private async handleSignal(msg: any) {
    switch (msg.type) {
      case 'REGISTERED':
        this.setState('registered')
        this.emit('registered')
        break

      case 'REGISTER_FAILED':
        this.setState('error')
        this.emit('error', msg.reason || 'Registration failed')
        break

      case 'INBOUND_CALL':
        const inbound: CallRecord = {
          id: msg.callId || crypto.randomUUID(),
          direction: 'inbound',
          remoteNumber: msg.from,
          remoteName: msg.fromName,
          startTime: new Date(),
          status: 'calling'
        }
        this.activeCall = inbound
        this.callLog.unshift(inbound)
        this.emit('inboundCall', inbound, msg.offer)
        break

      case 'ANSWER':
        if (this.pc && msg.answer) {
          await this.pc.setRemoteDescription(new RTCSessionDescription(msg.answer))
          this.updateActiveCall({ status: 'active' })
          this.emit('callConnected', this.activeCall)
        }
        break

      case 'ICE_CANDIDATE':
        if (this.pc && msg.candidate) {
          await this.pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch(() => {})
        }
        break

      case 'HANGUP':
        this.endCallLocally(msg.callId)
        break

      case 'HOLD_ACK':
        this.updateActiveCall({ status: 'held' })
        this.emit('callHeld', this.activeCall)
        break

      case 'RESUME_ACK':
        this.updateActiveCall({ status: 'active' })
        this.emit('callResumed', this.activeCall)
        break

      case 'PONG':
        break

      default:
        this.emit('signal', msg)
    }
  }

  // ─── Outbound Call ────────────────────────────────────────────
  async call(number: string): Promise<void> {
    if (this.state !== 'registered') throw new Error('Not registered')
    if (this.activeCall?.status === 'active') throw new Error('Already in a call')

    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    this.pc = this.createPeerConnection()
    this.localStream.getTracks().forEach(t => this.pc!.addTrack(t, this.localStream!))

    const offer = await this.pc.createOffer()
    await this.pc.setLocalDescription(offer)

    const record: CallRecord = {
      id: crypto.randomUUID(),
      direction: 'outbound',
      remoteNumber: number,
      startTime: new Date(),
      status: 'calling'
    }
    this.activeCall = record
    this.callLog.unshift(record)

    this.send({ type: 'CALL', to: number, from: this.config?.extension, callId: record.id, offer: this.pc.localDescription })
    this.emit('outboundCall', record)
  }

  // ─── Answer Inbound ───────────────────────────────────────────
  async answer(offer: RTCSessionDescriptionInit): Promise<void> {
    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    this.pc = this.createPeerConnection()
    this.localStream.getTracks().forEach(t => this.pc!.addTrack(t, this.localStream!))

    await this.pc.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await this.pc.createAnswer()
    await this.pc.setLocalDescription(answer)

    this.send({ type: 'ANSWER', callId: this.activeCall?.id, answer: this.pc.localDescription })
    this.updateActiveCall({ status: 'active' })
    this.emit('callConnected', this.activeCall)
  }

  // ─── Hangup ───────────────────────────────────────────────────
  hangup() {
    if (this.activeCall) {
      this.send({ type: 'HANGUP', callId: this.activeCall.id })
      this.endCallLocally(this.activeCall.id)
    }
  }

  private endCallLocally(callId?: string) {
    if (this.activeCall && (!callId || this.activeCall.id === callId)) {
      const end = new Date()
      const dur = Math.round((end.getTime() - this.activeCall.startTime.getTime()) / 1000)
      this.updateActiveCall({ status: 'ended', endTime: end, duration: dur })
      this.emit('callEnded', this.activeCall)
      this.activeCall = null
    }
    this.cleanupMedia()
  }

  // ─── Hold / Resume ────────────────────────────────────────────
  hold() {
    if (this.activeCall) {
      this.send({ type: 'HOLD', callId: this.activeCall.id })
    }
  }

  resume() {
    if (this.activeCall) {
      this.send({ type: 'RESUME', callId: this.activeCall.id })
    }
  }

  // ─── Transfer ─────────────────────────────────────────────────
  transfer(target: string) {
    if (this.activeCall) {
      this.send({ type: 'TRANSFER', callId: this.activeCall.id, target })
      this.emit('callTransferred', this.activeCall, target)
      this.endCallLocally(this.activeCall.id)
    }
  }

  // ─── DTMF ─────────────────────────────────────────────────────
  sendDTMF(digit: string) {
    if (!this.pc) return
    const senders = this.pc.getSenders()
    senders.forEach(sender => {
      if (sender.track?.kind === 'audio') {
        try { (sender as any).dtmf?.insertDTMF(digit) } catch {}
      }
    })
    this.send({ type: 'DTMF', callId: this.activeCall?.id, digit })
  }

  // ─── Mute ─────────────────────────────────────────────────────
  setMute(muted: boolean) {
    this.localStream?.getAudioTracks().forEach(t => { t.enabled = !muted })
    this.emit('muteChanged', muted)
  }

  // ─── WebRTC Peer Connection ───────────────────────────────────
  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: this.config?.stunServer || 'stun:stun.l.google.com:19302' }]
    })

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        this.send({ type: 'ICE_CANDIDATE', callId: this.activeCall?.id, candidate })
      }
    }

    pc.ontrack = (evt) => {
      this.emit('remoteAudio', evt.streams[0])
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        this.emit('error', 'WebRTC connection failed')
        this.endCallLocally()
      }
    }

    return pc
  }

  private cleanupMedia() {
    this.localStream?.getTracks().forEach(t => t.stop())
    this.localStream = null
    this.pc?.close()
    this.pc = null
  }

  private updateActiveCall(patch: Partial<CallRecord>) {
    if (this.activeCall) {
      Object.assign(this.activeCall, patch)
      const idx = this.callLog.findIndex(c => c.id === this.activeCall?.id)
      if (idx >= 0) this.callLog[idx] = { ...this.activeCall }
    }
  }
}

// Singleton export for app-wide use
export const pbx = new MegaSonicPBX()
