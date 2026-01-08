import { render, screen, fireEvent } from '@testing-library/react'
import PreviewCard from './PreviewCard'
import { expect, test } from 'vitest'

describe('PreviewCard', () => {
  test('renders title and description', () => {
    render(<PreviewCard title="Test Site" description="A site description" content="export default function..." />)
    expect(screen.getByText('Test Site')).toBeInTheDocument()
    expect(screen.getByText('A site description')).toBeInTheDocument()
  })

  test('toggles between preview and code views', () => {
    const code = 'export default function Site() { return <div>Hello</div> }'
    render(<PreviewCard title="Test Site" description="Desc" content={code} />)
    
    // Default view should be the mock preview (img)
    expect(screen.getByRole('img', { name: /preview of generated website/i })).toBeInTheDocument()
    expect(screen.queryByText(/Site\(\)/)).not.toBeInTheDocument()

    // Switch to code view
    const codeButton = screen.getByRole('button', { name: /view code/i })
    fireEvent.click(codeButton)

    expect(screen.getByText(/export default function Site/)).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /preview of generated website/i })).not.toBeInTheDocument()

    // Switch back to preview
    const previewButton = screen.getByRole('button', { name: /view preview/i })
    fireEvent.click(previewButton)
    expect(screen.getByRole('img', { name: /preview of generated website/i })).toBeInTheDocument()
  })
})