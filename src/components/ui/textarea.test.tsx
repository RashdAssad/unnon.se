import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Textarea } from './textarea'

describe('Textarea', () => {
  it('renders correctly', () => {
    render(<Textarea placeholder="Test placeholder" />)
    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument()
  })

  it('can be disabled', () => {
    render(<Textarea disabled placeholder="Disabled" />)
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Textarea className="custom-class" placeholder="Custom" />)
    expect(screen.getByPlaceholderText('Custom')).toHaveClass('custom-class')
  })
})
