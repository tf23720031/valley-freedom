import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'

describe('VALLEY FREEDOM application shell', () => {
  it('shows the editorial home and navigable experience entry point', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /想去哪，就去哪/ })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: '找在地旅伴' })[0]).toHaveAttribute('href', expect.stringContaining('/companions'))
    expect(screen.getByLabelText('切換展示角色')).toBeInTheDocument()
  })
})
