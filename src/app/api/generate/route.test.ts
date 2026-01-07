import { describe, it, expect, vi } from 'vitest'
import { POST } from './route'
import { getGeminiClient } from '@/lib/gemini'

vi.mock('@/lib/gemini', () => ({
  getGeminiClient: vi.fn()
}))

describe('POST /api/generate', () => {
  it('returns 400 if prompt is missing', async () => {
    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({})
    })
    const response = await POST(req)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toMatch(/Prompt is required/)
  })

  it('returns 200 and generated content on success', async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: {
        text: () => 'Generated code structure'
      }
    })
    
    ;(getGeminiClient as any).mockReturnValue({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent
      })
    })

    const req = new Request('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Create a landing page' })
    })
    
    const response = await POST(req)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.content).toBe('Generated code structure')
  })
})
