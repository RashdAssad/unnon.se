import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GeneratorView from './GeneratorView'
import { expect, test, vi, beforeEach, describe } from 'vitest'

// Mock fetch globally
global.fetch = vi.fn()

describe('GeneratorView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  test('handles generation state and API calls', async () => {
    // Mock successful API response
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ content: 'AI generated code for a modern landing page' })
    })

    render(<GeneratorView />)
    const textarea = screen.getByPlaceholderText(/describe the website you want to build/i)
    const button = screen.getByRole('button', { name: /generate/i })

    // 1. Test empty prompt (should not trigger generation)
    fireEvent.click(button)
    expect(button).not.toHaveTextContent(/generating/i)

    // 2. Test with a prompt
    const prompt = 'Create a modern landing page'
    fireEvent.change(textarea, { target: { value: prompt } })
    fireEvent.click(button)

    expect(button).toHaveTextContent(/generating/i)
    expect(button).toBeDisabled()
    expect(textarea).toBeDisabled()

    // Wait for API and check result
    await waitFor(() => {
      expect(screen.getByText(/generated result/i)).toBeInTheDocument()
    }, { timeout: 4000 })

    expect(screen.getByText(/successfully generated your website/i)).toBeInTheDocument()
    expect(screen.getByText(/AI Response: AI generated code/i)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /preview/i })).toBeInTheDocument()

    // 4. Test Clear Result
    const clearButton = screen.getByRole('button', { name: /clear result/i })
    fireEvent.click(clearButton)
    expect(screen.queryByText(/generated result/i)).not.toBeInTheDocument()
    expect(textarea).not.toBeDisabled()
    expect(textarea.value).toBe(prompt) // Prompt should stay
  })

  test('handles API errors', async () => {
    // Mock failed API response
    ;(global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'API Key invalid' })
    })

    render(<GeneratorView />)
    const textarea = screen.getByPlaceholderText(/describe the website you want to build/i)
    const button = screen.getByRole('button', { name: /generate/i })

    fireEvent.change(textarea, { target: { value: 'Trigger error' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/API Key invalid/i)).toBeInTheDocument()
    })

    expect(button).not.toBeDisabled()
    expect(textarea).not.toBeDisabled()
  })

  test('switches between Generator and Replicator modes', () => {
    render(<GeneratorView />)
    
    // Default mode should be Generator
    expect(screen.getByText(/generator mode/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/describe the website you want to build/i)).toBeInTheDocument()

    // Switch to Replicator mode
    const replicatorTab = screen.getByRole('tab', { name: /replicator/i })
    fireEvent.click(replicatorTab)

    expect(screen.getByText(/replicator mode/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter website url to replicate/i)).toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/describe the website you want to build/i)).not.toBeInTheDocument()

    // Switch back to Generator mode
    const generatorTab = screen.getByRole('tab', { name: /generator/i })
    fireEvent.click(generatorTab)

    expect(screen.getByText(/generator mode/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/describe the website you want to build/i)).toBeInTheDocument()
  })

  test('calls Replicator API and displays result', async () => {
    // Mock Replicator API response
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ content: 'Replicated website code' })
    })

    render(<GeneratorView />)
    
    // Switch to Replicator
    const replicatorTab = screen.getByRole('tab', { name: /replicator/i })
    fireEvent.click(replicatorTab)

    const input = screen.getByPlaceholderText(/enter website url to replicate/i)
    const button = screen.getByRole('button', { name: /replicate website/i })

    // Enter URL and submit
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    fireEvent.click(button)

    expect(button).toHaveTextContent(/replicating/i)
    expect(button).toBeDisabled()

    // Wait for result
    await waitFor(() => {
      expect(screen.getByText(/generated result/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/AI Response: Replicated website code/i)).toBeInTheDocument()
    
    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith('/api/replicate', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com' })
    }))
  })

  test('displays specific error for rate limiting (429)', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Too many requests. Please try again later.' })
    })

    render(<GeneratorView />)
    
    const replicatorTab = screen.getByRole('tab', { name: /replicator/i })
    fireEvent.click(replicatorTab)

    const input = screen.getByPlaceholderText(/enter website url to replicate/i)
    const button = screen.getByRole('button', { name: /replicate website/i })

    fireEvent.change(input, { target: { value: 'https://busy.com' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/too many requests/i)).toBeInTheDocument()
    })
  })
})