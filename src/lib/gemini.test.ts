import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getGeminiClient } from './gemini'

describe('Gemini Client', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('throws an error if GEMINI_API_KEY is not defined', () => {
    delete process.env.GEMINI_API_KEY
    expect(() => getGeminiClient()).toThrow(/GEMINI_API_KEY is not set/)
  })

  it('returns a GoogleGenerativeAI instance if API key is set', () => {
    process.env.GEMINI_API_KEY = 'mock-api-key'
    const client = getGeminiClient()
    expect(client).toBeDefined()
    expect(client).toHaveProperty('getGenerativeModel')
  })
})
