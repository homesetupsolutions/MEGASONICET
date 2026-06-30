import { NextRequest } from 'next/server'
import { chatWithGemini, generateBookingConfirmation, generateLeadResponse } from '@/lib/azure'
import { apiError, apiSuccess } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, messages, booking, lead } = body

    if (action === 'chat') {
      if (!messages || !Array.isArray(messages)) return apiError('messages array required', 400)
      const result = await chatWithGemini(messages)
      return apiSuccess({ reply: result.content, demo: result.demo, tokens: result.tokens })
    }

    if (action === 'booking_confirmation') {
      if (!booking) return apiError('booking object required', 400)
      const message = await generateBookingConfirmation(booking)
      return apiSuccess({ message })
    }

    if (action === 'lead_response') {
      if (!lead) return apiError('lead object required', 400)
      const message = await generateLeadResponse(lead)
      return apiSuccess({ message })
    }

    return apiError('Invalid action. Use: chat, booking_confirmation, lead_response', 400)
  } catch (e: any) {
    return apiError(e.message)
  }
}
