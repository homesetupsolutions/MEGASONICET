import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ reply: 'Gemini API key not configured. Add GEMINI_API_KEY to .env' }, { status: 200 })
    }
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a business assistant for MegaSonic Command Center, helping manage FeelBassVIP (wearable bass headset rental events) and HomeSetupSolutions (residential tech install) in Calgary, Alberta. Be concise and helpful.\n\nUser: ${message}`
            }]
          }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
        })
      }
    )
    const data = await res.json()
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.'
    return NextResponse.json({ reply })
  } catch (e: any) {
    return NextResponse.json({ reply: `Error: ${e.message}` }, { status: 500 })
  }
}
