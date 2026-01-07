import { NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string.' },
        { status: 400 }
      )
    }

    const gemini = getGeminiClient()
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ content: text })
  } catch (error: any) {
    console.error('Generation Error:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred during generation.' },
      { status: 500 }
    )
  }
}
