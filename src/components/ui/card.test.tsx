import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { expect, test } from 'vitest'

test('shadcn Card component can be rendered', () => {
  render(
    <Card>
      <CardHeader>
        <CardTitle>Test Card</CardTitle>
      </CardHeader>
      <CardContent>Card content</CardContent>
    </Card>
  )
  expect(screen.getByText(/test card/i)).toBeInTheDocument()
  expect(screen.getByText(/card content/i)).toBeInTheDocument()
})
