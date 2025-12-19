import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('Infrastructure Skeleton', () => {
    it('renders a dummy component', () => {
        render(<div>Test Infrastructure Ready</div>)
        expect(screen.getByText('Test Infrastructure Ready')).toBeInTheDocument()
    })
})
