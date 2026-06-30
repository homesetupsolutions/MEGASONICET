import { NextRequest, NextResponse } from 'next/server'
import { createPayment, listPayments } from '@/lib/square'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const payments = await listPayments(20)
  return NextResponse.json(payments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { amount_cents, source_id, booking_id, note } = body
  if (!amount_cents || !source_id) {
    return NextResponse.json({ error: 'amount_cents and source_id required' }, { status: 400 })
  }
  const result = await createPayment(Number(amount_cents), source_id, note)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 402 })
  }
  // Update booking payment status if booking_id provided
  if (booking_id) {
    await supabaseAdmin.from('bookings').update({
      payment_status: 'paid',
      square_payment_id: result.paymentId
    }).eq('id', booking_id)
  }
  return NextResponse.json({ success: true, paymentId: result.paymentId, demo: result.demo })
}
