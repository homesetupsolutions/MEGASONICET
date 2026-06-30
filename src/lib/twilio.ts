// ============================================================
// MEGASONICET - twilio.ts
// Twilio SMS/Voice fallback (backup to Callcentric)
// ============================================================

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || ''
const TWILIO_AUTH_TOKEN  = process.env.TWILIO_AUTH_TOKEN  || ''
const TWILIO_FROM_FBV    = process.env.TWILIO_PHONE_FEELBASSVIP || ''
const TWILIO_FROM_HSS    = process.env.TWILIO_PHONE_HSS         || ''

const DEMO_TWILIO = !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN

export type BusinessKey = 'FEELBASSVIP' | 'HSS'

function twilioFrom(business: BusinessKey): string {
  return business === 'FEELBASSVIP' ? TWILIO_FROM_FBV : TWILIO_FROM_HSS
}

function twilioAuth(): string {
  return 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')
}

// ---- Types ----
export interface TwilioSMSResult {
  success: boolean
  sid?: string
  demo?: boolean
  error?: string
}

export interface TwilioCallResult {
  success: boolean
  sid?: string
  demo?: boolean
  error?: string
}

// ---- Send SMS ----
export async function sendTwilioSMS(
  to: string,
  body: string,
  business: BusinessKey
): Promise<TwilioSMSResult> {
  if (DEMO_TWILIO) {
    console.log(`[DEMO TWILIO SMS] ${twilioFrom(business)} -> ${to}: ${body}`)
    return { success: true, sid: 'DEMO-SMS-' + Date.now(), demo: true }
  }
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: twilioAuth(),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: twilioFrom(business),
          To: to,
          Body: body
        }).toString()
      }
    )
    const data = await res.json()
    if (!res.ok) return { success: false, error: data.message || data.error_message || 'SMS failed' }
    return { success: true, sid: data.sid, demo: false }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ---- Make Call ----
export async function makeTwilioCall(
  to: string,
  twimlUrl: string,
  business: BusinessKey
): Promise<TwilioCallResult> {
  if (DEMO_TWILIO) {
    console.log(`[DEMO TWILIO CALL] ${twilioFrom(business)} -> ${to}`)
    return { success: true, sid: 'DEMO-CALL-' + Date.now(), demo: true }
  }
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`,
      {
        method: 'POST',
        headers: {
          Authorization: twilioAuth(),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: twilioFrom(business),
          To: to,
          Url: twimlUrl
        }).toString()
      }
    )
    const data = await res.json()
    if (!res.ok) return { success: false, error: data.message || 'Call failed' }
    return { success: true, sid: data.sid, demo: false }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ---- Send Booking Reminder SMS ----
export async function sendBookingReminderSMS(
  to: string,
  customerName: string,
  service: string,
  eventDate: string,
  business: BusinessKey
): Promise<TwilioSMSResult> {
  const businessName = business === 'FEELBASSVIP' ? 'FeelBassVIP' : 'Home Setup Solutions'
  const dateStr = new Date(eventDate).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
  const msg = `Hi ${customerName}! Reminder: Your ${service} with ${businessName} is on ${dateStr}. Questions? Reply to this message.`
  return sendTwilioSMS(to, msg, business)
}

// ---- Send Lead Follow-up SMS ----
export async function sendLeadFollowUpSMS(
  to: string,
  name: string,
  business: BusinessKey
): Promise<TwilioSMSResult> {
  const businessName = business === 'FEELBASSVIP' ? 'FeelBassVIP' : 'Home Setup Solutions'
  const msg = `Hi ${name}! Thanks for your interest in ${businessName}. We'd love to chat - reply here or call us anytime. Calgary, AB.`
  return sendTwilioSMS(to, msg, business)
}
