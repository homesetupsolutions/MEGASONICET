import { NextRequest } from 'next/server'
import { chatWithGemini } from '@/lib/azure'
import { apiError, apiSuccess } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, messages } = body

    // Support both single message (from UI) and messages array
    const chatMessages = messages || [
      { role: 'user', content: message }
    ]

    if (!chatMessages || !Array.isArray(chatMessages)) {
      return apiError('message or messages required', 400)
    }

    const result = await chatWithGemini(chatMessages)
    return apiSuccess({ reply: result.content, demo: result.demo, tokens: result.tokens })
  } catch (e: any) {
    return apiError(e.message)
  }
}
