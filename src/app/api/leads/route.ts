import { NextRequest } from 'next/server'
import { createLead, listLeads } from '@/lib/supabase'
import { apiError, apiSuccess } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const business = searchParams.get('business') as 'FEELBASSVIP' | 'HSS' | null
    const limit = parseInt(searchParams.get('limit') || '50')
    const leads = await listLeads(business || undefined, limit)
    return apiSuccess({ leads })
  } catch (e: any) {
    return apiError(e.message)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { business, name, email, phone, source, notes } = body
    if (!business || !name) return apiError('Missing required fields: business, name', 400)
    const result = await createLead({
      business,
      name,
      email,
      phone,
      source: source || 'direct',
      status: 'new',
      notes
    })
    return apiSuccess(result, 201)
  } catch (e: any) {
    return apiError(e.message)
  }
}
