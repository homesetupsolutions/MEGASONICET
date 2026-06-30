import { NextRequest } from 'next/server'
import { createLead, listLeads, updateLeadStatus } from '@/lib/supabase'
import { apiError, apiSuccess } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const leads = await listLeads(status)
    return apiSuccess(leads)
  } catch (e: any) {
    return apiError(e.message)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, source, service_interest, estimated_value, notes } = body
    if (!name) return apiError('Missing required field: name', 400)
    const result = await createLead({
      name,
      email,
      phone,
      source: source || 'manual',
      service_interest,
      estimated_value,
      status: 'new',
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
    const result = await updateLeadStatus(id, status)
    return apiSuccess(result)
  } catch (e: any) {
    return apiError(e.message)
  }
}
