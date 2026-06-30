import { NextRequest } from 'next/server'
import { listPayments, createPaymentLink, getSquareLocations } from '@/lib/square'
import { apiError, apiSuccess } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action') || 'payments'
    const business = searchParams.get('business') as 'FEELBASSVIP' | 'HSS' | null
    const limit = parseInt(searchParams.get('limit') || '50')

    if (action === 'locations') {
      const locations = await getSquareLocations(business || 'FEELBASSVIP')
      return apiSuccess({ locations })
    }

    const payments = await listPayments(business || 'FEELBASSVIP', limit)
    return apiSuccess(payments)
  } catch (e: any) {
    return apiError(e.message)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { business, amount, currency, note, email } = body
    if (!amount) return apiError('Missing required field: amount', 400)
    const result = await createPaymentLink({
      business: business || 'FEELBASSVIP',
      amount_cents: amount,
      currency: currency || 'CAD',
      description: note || 'MEGASONICET Payment',
      customer_email: email
    })
    return apiSuccess(result, 201)
  } catch (e: any) {
    return apiError(e.message)
  }
}
