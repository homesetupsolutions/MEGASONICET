import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createEvent, checkAvailability } from '@/lib/google'
import { sendReminderSMS } from '@/lib/twilio'
import { calcJobTotal } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  let query = supabaseAdmin.from('bookings').select('*').order('event_date', { ascending: true })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { client_name, client_phone, client_email, event_date, event_end, location, hours, rate, extras, notes, service_type } = body

  if (!client_name || !event_date) {
    return NextResponse.json({ error: 'client_name and event_date are required' }, { status: 400 })
  }

  // Check calendar availability at vip@feelbass.vip
  const available = await checkAvailability(event_date, event_end || new Date(new Date(event_date).getTime() + 7200000).toISOString())
  if (!available) {
    return NextResponse.json({ error: 'Time slot not available — conflict on vip@feelbass.vip calendar' }, { status: 409 })
  }

  const total = calcJobTotal(Number(hours) || 0, Number(rate) || 0, Number(extras) || 0)

  const { data, error } = await supabaseAdmin.from('bookings').insert({
    client_name, client_phone, client_email, event_date,
    event_end: event_end || null,
    location, hours: Number(hours) || null,
    rate: Number(rate) || null,
    extras: Number(extras) || 0,
    total, notes, service_type,
    status: 'confirmed',
    reminder_50h_sent: false,
    reminder_26h_sent: false,
    reminder_sameday_sent: false
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Sync to Google Calendar (vip@feelbass.vip)
  try {
    await createEvent({
      summary: `${service_type || 'FeelBassVIP'} — ${client_name}`,
      description: `Client: ${client_name}\nPhone: ${client_phone}\nTotal: $${total}\n${notes || ''}`,
      start: event_date,
      end: event_end || new Date(new Date(event_date).getTime() + 7200000).toISOString(),
      location: location || 'Calgary, AB',
      attendees: client_email ? [client_email, 'vip@feelbass.vip'] : ['vip@feelbass.vip']
    })
  } catch (e) {
    console.error('Google Calendar sync failed:', e)
  }

  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const { data, error } = await supabaseAdmin.from('bookings').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const { error } = await supabaseAdmin.from('bookings').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
