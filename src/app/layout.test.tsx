import { render, screen } from '@testing-library/react'
import RootLayout from './layout'
import { expect, test, vi } from 'vitest'

// Mock the Inter font since it's used in the layout
vi.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter-font',
  }),
}))

test('RootLayout renders header and footer', () => {
  render(
    <RootLayout>
      <div>Content</div>
    </RootLayout>
  )
  
  expect(screen.getByRole('banner')).toBeInTheDocument() // Header
  expect(screen.getByRole('contentinfo')).toBeInTheDocument() // Footer
  expect(screen.getByText('Content')).toBeInTheDocument()
})
