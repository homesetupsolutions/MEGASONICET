import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Server-side admin client (never expose to browser)
export function getSupabaseAdmin(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export const DEMO_MODE = !supabaseUrl || supabaseUrl === ''

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
  if (DEMO_MODE) return { success: true, demo: true }
  const admin = getSupabaseAdmin()
  const { error } = await admin.from('bookings').update({ status }).eq('id', id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ---- Leads ----
export interface Lead {
  id?: string
  business: 'FEELBASSVIP' | 'HSS'
  name: string
  email?: string
  phone?: string
  source: 'angi' | 'direct' | 'referral' | 'square' | 'other'
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost'
  notes?: string
  created_at?: string
}

export async function createLead(lead: Omit<Lead, 'id' | 'created_at'>) {
  if (DEMO_MODE) return { success: true, id: 'DEMO-LEAD-' + Date.now(), demo: true }
  const admin = getSupabaseAdmin()
  const { data, error } = await admin.from('leads').insert(lead).select().single()
  if (error) return { success: false, error: error.message }
  return { success: true, id: data.id }
}

export async function listLeads(business?: string, limit = 50) {
  if (DEMO_MODE) {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `DEMO-LEAD-${i + 1}`,
      business: i % 2 === 0 ? 'FEELBASSVIP' : 'HSS',
      name: `Demo Lead ${i + 1}`,
      source: 'angi',
      status: 'new',
      created_at: new Date().toISOString()
    }))
  }
  const admin = getSupabaseAdmin()
  let query = admin.from('leads').select('*').order('created_at', { ascending: false }).limit(limit)
  if (business) query = query.eq('business', business)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data || []
}

// ---- Reminders ----
export interface Reminder {
  id?: string
  booking_id?: string
  lead_id?: string
  business: 'FEELBASSVIP' | 'HSS'
  type: 'sms' | 'email' | 'call'
  scheduled_at: string
  status: 'pending' | 'sent' | 'failed'
  message?: string
  created_at?: string
}

export async function createReminder(reminder: Omit<Reminder, 'id' | 'created_at'>) {
  if (DEMO_MODE) return { success: true, id: 'DEMO-REM-' + Date.now(), demo: true }
  const admin = getSupabaseAdmin()
  const { data, error } = await admin.from('reminders').insert(reminder).select().single()
  if (error) return { success: false, error: error.message }
  return { success: true, id: data.id }
}

export async function listReminders(business?: string, limit = 50) {
  if (DEMO_MODE) {
    return Array.from({ length: 3 }, (_, i) => ({
      id: `DEMO-REM-${i + 1}`,
      business: 'FEELBASSVIP',
      type: 'sms',
      scheduled_at: new Date(Date.now() + i * 3600000).toISOString(),
      status: 'pending',
      message: `Reminder ${i + 1}: Confirm your booking`,
      created_at: new Date().toISOString()
    }))
  }
  const admin = getSupabaseAdmin()
  let query = admin.from('reminders').select('*').order('scheduled_at', { ascending: true }).limit(limit)
  if (business) query = query.eq('business', business)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data || []
}
