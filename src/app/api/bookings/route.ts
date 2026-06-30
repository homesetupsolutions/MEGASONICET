import { NextRequest } from 'next/server'
import { createBooking, listBookings, updateBookingStatus } from '@/lib/supabase'
import { apiError, apiSuccess } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const business = searchParams.get('business') as 'FEELBASSVIP' | 'HSS' | null
    const limit = parseInt(searchParams.get('limit') || '50')
    const bookings = await listBookings(business || undefined, limit)
    return apiSuccess({ bookings })
  } catch (e: any) {
    return apiError(e.message)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { business, customer_name, customer_email, customer_phone, service, event_date, amount_cents, notes } = body
    if (!business || !customer_name || !service || !event_date) {
      return apiError('Missing required fields: business, customer_name, service, event_date', 400)
    }
    const result = await createBooking({
      business,
      customer_name,
      customer_email,
      customer_phone,
      service,
      event_date,
      status: 'pending',
      amount_cents,
      notes
    })
    return apiSuccess(result, 201)
  } catch (e: any) {
    return apiError(e.message)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status } = body
    if (!id || !status) return apiError('Missing id or status', 400)
    const result = await updateBookingStatus(id, status)
    return apiSuccess(result)
  } catch (e: any) {
    return apiError(e.message)
  }
}
