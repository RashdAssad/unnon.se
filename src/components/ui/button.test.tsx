import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { expect, test } from 'vitest'

test('shadcn Button component can be rendered', () => {
  render(<Button>Click me</Button>)
  const button = screen.getByRole('button', { name: /click me/i })
  expect(button).toBeInTheDocument()
})
