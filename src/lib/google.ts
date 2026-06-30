// ============================================================
// MEGASONICET - google.ts
// Google Calendar + Google Maps + Google Business (Places)
// ============================================================

const GOOGLE_MAPS_API_KEY     = process.env.GOOGLE_MAPS_API_KEY     || ''
const GOOGLE_CALENDAR_ID_FBV  = process.env.GOOGLE_CALENDAR_ID_FEELBASSVIP || ''
const GOOGLE_CALENDAR_ID_HSS  = process.env.GOOGLE_CALENDAR_ID_HSS  || ''
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || ''
const GOOGLE_SERVICE_ACCOUNT_KEY   = process.env.GOOGLE_SERVICE_ACCOUNT_KEY   || ''

const DEMO_MAPS     = !GOOGLE_MAPS_API_KEY
const DEMO_CALENDAR = !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_SERVICE_ACCOUNT_KEY

// ============================================================
// GOOGLE MAPS - Geocode + Distance
// ============================================================
export interface GeoResult {
  lat: number
  lng: number
  formatted_address: string
  demo: boolean
}

export async function geocodeAddress(address: string): Promise<GeoResult> {
  if (DEMO_MAPS) {
    return { lat: 51.0447, lng: -114.0719, formatted_address: address + ', Calgary, AB', demo: true }
  }
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
  )
  const data = await res.json()
  if (data.status !== 'OK' || !data.results[0]) throw new Error('Geocode failed: ' + data.status)
  const loc = data.results[0].geometry.location
  return { lat: loc.lat, lng: loc.lng, formatted_address: data.results[0].formatted_address, demo: false }
}

export async function getDistanceKm(origin: string, destination: string): Promise<number> {
  if (DEMO_MAPS) return Math.round(Math.random() * 30 + 5)
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&units=metric&key=${GOOGLE_MAPS_API_KEY}`
  )
  const data = await res.json()
  const meters = data.rows?.[0]?.elements?.[0]?.distance?.value
  if (!meters) throw new Error('Distance matrix failed')
  return Math.round(meters / 1000)
}

// ============================================================
// GOOGLE CALENDAR
// ============================================================
export interface CalendarEvent {
  id?: string
  summary: string
  description?: string
  location?: string
  start: string   // ISO datetime
  end: string     // ISO datetime
  attendees?: string[]
}

export type CalendarBusiness = 'FEELBASSVIP' | 'HSS'

async function getGoogleAccessToken(): Promise<string> {
  const crypto = await import('crypto')
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  })).toString('base64url')
  const sigInput = `${header}.${payload}`
  const privateKey = GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n')
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(sigInput)
  const signature = sign.sign(privateKey, 'base64url')
  const jwt = `${sigInput}.${signature}`

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  })
  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) throw new Error('Failed to get Google access token')
  return tokenData.access_token
}

export async function createCalendarEvent(business: CalendarBusiness, event: CalendarEvent): Promise<{ id: string; demo: boolean }> {
  if (DEMO_CALENDAR) {
    return { id: 'DEMO-CAL-' + Date.now(), demo: true }
  }
  const calendarId = business === 'FEELBASSVIP' ? GOOGLE_CALENDAR_ID_FBV : GOOGLE_CALENDAR_ID_HSS
  const token = await getGoogleAccessToken()
  const body = {
    summary: event.summary,
    description: event.description,
    location: event.location,
    start: { dateTime: event.start, timeZone: 'America/Edmonton' },
    end: { dateTime: event.end, timeZone: 'America/Edmonton' },
    attendees: event.attendees?.map(email => ({ email }))
  }
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Calendar event creation failed')
  return { id: data.id, demo: false }
}

export async function listCalendarEvents(business: CalendarBusiness, days = 30): Promise<CalendarEvent[]> {
  if (DEMO_CALENDAR) {
    return Array.from({ length: 3 }, (_, i) => ({
      id: `DEMO-CAL-${i + 1}`,
      summary: business === 'FEELBASSVIP' ? `FeelBassVIP Event ${i + 1}` : `HSS Install ${i + 1}`,
      start: new Date(Date.now() + i * 86400000 * 2).toISOString(),
      end: new Date(Date.now() + i * 86400000 * 2 + 7200000).toISOString()
    }))
  }
  const calendarId = business === 'FEELBASSVIP' ? GOOGLE_CALENDAR_ID_FBV : GOOGLE_CALENDAR_ID_HSS
  const token = await getGoogleAccessToken()
  const timeMin = new Date().toISOString()
  const timeMax = new Date(Date.now() + days * 86400000).toISOString()
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${timeMin}&timeMax=${timeMax}&orderBy=startTime&singleEvents=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Calendar list failed')
  return (data.items || []).map((e: any) => ({
    id: e.id,
    summary: e.summary,
    description: e.description,
    location: e.location,
    start: e.start.dateTime || e.start.date,
    end: e.end.dateTime || e.end.date
  }))
}

export async function deleteCalendarEvent(business: CalendarBusiness, eventId: string): Promise<boolean> {
  if (DEMO_CALENDAR) return true
  const calendarId = business === 'FEELBASSVIP' ? GOOGLE_CALENDAR_ID_FBV : GOOGLE_CALENDAR_ID_HSS
  const token = await getGoogleAccessToken()
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
  )
  return res.status === 204
}
