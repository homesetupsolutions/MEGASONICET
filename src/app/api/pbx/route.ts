import { NextRequest } from 'next/server'
import { getCallLogs, sendSMS, clickToCall, getVoicemails, getPBXStatus } from '@/lib/pbx'
import { apiError, apiSuccess } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action') || 'logs'
    const business = searchParams.get('business') as 'FEELBASSVIP' | 'HSS' | null
    const limit = parseInt(searchParams.get('limit') || '50')

    if (action === 'status') {
      const status = await getPBXStatus()
      return apiSuccess({ status })
    }
    if (action === 'voicemail') {
      if (!business) return apiError('business required for voicemail', 400)
      const voicemails = await getVoicemails(business)
      return apiSuccess({ voicemails })
    }
    const logs = await getCallLogs(limit, business || undefined)
    return apiSuccess({ logs })
  } catch (e: any) {
    return apiError(e.message)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, to, message, business, agent_extension } = body
    if (!business || !to) return apiError('Missing required fields: business, to', 400)

    if (action === 'sms') {
      if (!message) return apiError('Missing message for SMS', 400)
      const result = await sendSMS(to, message, business)
      return apiSuccess(result)
    }
    if (action === 'call') {
      const result = await clickToCall(to, business, agent_extension || '101')
      return apiSuccess(result)
    }
    return apiError('Invalid action. Use: sms or call', 400)
  } catch (e: any) {
    return apiError(e.message)
  }
}
