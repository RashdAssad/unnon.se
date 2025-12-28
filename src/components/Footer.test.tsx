import { render, screen } from '@testing-library/react'
import Footer from './Footer'
import { expect, test } from 'vitest'

test('Footer renders correctly', () => {
  render(<Footer />)
  expect(screen.getByText(/built by AI Website Replicator & Generator/i)).toBeInTheDocument()
})
