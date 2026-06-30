import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const DEMO_MODE = !supabaseUrl || supabaseUrl === ''

// Lazy client - only created when actually needed at runtime, not at build time
let _supabase: SupabaseClient | null = null
export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    if (DEMO_MODE) throw new Error('Supabase not configured')
    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}

// Keep backward compat - lazy proxy
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop]
  }
})

// Server-side admin client (never expose to browser)
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Supabase admin env vars not set')
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// ---- Bookings ----
export interface Booking {
  id?: string
  business: 'FEELBASSVIP' | 'HSS'
  customer_name: string
  customer_email?: string
  customer_phone?: string
  service: string
  event_date: string
  status: 'pending' | 'confirmed' | 'cancelled'
  amount_cents?: number
  payment_id?: string
  notes?: string
  created_at?: string
}

export async function createBooking(booking: Omit<Booking, 'id' | 'created_at'>) {
  if (DEMO_MODE) return { success: true, id: 'DEMO-' + Date.now(), demo: true }
  const admin = getSupabaseAdmin()
  const { data, error } = await admin.from('bookings').insert(booking).select().single()
  if (error) return { success: false, error: error.message }
  return { success: true, id: data.id }
}

export async function listBookings(business?: string, limit = 50) {
  if (DEMO_MODE) {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `DEMO-BOOK-${i + 1}`,
      business: i % 2 === 0 ? 'FEELBASSVIP' : 'HSS',
      customer_name: `Demo Customer ${i + 1}`,
      service: i % 2 === 0 ? 'Wearable Bass Experience' : 'TV Mount Install',
      event_date: new Date(Date.now() + i * 86400000).toISOString(),
      status: 'confirmed',
      amount_cents: (i + 1) * 5000,
      created_at: new Date().toISOString()
    }))
  }
  const admin = getSupabaseAdmin()
  let query = admin.from('bookings').select('*').order('created_at', { ascending: false }).limit(limit)
  if (business) query = query.eq('business', business)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data || []
}

export async function updateBookingStatus(id: string, status: Booking['status']) {
  if (DEMO_MODE) return { success: true }
  const admin = getSupabaseAdmin()
  const { error } = await admin.from('bookings').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  return { success: true }
}

// ---- Leads ----
export interface Lead {
  id?: string
  name: string
  phone?: string
  email?: string
  source?: string
  service_interest?: string
  estimated_value?: string
  status?: string
  notes?: string
  created_at?: string
}

export async function createLead(lead: Omit<Lead, 'id' | 'created_at'>) {
  if (DEMO_MODE) return { success: true, id: 'DEMO-LEAD-' + Date.now() }
  const admin = getSupabaseAdmin()
  const { data, error } = await admin.from('leads').insert(lead).select().single()
  if (error) return { success: false, error: error.message }
  return { success: true, id: data.id }
}

export async function listLeads(status?: string) {
  if (DEMO_MODE) {
    return Array.from({ length: 4 }, (_, i) => ({
      id: `DEMO-LEAD-${i + 1}`,
      name: `Demo Lead ${i + 1}`,
      email: `lead${i + 1}@example.com`,
      phone: `555-000${i}`,
      source: 'manual',
      service_interest: i % 2 === 0 ? 'FeelBassVIP Event' : 'Home Setup',
      estimated_value: String((i + 1) * 250),
      status: ['new','contacted','qualified','converted'][i % 4],
      created_at: new Date().toISOString()
    }))
  }
  const admin = getSupabaseAdmin()
  let query = admin.from('leads').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data || []
}

export async function updateLeadStatus(id: string, status: string) {
  if (DEMO_MODE) return { success: true }
  const admin = getSupabaseAdmin()
  const { error } = await admin.from('leads').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  return { success: true }
}

// ---- Reminders ----
export interface Reminder {
  id?: string
  title: string
  body?: string
  remind_at: string
  channel?: string
  status?: string
  created_at?: string
}

export async function createReminder(reminder: Omit<Reminder, 'id' | 'created_at'>) {
  if (DEMO_MODE) return { success: true, id: 'DEMO-REM-' + Date.now() }
  const admin = getSupabaseAdmin()
  const { data, error } = await admin.from('reminders').insert(reminder).select().single()
  if (error) return { success: false, error: error.message }
  return { success: true, id: data.id }
}

export async function listReminders() {
  if (DEMO_MODE) {
    return Array.from({ length: 3 }, (_, i) => ({
      id: `DEMO-REM-${i + 1}`,
      title: `Demo Reminder ${i + 1}`,
      body: 'Follow up with client',
      remind_at: new Date(Date.now() + (i + 1) * 3600000).toISOString(),
      channel: 'email',
      status: 'pending',
      created_at: new Date().toISOString()
    }))
  }
  const admin = getSupabaseAdmin()
  const { data, error } = await admin.from('reminders').select('*').order('remind_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data || []
}
