// ============================================================
// MEGASONICET - pbx.ts  (Callcentric VoIP)
// Call logs, SMS, Click-to-Call, Voicemail
// ============================================================

const CC_ACCOUNT  = process.env.CALLCENTRIC_ACCOUNT_NUMBER   || ''
const CC_PASSWORD = process.env.CALLCENTRIC_PASSWORD          || ''
const CC_DID_FBV  = process.env.CALLCENTRIC_DID_FEELBASSVIP   || ''
const CC_DID_HSS  = process.env.CALLCENTRIC_DID_HSS           || ''

const DEMO_PBX = !CC_ACCOUNT || !CC_PASSWORD

function authHeader() {
  return 'Basic ' + Buffer.from(`${CC_ACCOUNT}:${CC_PASSWORD}`).toString('base64')
}

export type BusinessKey = 'FEELBASSVIP' | 'HSS'

export function getDID(business: BusinessKey): string {
  return business === 'FEELBASSVIP' ? CC_DID_FBV : CC_DID_HSS
}

// ---- Types ----
export interface CallLog {
  id: string
  direction: 'inbound' | 'outbound'
  from: string
  to: string
  duration_seconds: number
  status: 'answered' | 'missed' | 'voicemail' | 'busy'
  timestamp: string
  business?: BusinessKey
}

export interface SMSResult {
  success: boolean
  messageId?: string
  demo?: boolean
  error?: string
}

export interface CallResult {
  success: boolean
  callId?: string
  demo?: boolean
  error?: string
}

export interface Voicemail {
  id: string
  from: string
  duration_seconds: number
  timestamp: string
  transcription?: string
  listened: boolean
}

export interface PBXStatus {
  account: string
  did_feelbassvip: string
  did_hss: string
  demo: boolean
}

// ---- Status ----
export async function getPBXStatus(): Promise<PBXStatus> {
  return {
    account: DEMO_PBX ? 'DEMO-17780000000' : CC_ACCOUNT,
    did_feelbassvip: CC_DID_FBV || '+14035550001',
    did_hss: CC_DID_HSS || '+14035550002',
    demo: DEMO_PBX
  }
}

// ---- Call Logs ----
export async function getCallLogs(limit = 50, business?: BusinessKey): Promise<CallLog[]> {
  if (DEMO_PBX) {
    const logs: CallLog[] = Array.from({ length: 8 }, (_, i) => ({
      id: `DEMO-CALL-${i + 1}`,
      direction: i % 2 === 0 ? 'inbound' : 'outbound',
      from: `+1403555${String(1000 + i).padStart(4, '0')}`,
      to: i % 3 === 0 ? '+14035550001' : '+14035550002',
      duration_seconds: [120, 0, 45, 200, 0, 90, 300, 0][i] || 60,
      status: ['answered', 'missed', 'answered', 'voicemail', 'missed', 'answered', 'answered', 'busy'][i] as CallLog['status'],
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      business: i % 2 === 0 ? 'FEELBASSVIP' : 'HSS'
    }))
    return business ? logs.filter(l => l.business === business) : logs.slice(0, limit)
  }
  try {
    const params = new URLSearchParams({ limit: String(limit) })
    if (business) params.set('did', getDID(business))
    const res = await fetch(`https://www.callcentric.com/api/v1/cdrs?${params}`, {
      headers: { Authorization: authHeader() }
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.cdrs || []).map((c: any) => ({
      id: c.id || c.call_id || String(Date.now()),
      direction: c.direction || 'inbound',
      from: c.from || c.caller_id || '',
      to: c.to || c.destination || '',
      duration_seconds: Number(c.duration) || 0,
      status: (c.disposition || 'answered').toLowerCase() as CallLog['status'],
      timestamp: c.timestamp || c.start_time || new Date().toISOString(),
      business: c.to === CC_DID_FBV ? 'FEELBASSVIP' : 'HSS'
    }))
  } catch { return [] }
}

// ---- SMS ----
export async function sendSMS(to: string, message: string, business: BusinessKey): Promise<SMSResult> {
  if (DEMO_PBX) {
    console.log(`[DEMO SMS] ${getDID(business)} -> ${to}: ${message}`)
    return { success: true, messageId: 'DEMO-SMS-' + Date.now(), demo: true }
  }
  try {
    const res = await fetch('https://www.callcentric.com/api/v1/sms/send', {
      method: 'POST',
      headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: getDID(business), to, message })
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: data.message || 'SMS failed' }
    return { success: true, messageId: data.message_id, demo: false }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ---- Click to Call ----
export async function clickToCall(to: string, business: BusinessKey, agentExt = '101'): Promise<CallResult> {
  if (DEMO_PBX) {
    console.log(`[DEMO CALL] ${agentExt} -> ${to} via ${business}`)
    return { success: true, callId: 'DEMO-CALL-' + Date.now(), demo: true }
  }
  try {
    const res = await fetch('https://www.callcentric.com/api/v1/calls/originate', {
      method: 'POST',
      headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: getDID(business), to, agent_extension: agentExt })
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: data.message || 'Call failed' }
    return { success: true, callId: data.call_id, demo: false }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ---- Voicemail ----
export async function getVoicemails(business: BusinessKey): Promise<Voicemail[]> {
  if (DEMO_PBX) {
    return Array.from({ length: 3 }, (_, i) => ({
      id: `DEMO-VM-${i + 1}`,
      from: `+1403555${String(4000 + i).padStart(4, '0')}`,
      duration_seconds: 30 + i * 15,
      timestamp: new Date(Date.now() - i * 7200000).toISOString(),
      transcription: `Hi, calling about your ${business === 'FEELBASSVIP' ? 'wearable bass rental' : 'TV mount installation'}. Please call back.`,
      listened: i > 0
    }))
  }
  try {
    const res = await fetch(`https://www.callcentric.com/api/v1/voicemail?did=${encodeURIComponent(getDID(business))}`, {
      headers: { Authorization: authHeader() }
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.voicemails || []).map((v: any) => ({
      id: v.id,
      from: v.caller_id || v.from,
      duration_seconds: Number(v.duration) || 0,
      timestamp: v.timestamp,
      transcription: v.transcription,
      listened: v.listened || false
    }))
  } catch { return [] }
}
