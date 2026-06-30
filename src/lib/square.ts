const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN || ''
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID || ''
const DEMO_MODE = !SQUARE_ACCESS_TOKEN

export interface PaymentResult {
  success: boolean
  paymentId?: string
  error?: string
  demo?: boolean
}

export async function createPayment(amountCents: number, sourceId: string, note?: string): Promise<PaymentResult> {
  if (DEMO_MODE) {
    return { success: true, paymentId: 'DEMO-' + Date.now(), demo: true }
  }
  const res = await fetch('https://connect.squareup.com/v2/payments', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      amount_money: { amount: amountCents, currency: 'CAD' },
      source_id: sourceId,
      location_id: SQUARE_LOCATION_ID,
      note
    })
  })
  const data = await res.json()
  if (data.payment) return { success: true, paymentId: data.payment.id }
  return { success: false, error: data.errors?.[0]?.detail || 'Payment failed' }
}

export async function listPayments(limit = 20): Promise<any[]> {
  if (DEMO_MODE) {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `DEMO-PAY-${i + 1}`,
      amount_money: { amount: (i + 1) * 15000, currency: 'CAD' },
      status: 'COMPLETED',
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
      note: `Demo booking #${i + 1}`
    }))
  }
  const res = await fetch(`https://connect.squareup.com/v2/payments?limit=${limit}&location_id=${SQUARE_LOCATION_ID}`, {
    headers: { 'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}` }
  })
  const data = await res.json()
  return data.payments || []
}

export function isDemoMode(): boolean { return DEMO_MODE }
