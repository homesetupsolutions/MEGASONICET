// MegaSonic PBX Engine - SIP.js based softphone
// Supports: register, call, hangup, hold, transfer, DTMF, call log

export interface PBXConfig {
  server: string      // e.g. wss://sip.callcentric.com:8089/ws
  username: string    // SIP extension or DID
  password: string
  displayName: string
  realm?: string
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

export class MegaSonicPBX {
  private ua: any = null
  private session: any = null
  private config: PBXConfig | null = null
  private state: PBXState = 'unregistered'
  private callLog: CallRecord[] = []
  private listeners: Map<string, Function[]> = new Map()

  // Load SIP.js dynamically (browser only)
  private async loadSIP() {
    if (typeof window === 'undefined') throw new Error('PBX requires browser environment')
    if ((window as any).SIP) return (window as any).SIP
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/sip.js@0.21.2/dist/sip.min.js'
      script.onload = () => resolve((window as any).SIP)
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  async register(config: PBXConfig): Promise<void> {
    this.config = config
    this.setState('registering')
    try {
      const SIP = await this.loadSIP()
      this.ua = new SIP.UA({
        uri: `sip:${config.username}@${config.realm || config.server.replace('wss://', '').split(':')[0]}`,
        transportOptions: { wsServers: [config.server] },
        authorizationUser: config.username,
        password: config.password,
        displayName: config.displayName,
        register: true,
        sessionDescriptionHandlerFactoryOptions: { constraints: { audio: true, video: false } },
      })
      this.ua.on('registered', () => { this.setState('registered'); this.emit('registered') })
      this.ua.on('registrationFailed', (e: any) => { this.setState('error'); this.emit('error', e) })
      this.ua.on('invite', (session: any) => this.handleIncoming(session))
      this.ua.start()
    } catch (e) {
      this.setState('error')
      throw e
    }
  }

  async call(number: string): Promise<string> {
    if (!this.ua || this.state !== 'registered') throw new Error('Not registered')
    const SIP = await this.loadSIP()
    const callId = `call-${Date.now()}`
    const target = `sip:${number}@${this.config!.realm || this.config!.server.replace('wss://','').split(':')[0]}`
    const audioElement = this.getAudioElement()
    this.session = this.ua.invite(target, {
      sessionDescriptionHandlerOptions: { constraints: { audio: true, video: false } },
      media: { remote: { audio: audioElement } },
    })
    const record: CallRecord = {
      id: callId, direction: 'outbound', remoteNumber: number,
      startTime: new Date(), status: 'calling'
    }
    this.callLog.unshift(record)
    this.session.on('accepted', () => { record.status = 'active'; this.emit('callActive', record) })
    this.session.on('terminated', () => { this.endCall(record) })
    this.emit('callStarted', record)
    return callId
  }

  hangup(): void {
    if (this.session) {
      try { this.session.terminate() } catch {}
      this.session = null
    }
  }

  hold(): void {
    this.session?.hold()
    const active = this.callLog.find(c => c.status === 'active')
    if (active) { active.status = 'held'; this.emit('callHeld', active) }
  }

  unhold(): void {
    this.session?.unhold()
    const held = this.callLog.find(c => c.status === 'held')
    if (held) { held.status = 'active'; this.emit('callActive', held) }
  }

  sendDTMF(tone: string): void {
    this.session?.dtmf(tone)
  }

  transfer(target: string): void {
    if (!this.session) throw new Error('No active call')
    this.session.refer(`sip:${target}@${this.config!.realm || ''}`)
  }

  private handleIncoming(session: any): void {
    this.session = session
    const caller = session.remoteIdentity?.uri?.user || 'Unknown'
    const record: CallRecord = {
      id: `call-${Date.now()}`, direction: 'inbound', remoteNumber: caller,
      remoteName: session.remoteIdentity?.displayName,
      startTime: new Date(), status: 'calling'
    }
    this.callLog.unshift(record)
    session.on('accepted', () => { record.status = 'active'; this.emit('callActive', record) })
    session.on('terminated', () => {
      if (record.status === 'calling') record.status = 'missed'
      this.endCall(record)
    })
    this.emit('incomingCall', { session, record })
  }

  answerCall(): void {
    const audioElement = this.getAudioElement()
    this.session?.accept({ media: { remote: { audio: audioElement } } })
  }

  rejectCall(): void {
    this.session?.reject()
    this.session = null
  }

  private endCall(record: CallRecord): void {
    record.endTime = new Date()
    record.duration = Math.floor((record.endTime.getTime() - record.startTime.getTime()) / 1000)
    if (record.status !== 'missed') record.status = 'ended'
    this.session = null
    this.emit('callEnded', record)
    this.saveCallLog()
  }

  private getAudioElement(): HTMLAudioElement {
    let el = document.getElementById('megasonic-pbx-audio') as HTMLAudioElement
    if (!el) {
      el = document.createElement('audio')
      el.id = 'megasonic-pbx-audio'
      el.autoplay = true
      document.body.appendChild(el)
    }
    return el
  }

  private setState(s: PBXState): void {
    this.state = s
    this.emit('stateChange', s)
  }

  getState(): PBXState { return this.state }
  getCallLog(): CallRecord[] { return this.callLog }

  private saveCallLog(): void {
    try { localStorage.setItem('megasonic_call_log', JSON.stringify(this.callLog.slice(0, 100))) } catch {}
  }

  loadCallLog(): void {
    try {
      const data = localStorage.getItem('megasonic_call_log')
      if (data) this.callLog = JSON.parse(data)
    } catch {}
  }

  on(event: string, fn: Function): void {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event)!.push(fn)
  }

  off(event: string, fn: Function): void {
    const arr = this.listeners.get(event) || []
    this.listeners.set(event, arr.filter(f => f !== fn))
  }

  private emit(event: string, data?: any): void {
    (this.listeners.get(event) || []).forEach(fn => fn(data))
  }

  unregister(): void {
    this.ua?.stop()
    this.ua = null
    this.setState('unregistered')
  }
}

// Singleton
export const pbx = new MegaSonicPBX()
