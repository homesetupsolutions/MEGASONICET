// ============================================================
// MEGASONICET - azure.ts
// AI: Google Gemini | Azure Speech | Azure Blob Storage
// Azure Communication Services (Email + SMS)
// ============================================================

// ---- ENV ----
const GEMINI_API_KEY       = process.env.GEMINI_API_KEY        || ''
const GEMINI_MODEL         = process.env.GEMINI_MODEL          || 'gemini-1.5-flash'
const AZURE_SPEECH_KEY     = process.env.AZURE_SPEECH_KEY      || ''
const AZURE_SPEECH_REGION  = process.env.AZURE_SPEECH_REGION   || 'canadacentral'
const AZURE_STORAGE_ACCOUNT= process.env.AZURE_STORAGE_ACCOUNT || ''
const AZURE_STORAGE_KEY    = process.env.AZURE_STORAGE_KEY     || ''
const AZURE_STORAGE_CONTAINER = process.env.AZURE_STORAGE_CONTAINER || 'megasonic'
const ACS_CONNECTION_STRING= process.env.AZURE_COMMUNICATION_CONNECTION_STRING || ''
const ACS_FROM_EMAIL       = process.env.AZURE_COMMUNICATION_FROM_EMAIL || 'DoNotReply@sonicfeel.tech'

const DEMO_GEMINI   = !GEMINI_API_KEY
const DEMO_SPEECH   = !AZURE_SPEECH_KEY
const DEMO_STORAGE  = !AZURE_STORAGE_ACCOUNT || !AZURE_STORAGE_KEY
const DEMO_ACS      = !ACS_CONNECTION_STRING

// ============================================================
// GEMINI AI
// ============================================================
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatResult {
  content: string
  demo: boolean
  tokens?: number
}

const SYSTEM_PROMPT = `You are MEGASONICET Command Center AI assistant for two businesses:
1. FeelBassVIP - Wearable bass/sensory experience rentals (bone conduction headbands, BassSkin technology) for events in Calgary, AB.
2. Home Setup Solutions (HSS) - Residential technology installation (TV mounts, WiFi, smart home, home theatre) in Calgary, AB.
You help manage bookings, leads, payments, reminders, and operations.
Always be concise, professional, and action-oriented. Currency is CAD.`

export async function chatWithGemini(messages: ChatMessage[], systemOverride?: string): Promise<ChatResult> {
  if (DEMO_GEMINI) {
    return {
      content: '[DEMO MODE] Gemini AI not configured. Set GEMINI_API_KEY in .env to enable.',
      demo: true
    }
  }

  const systemInstruction = systemOverride || SYSTEM_PROMPT

  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
      })
    }
  )

  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Gemini API error')

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const tokens = data.usageMetadata?.totalTokenCount
  return { content, demo: false, tokens }
}

export async function generateBookingConfirmation(booking: {
  customer_name: string
  service: string
  event_date: string
  business: string
  amount_cents?: number
}): Promise<string> {
  const amount = booking.amount_cents ? `$${(booking.amount_cents / 100).toFixed(2)} CAD` : 'TBD'
  const prompt = `Write a friendly, professional booking confirmation SMS (under 160 chars) for:
Customer: ${booking.customer_name}
Service: ${booking.service}
Date: ${new Date(booking.event_date).toLocaleDateString('en-CA')}
Business: ${booking.business === 'FEELBASSVIP' ? 'FeelBassVIP' : 'Home Setup Solutions'}
Amount: ${amount}`

  const result = await chatWithGemini([{ role: 'user', content: prompt }],
    'You write short, professional booking confirmation messages. Be friendly and include key details.')
  return result.content
}

export async function generateLeadResponse(lead: {
  name: string
  service: string
  source: string
  business: string
}): Promise<string> {
  const prompt = `Write a short follow-up SMS (under 160 chars) to a new lead:
Name: ${lead.name}
Interested in: ${lead.service}
Source: ${lead.source}
Business: ${lead.business === 'FEELBASSVIP' ? 'FeelBassVIP' : 'Home Setup Solutions'}`

  const result = await chatWithGemini([{ role: 'user', content: prompt }],
    'You write short, personalized follow-up messages for potential customers. Be warm and include a call to action.')
  return result.content
}

// ============================================================
// AZURE SPEECH (Text-to-Speech)
// ============================================================
export interface SpeechResult {
  audioBase64?: string
  demo: boolean
  error?: string
}

export async function textToSpeech(text: string, voice = 'en-CA-LiamNeural'): Promise<SpeechResult> {
  if (DEMO_SPEECH) {
    return { demo: true, error: 'Azure Speech not configured. Set AZURE_SPEECH_KEY in .env' }
  }

  const tokenRes = await fetch(
    `https://${AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
    { method: 'POST', headers: { 'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY } }
  )
  const token = await tokenRes.text()

  const ssml = `<speak version='1.0' xml:lang='en-CA'><voice xml:lang='en-CA' name='${voice}'>${text}</voice></speak>`

  const audioRes = await fetch(
    `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
      },
      body: ssml
    }
  )

  if (!audioRes.ok) return { demo: false, error: 'Speech synthesis failed' }
  const buffer = await audioRes.arrayBuffer()
  const audioBase64 = Buffer.from(buffer).toString('base64')
  return { audioBase64, demo: false }
}

