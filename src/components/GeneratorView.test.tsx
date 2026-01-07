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

    // 3. Wait for API and check result
    await waitFor(() => {
      expect(screen.getByText(/generated result/i)).toBeInTheDocument()
    }, { timeout: 4000 })

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
})