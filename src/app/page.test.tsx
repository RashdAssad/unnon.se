import { render, screen } from '@testing-library/react'
import Home from './page'
import { expect, test } from 'vitest'

test('Home page renders correct heading', () => {
  render(<Home />)
  const heading = screen.getByRole('heading', { level: 1 })
  expect(heading).toHaveTextContent('AI Website Replicator & Generator')
})
