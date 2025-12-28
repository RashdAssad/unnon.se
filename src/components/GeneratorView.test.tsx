import { render, screen } from '@testing-library/react'
import GeneratorView from './GeneratorView'
import { expect, test } from 'vitest'

test('GeneratorView renders prompt input and generate button', () => {
  render(<GeneratorView />)
  expect(screen.getByPlaceholderText(/describe the website you want to build/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
})
