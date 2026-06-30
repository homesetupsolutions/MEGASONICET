import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendReminderSMS } from '@/lib/twilio'
import { hoursUntil } from '@/lib/utils'

// POST /api/reminders — run reminder engine (call from cron or manually)
export async function POST(req: NextRequest) {
  const { data: bookings, error } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('status', 'confirmed')
    .gt('event_date', new Date().toISOString())

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const results: any[] = []

  for (const booking of bookings || []) {
    const h = hoursUntil(booking.event_date)
    const phone = booking.client_phone
    const name = booking.client_name
    const dateStr = new Date(booking.event_date).toLocaleString('en-CA', { timeZone: 'America/Edmonton' })

    // 50-hour reminder
    if (h <= 50 && h > 26 && !booking.reminder_50h_sent && phone) {
      const result = await sendReminderSMS(phone, name, dateStr, '50h')
      await supabaseAdmin.from('bookings').update({ reminder_50h_sent: true }).eq('id', booking.id)
      results.push({ id: booking.id, type: '50h', ...result })
    }

    // 26-hour reminder
    if (h <= 26 && h > 1 && !booking.reminder_26h_sent && phone) {
      const result = await sendReminderSMS(phone, name, dateStr, '26h')
      await supabaseAdmin.from('bookings').update({ reminder_26h_sent: true }).eq('id', booking.id)
      results.push({ id: booking.id, type: '26h', ...result })
    }

    // Same-day reminder
    if (h <= 24 && h > 0 && !booking.reminder_sameday_sent && phone) {
      const result = await sendReminderSMS(phone, name, dateStr, 'same-day')
      await supabaseAdmin.from('bookings').update({ reminder_sameday_sent: true }).eq('id', booking.id)
      results.push({ id: booking.id, type: 'same-day', ...result })
    }
  }

  return NextResponse.json({ processed: bookings?.length || 0, sent: results.length, results })
}

// GET /api/reminders — preview what reminders are pending
export async function GET() {
  const { data: bookings, error } = await supabaseAdmin
    .from('bookings')
    .select('id, client_name, client_phone, event_date, reminder_50h_sent, reminder_26h_sent, reminder_sameday_sent, status')
    .eq('status', 'confirmed')
    .gt('event_date', new Date().toISOString())

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const pending = (bookings || []).map(b => {
    const h = hoursUntil(b.event_date)
    return {
      id: b.id,
      client_name: b.client_name,
      hours_until: Math.round(h),
      event_date: b.event_date,
      pending_50h: h <= 50 && h > 26 && !b.reminder_50h_sent,
      pending_26h: h <= 26 && h > 1 && !b.reminder_26h_sent,
      pending_sameday: h <= 24 && h > 0 && !b.reminder_sameday_sent
    }
  })

  return NextResponse.json(pending)
}
