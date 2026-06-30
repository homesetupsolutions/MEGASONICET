const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || ''
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || ''
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER || '+10000000000'
const DEMO_MODE = !TWILIO_ACCOUNT_SID

export interface SMSResult {
  success: boolean
  sid?: string
  error?: string
  demo?: boolean
}

export async function sendSMS(to: string, body: string): Promise<SMSResult> {
  if (DEMO_MODE) {
    console.log(`[DEMO SMS] To: ${to} | Body: ${body}`)
    return { success: true, sid: 'DEMO-' + Date.now(), demo: true }
  }
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ To: to, From: TWILIO_FROM, Body: body }).toString()
  })
  const data = await res.json()
  if (data.sid) return { success: true, sid: data.sid }
  return { success: false, error: data.message || 'SMS failed' }
}

export async function sendReminderSMS(to: string, clientName: string, eventDate: string, hoursWindow: '50h' | '26h' | 'same-day'): Promise<SMSResult> {
  const messages = {
    '50h': `Hi ${clientName}! Reminder: Your MegaSonic event is in ~50 hours on ${eventDate}. Reply CONFIRM or CANCEL.`,
    '26h': `Hi ${clientName}! Final reminder: Your MegaSonic event is tomorrow at ${eventDate}. Please confirm by replying YES.`,
    'same-day': `Hi ${clientName}! Today is your MegaSonic event day! We arrive at ${eventDate}. Get ready!`
  }
  return sendSMS(to, messages[hoursWindow])
}
