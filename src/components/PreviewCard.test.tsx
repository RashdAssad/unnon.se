import { render, screen } from '@testing-library/react'
import PreviewCard from './PreviewCard'
import { expect, test } from 'vitest'

test('PreviewCard displays the site title and a placeholder image', () => {
  const mockData = {
    title: 'My Awesome SaaS',
    description: 'A landing page for my product'
  }
  
  render(<PreviewCard title={mockData.title} description={mockData.description} />)
  
  expect(screen.getByText(mockData.title)).toBeInTheDocument()
  expect(screen.getByText(mockData.description)).toBeInTheDocument()
  expect(screen.getByRole('img', { name: /preview/i })).toBeInTheDocument()
})
