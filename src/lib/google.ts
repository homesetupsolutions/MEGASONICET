const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || ''
const DEMO_MODE = !GOOGLE_CLIENT_ID

// Primary calendar for FeelBassVIP booking availability
export const FEELBASS_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'vip@feelbass.vip'

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    }).toString()
  })
  const data = await res.json()
  return data.access_token
}

export interface CalendarEvent {
  id?: string
  summary: string
  description?: string
  start: string
  end: string
  location?: string
  attendees?: string[]
}

export async function listEvents(
  calendarId = FEELBASS_CALENDAR_ID,
  maxResults = 20
): Promise<CalendarEvent[]> {
  if (DEMO_MODE) {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `demo-evt-${i}`,
      summary: `FeelBassVIP Event #${i + 1}`,
      description: 'Bass sensory experience setup',
      start: new Date(Date.now() + i * 86400000).toISOString(),
      end: new Date(Date.now() + i * 86400000 + 7200000).toISOString(),
      location: 'Calgary, AB'
    }))
  }
  const token = await getAccessToken()
  const timeMin = new Date().toISOString()
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?maxResults=${maxResults}&orderBy=startTime&singleEvents=true&timeMin=${timeMin}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json()
  return (data.items || []).map((e: any) => ({
    id: e.id,
    summary: e.summary,
    description: e.description,
    start: e.start?.dateTime || e.start?.date,
    end: e.end?.dateTime || e.end?.date,
    location: e.location
  }))
}

export async function checkAvailability(
  startTime: string,
  endTime: string,
  calendarId = FEELBASS_CALENDAR_ID
): Promise<boolean> {
  if (DEMO_MODE) return true
  const events = await listEvents(calendarId, 50)
  const reqStart = new Date(startTime).getTime()
  const reqEnd = new Date(endTime).getTime()
  const conflict = events.some(e => {
    const evtStart = new Date(e.start).getTime()
    const evtEnd = new Date(e.end).getTime()
    return reqStart < evtEnd && reqEnd > evtStart
  })
  return !conflict
}

export async function createEvent(
  event: CalendarEvent,
  calendarId = FEELBASS_CALENDAR_ID
): Promise<CalendarEvent> {
  if (DEMO_MODE) return { ...event, id: 'DEMO-' + Date.now() }
  const token = await getAccessToken()
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: { dateTime: event.start, timeZone: 'America/Edmonton' },
        end: { dateTime: event.end, timeZone: 'America/Edmonton' },
        attendees: event.attendees?.map(email => ({ email })),
        sendUpdates: 'all'
      })
    }
  )
  const data = await res.json()
  return { ...event, id: data.id }
}

export async function deleteEvent(
  eventId: string,
  calendarId = FEELBASS_CALENDAR_ID
): Promise<void> {
  if (DEMO_MODE) return
  const token = await getAccessToken()
  await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
  )
}

export function isDemoMode(): boolean { return DEMO_MODE }
