import { render, screen } from '@testing-library/react'
import RootLayout, { LayoutContent } from './layout'
import { expect, test, vi } from 'vitest'

// Mock the Inter font since it's used in the layout
vi.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter-font',
  }),
}))

// Mock localFont
vi.mock('next/font/local', () => ({
  default: () => ({
    variable: '--font-klaxon-mock',
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

test('RootLayout renders children correctly', () => {
  render(
    <RootLayout>
      <div data-testid="child">Root Content</div>
    </RootLayout>
  )
  
  expect(screen.getByTestId('child')).toBeInTheDocument()
  expect(screen.getByText('Root Content')).toBeInTheDocument()
})
