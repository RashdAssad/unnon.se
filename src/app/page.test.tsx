import { render, screen } from '@testing-library/react'
import Home from './page'
import { expect, test } from 'vitest'

test('Home page renders GeneratorView', () => {
  render(<Home />)
  expect(screen.getByText(/Generator Mode/i)).toBeInTheDocument()
})
