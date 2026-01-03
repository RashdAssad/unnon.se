import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GeneratorView from './GeneratorView'
import { expect, test } from 'vitest'

test('GeneratorView handles generation state', async () => {
  render(<GeneratorView />)
  const textarea = screen.getByPlaceholderText(/describe the website you want to build/i)
  const button = screen.getByRole('button', { name: /generate/i })

  // 1. Test empty prompt (should not trigger generation)
  fireEvent.click(button)
  expect(button).not.toHaveTextContent(/generating/i)

  // 2. Test with a long prompt
  const longPrompt = 'A'.repeat(60)
  fireEvent.change(textarea, { target: { value: longPrompt } })
  fireEvent.click(button)

  expect(button).toHaveTextContent(/generating/i)
  
  // Wait specifically for the status to change to completed
  await waitFor(() => {
    expect(screen.getByText(/generated result/i)).toBeInTheDocument()
  }, { timeout: 4000 })

  // Verify the truncated prompt is displayed
  const expectedTruncated = longPrompt.substring(0, 50) + '...'
  expect(screen.getByText(new RegExp(expectedTruncated.replace(/\./g, '\\.'), 'i'))).toBeInTheDocument()

  // 3. Clear result
  let clearButton = screen.getByRole('button', { name: /clear result/i })
  fireEvent.click(clearButton)
  expect(screen.queryByText(/generated result/i)).not.toBeInTheDocument()

  // 4. Test with a normal prompt
  fireEvent.change(textarea, { target: { value: 'Test prompt' } })
  fireEvent.click(button)

  expect(button).toHaveTextContent(/generating/i)
  expect(button).toBeDisabled()
  expect(textarea).toBeDisabled()

  // Wait for mock generation to complete
  await waitFor(() => {
    expect(screen.getByText(/generated result/i)).toBeInTheDocument()
  }, { timeout: 4000 })

  expect(screen.getByText(/generated project/i)).toBeInTheDocument()
  expect(screen.getByRole('img', { name: /preview/i })).toBeInTheDocument()

  // 5. Final Clear Result
  clearButton = screen.getByRole('button', { name: /clear result/i })
  fireEvent.click(clearButton)

  expect(screen.queryByText(/generated result/i)).not.toBeInTheDocument()
  expect(textarea).not.toBeDisabled()
  expect(button).not.toBeDisabled()
})