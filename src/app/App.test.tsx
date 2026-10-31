import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { App } from './App'

afterEach(cleanup)

describe('VALLEY FREEDOM application shell', () => {
  it('shows the editorial home and navigable experience entry point', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: '東岸一季' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: '找在地旅伴' })[0]).toHaveAttribute('href', expect.stringContaining('/companions'))
    expect(screen.getByLabelText('切換展示角色')).toBeInTheDocument()
  })
  it('provides a separate administrator perspective for partner growth data', () => {
    render(<App />)
    fireEvent.change(screen.getAllByLabelText('切換展示角色')[0], { target: { value: 'admin' } })
    expect(screen.getByRole('link', { name: '店家成長管理' })).toHaveAttribute('href', '/admin/growth')
    expect(screen.queryByRole('link', { name: /^店家成長$/ })).not.toBeInTheDocument()
  })
})
