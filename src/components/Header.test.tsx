import { render, screen } from '@testing-library/react'
import Header from './Header'
import { expect, test } from 'vitest'

test('Header renders navigation links', () => {
  render(<Header />)
  expect(screen.getByText(/AI Replicator/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /^generator$/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /^replicator$/i })).toBeInTheDocument()
})
