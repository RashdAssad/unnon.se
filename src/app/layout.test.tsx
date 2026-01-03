import { render, screen } from '@testing-library/react'
import { LayoutContent } from './layout'
import { expect, test, vi } from 'vitest'

// Mock the Inter font since it's used in the layout
vi.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter-font',
  }),
}))

test('LayoutContent renders header and footer', () => {
  render(
    <LayoutContent>
      <div>Content</div>
    </LayoutContent>
  )
  
  expect(screen.getByRole('banner')).toBeInTheDocument() // Header
  expect(screen.getByRole('contentinfo')).toBeInTheDocument() // Footer
  expect(screen.getByText('Content')).toBeInTheDocument()
})
