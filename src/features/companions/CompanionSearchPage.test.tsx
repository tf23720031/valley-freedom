import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppStateProvider } from '../../store/AppStateProvider'
import { FeedbackProvider } from '../../components/Feedback'
import { resetStoreForTests } from '../../store/appStore'
import { CompanionSearchPage } from './CompanionSearchPage'

beforeEach(() => { cleanup(); localStorage.clear(); resetStoreForTests() })

describe('companion service information', () => {
  it('explains the request flow and shows demo interests, qualification and restrictions', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/companions?date=2026-11-15&startTime=14%3A00&duration=90&destination=瑞穗']}><Routes><Route path="/companions" element={<CompanionSearchPage/>}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
    expect(screen.getByText(/預約流程/)).toBeInTheDocument()
    expect(screen.getByText(/送出需求後會怎麼進行/)).toBeInTheDocument()
    expect(screen.getByText(/待旅伴回覆/)).toBeInTheDocument()
    expect(screen.getByText(/農村日常、地方飲食、慢步行/)).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: /提出預約需求/ })[0])
    expect(screen.getByText(/示意服務費用/)).toBeInTheDocument()
    expect(screen.getByText(/不提供依法須資格的導覽/)).toBeInTheDocument()
  })

  it('shows virtual companions and explains the 30-minute billing rule', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/companions?date=2026-11-15&startTime=14%3A00&duration=90&destination=瑞穗']}><Routes><Route path="/companions" element={<CompanionSearchPage/>}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
    expect(screen.getByText('6 位可詢問')).toBeInTheDocument()
    expect(screen.getByText(/示意旅伴名單/)).toBeInTheDocument()
    const duration = screen.getByRole('spinbutton', { name: '服務時長（分鐘）' })
    await user.clear(duration)
    await user.type(duration, '45')
    expect(screen.getByText(/未滿 30 分鐘以 30 分鐘計費/)).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: /提出預約需求/ })[0])
    expect(screen.getAllByText(/NT\$ 900/).length).toBeGreaterThan(0)
  })

  it('offers broad Hualien–Taitung region choices while keeping Ruisui as the default', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/companions?date=2026-11-15&startTime=14%3A00&duration=90&destination=瑞穗']}><Routes><Route path="/companions" element={<CompanionSearchPage/>}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
    const destination = screen.getByRole('combobox', { name: /地點或區域/ })
    expect(destination).toHaveValue('瑞穗')
    await user.selectOptions(destination, '花東全區')
    expect(screen.getByText('8 位可詢問')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '花蓮縣' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '臺東縣' })).toBeInTheDocument()
  })

  it('clears the default Ruisui meeting point when another county is selected', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/companions?date=2026-11-15&startTime=14%3A00&duration=90&destination=瑞穗']}><Routes><Route path="/companions" element={<CompanionSearchPage/>}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
    await user.selectOptions(screen.getByRole('combobox', { name: /地點或區域/ }), '臺東縣')
    await user.click(screen.getAllByRole('button', { name: /提出預約需求/ })[0])
    expect(screen.getByLabelText('集合位置')).toHaveValue('')
  })
})
