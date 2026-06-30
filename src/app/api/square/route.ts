import { NextRequest } from 'next/server'
import { listPayments, createPaymentLink, getSquareLocations } from '@/lib/square'
import { apiError, apiSuccess } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action') || 'payments'
    const business = (searchParams.get('business') || 'FEELBASSVIP') as 'FEELBASSVIP' | 'HSS'
    const limit = parseInt(searchParams.get('limit') || '50')

    if (action === 'locations') {
      const locations = await getSquareLocations(business)
      return apiSuccess({ locations })
    }

    const payments = await listPayments(business, limit)
    return apiSuccess(payments)
  } catch (e: any) {
    return apiError(e.message)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { business, amount_cents, currency, description, customer_name, customer_email, redirect_url } = body
    if (!amount_cents) return apiError('Missing required field: amount_cents', 400)
    const result = await createPaymentLink({
      business: business || 'FEELBASSVIP',
      amount_cents,
      currency: currency || 'CAD',
      description: description || 'MEGASONICET Payment',
      customer_name,
      customer_email,
      redirect_url
    })
    return apiSuccess(result, 201)
  } catch (e: any) {
    return apiError(e.message)
  }
}
