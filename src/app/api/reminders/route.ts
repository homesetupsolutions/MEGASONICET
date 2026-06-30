import { NextRequest } from 'next/server'
import { createReminder, listReminders } from '@/lib/supabase'
import { sendSMS } from '@/lib/pbx'
import { apiError, apiSuccess } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const business = searchParams.get('business') as 'FEELBASSVIP' | 'HSS' | null
    const limit = parseInt(searchParams.get('limit') || '50')
    const reminders = await listReminders(business || undefined, limit)
    return apiSuccess({ reminders })
  } catch (e: any) {
    return apiError(e.message)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { business, type, scheduled_at, message, booking_id, lead_id, send_now, to_phone } = body
    if (!business || !type || !scheduled_at) {
      return apiError('Missing required fields: business, type, scheduled_at', 400)
    }
    const result = await createReminder({
      business,
      type,
      scheduled_at,
      message,
      booking_id,
      lead_id,
      status: 'pending'
    })

    // If send_now and phone provided, dispatch SMS immediately
    if (send_now && to_phone && message && type === 'sms') {
      const smsResult = await sendSMS(to_phone, message, business)
      return apiSuccess({ ...result, sms_sent: smsResult.success, sms_id: smsResult.messageId })
    }

    return apiSuccess(result, 201)
  } catch (e: any) {
    return apiError(e.message)
  }
}
