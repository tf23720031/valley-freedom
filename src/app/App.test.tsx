import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { App } from './App'
import { resetStoreForTests } from '../store/appStore'

afterEach(cleanup)
beforeEach(() => { localStorage.clear(); resetStoreForTests(); window.history.pushState({}, '', '/') })

describe('VALLEY FREEDOM application shell', () => {
  it('shows the editorial home and navigable experience entry point', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: '東岸一季' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: '找在地旅伴' })[0]).toHaveAttribute('href', expect.stringContaining('/companions'))
    expect(screen.queryByLabelText('切換展示角色')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: '測試登入' })).toHaveAttribute('href', '/login')
  })
  it('logs in with the shared demo account and changes role without losing data', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: '測試登入' }))
    expect(screen.getByRole('heading', { name: '回到你的旅程。' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '直接使用測試帳號' }))
    expect(screen.getByLabelText('切換展示角色')).toHaveValue('traveler')
    expect(screen.getByRole('heading', { name: '我的自由行' })).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('切換展示角色'), { target: { value: 'operator' } })
    expect(screen.getByRole('heading', { name: '業者工作台' })).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('切換展示角色'), { target: { value: 'traveler' } })
    expect(screen.getByRole('heading', { name: '我的自由行' })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('valley-freedom-state-v1')!).authenticated).toBe(true)
  })
  it('provides a separate administrator perspective for partner growth data', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: '測試登入' }))
    fireEvent.click(screen.getByRole('button', { name: '直接使用測試帳號' }))
    fireEvent.change(screen.getAllByLabelText('切換展示角色')[0], { target: { value: 'admin' } })
    expect(screen.getByRole('link', { name: '店家成長管理' })).toHaveAttribute('href', '/admin/growth')
    expect(screen.getByRole('heading', { name: '全平台總覽' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^店家成長$/ })).not.toBeInTheDocument()
  })
  it('guides a guest to login when opening a personal workspace', () => {
    window.history.pushState({}, '', '/itinerary')
    render(<App />)
    expect(screen.getByRole('heading', { name: '回到你的旅程。' })).toBeInTheDocument()
  })
})
