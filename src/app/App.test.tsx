import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'

describe('VALLEY FREEDOM application shell', () => {
  it('shows the editorial home and navigable experience entry point', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /把縱谷的日常/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /探索地方體驗/ })).toHaveAttribute('href', '/experiences')
    expect(screen.getByLabelText('切換展示角色')).toBeInTheDocument()
  })
})
