import { render, screen } from '@testing-library/react'
import { Input } from '@/components/ui/input'
import { expect, test } from 'vitest'

test('shadcn Input component can be rendered', () => {
  render(<Input placeholder="Enter something" />)
  const input = screen.getByPlaceholderText(/enter something/i)
  expect(input).toBeInTheDocument()
})
