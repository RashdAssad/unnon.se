import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { expect, test } from 'vitest'

test('shadcn Button component can be rendered', () => {
  render(<Button>Click me</Button>)
  const button = screen.getByRole('button', { name: /click me/i })
  expect(button).toBeInTheDocument()
})

test('shadcn Button component can be rendered as a child', () => {
  render(
    <Button asChild>
      <a href="/test">Link Button</a>
    </Button>
  )
  const link = screen.getByRole('link', { name: /link button/i })
  expect(link).toBeInTheDocument()
  expect(link).toHaveClass('inline-flex items-center justify-center')
})
