import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GeneratorView from './GeneratorView'
import { expect, test } from 'vitest'

test('GeneratorView handles generation state', async () => {
  render(<GeneratorView />)
  const textarea = screen.getByPlaceholderText(/describe the website you want to build/i)
  const button = screen.getByRole('button', { name: /generate/i })

  fireEvent.change(textarea, { target: { value: 'Test prompt' } })
  fireEvent.click(button)

  expect(button).toHaveTextContent(/generating/i)
  expect(button).toBeDisabled()
  expect(textarea).toBeDisabled()

  // Wait for mock generation to complete
  await waitFor(() => {
    expect(screen.getByText(/generated result/i)).toBeInTheDocument()
    expect(screen.getByText(/generated project/i)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /preview/i })).toBeInTheDocument()
  }, { timeout: 4000 })
})