// ============================================================
// AZURE BLOB STORAGE
// ============================================================
export interface UploadResult {
  url?: string
  demo: boolean
  error?: string
}

export async function uploadToBlob(blobName: string, data: Buffer, contentType: string): Promise<UploadResult> {
  if (DEMO_STORAGE) {
    return { demo: true, url: `https://demo.blob.core.windows.net/${AZURE_STORAGE_CONTAINER}/${blobName}`, error: undefined }
  }

  const url = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_STORAGE_CONTAINER}/${blobName}`
  const date = new Date().toUTCString()
  const contentLength = data.length

  // Simple shared key auth
  const crypto = await import('crypto')
  const stringToSign = [
    'PUT', '', contentType, '', `x-ms-blob-type:BlockBlob\nx-ms-date:${date}\nx-ms-version:2020-10-02`,
    `/${AZURE_STORAGE_ACCOUNT}/${AZURE_STORAGE_CONTAINER}/${blobName}`
  ].join('\n')

  const hmac = crypto.createHmac('sha256', Buffer.from(AZURE_STORAGE_KEY, 'base64'))
  hmac.update(stringToSign)
  const signature = hmac.digest('base64')

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `SharedKey ${AZURE_STORAGE_ACCOUNT}:${signature}`,
      'x-ms-blob-type': 'BlockBlob',
      'x-ms-date': date,
      'x-ms-version': '2020-10-02',
      'Content-Type': contentType,
      'Content-Length': String(contentLength)
    },
    body: data
  })

  if (!res.ok) return { demo: false, error: `Blob upload failed: ${res.status}` }
  return { url, demo: false }
}

// ============================================================
// AZURE COMMUNICATION SERVICES - EMAIL
// ============================================================
export interface EmailResult {
  messageId?: string
  demo: boolean
  error?: string
}

export async function sendEmail(to: string, subject: string, htmlBody: string): Promise<EmailResult> {
  if (DEMO_ACS) {
    console.log(`[DEMO EMAIL] To: ${to} | Subject: ${subject}`)
    return { demo: true, messageId: 'DEMO-EMAIL-' + Date.now() }
  }

  // Parse endpoint from connection string
  const endpointMatch = ACS_CONNECTION_STRING.match(/endpoint=([^;]+)/i)
  const keyMatch = ACS_CONNECTION_STRING.match(/accesskey=([^;]+)/i)
  if (!endpointMatch || !keyMatch) return { demo: false, error: 'Invalid ACS connection string' }

  const endpoint = endpointMatch[1].replace(/\/$/, '')
  const accessKey = keyMatch[1]

  const payload = {
    senderAddress: ACS_FROM_EMAIL,
    recipients: { to: [{ address: to }] },
    content: { subject, html: htmlBody }
  }

  const body = JSON.stringify(payload)
  const date = new Date().toUTCString()
  const crypto = await import('crypto')
  const contentHash = crypto.createHash('sha256').update(body).digest('base64')
  const url = `${endpoint}/emails:send?api-version=2023-03-31`
  const urlPath = new URL(url).pathname + new URL(url).search
  const stringToSign = `POST\n${urlPath}\n${date};${new URL(endpoint).host};${contentHash}`
  const hmac = crypto.createHmac('sha256', Buffer.from(accessKey, 'base64'))
  hmac.update(stringToSign)
  const signature = hmac.digest('base64')

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Date: date,
      'x-ms-content-sha256': contentHash,
      Authorization: `HMAC-SHA256 SignedHeaders=date;host;x-ms-content-sha256&Signature=${signature}`
    },
    body
  })

  if (!res.ok) {
    const err = await res.text()
    return { demo: false, error: `Email send failed: ${err}` }
  }
  const result = await res.json()
  return { messageId: result.id, demo: false }
}

export async function sendBookingConfirmationEmail(
  to: string,
  customerName: string,
  service: string,
  eventDate: string,
  business: string,
  amountCents?: number
): Promise<EmailResult> {
  const businessName = business === 'FEELBASSVIP' ? 'FeelBassVIP' : 'Home Setup Solutions'
  const amount = amountCents ? `$${(amountCents / 100).toFixed(2)} CAD` : 'TBD'
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1a1a2e">${businessName} - Booking Confirmed!</h2>
      <p>Hi ${customerName},</p>
      <p>Your booking has been confirmed. Here are your details:</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;background:#f5f5f5"><strong>Service</strong></td><td style="padding:8px">${service}</td></tr>
        <tr><td style="padding:8px;background:#f5f5f5"><strong>Date</strong></td><td style="padding:8px">${new Date(eventDate).toLocaleDateString('en-CA', { dateStyle: 'full' })}</td></tr>
        <tr><td style="padding:8px;background:#f5f5f5"><strong>Amount</strong></td><td style="padding:8px">${amount}</td></tr>
      </table>
      <p>Questions? Reply to this email or call us.</p>
      <p>Thank you for choosing ${businessName}!</p>
    </div>
  `
  return sendEmail(to, `Booking Confirmed - ${businessName}`, html)
}
