import { NextRequest } from 'next/server'
import { listPayments, createPaymentLink, getSquareLocations } from '@/lib/square'
import { apiError, apiSuccess } from '@/lib/utils'

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
    return apiSuccess({ payments })
  } catch (e: any) {
    return apiError(e.message)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, business, amount_cents, description, customer_name, customer_email, redirect_url } = body

    if (!business || !amount_cents) return apiError('Missing required fields: business, amount_cents', 400)

    if (action === 'payment_link') {
      const result = await createPaymentLink(
        business,
        amount_cents,
        description || 'MEGASONICET Payment',
        customer_name,
        customer_email,
        redirect_url
      )
      return apiSuccess(result, 201)
    }

    return apiError('Invalid action. Use: payment_link', 400)
  } catch (e: any) {
    return apiError(e.message)
  }
}
