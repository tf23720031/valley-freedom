import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppStateProvider } from '../../store/AppStateProvider'
import { FeedbackProvider } from '../../components/Feedback'
import { resetStoreForTests } from '../../store/appStore'
import { RegionalExplorePage } from './RegionalExplorePage'

beforeEach(() => { localStorage.clear(); resetStoreForTests() })

describe('regional exploration', () => {
  it('shows the four route collections and the full candidate list with clear non-partnership copy', () => {
    render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/explore']}><Routes><Route path="/explore" element={<RegionalExplorePage/>}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
    expect(screen.getByRole('heading', { name: '花蓮太魯閣' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '東海岸台 11 線' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '花東縱谷台 9 線' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '臺東南迴' })).toBeInTheDocument()
    for (const name of ['練習曲', '大竹子走部落', '成功海銀行', '新太平洋一號店', '眺港咖啡', 'Liay 里艾廚房', '晉領號', '竹湖山居', '木日光文旦驛站', '笙笙不息', '米粒如福', '卡那歲工坊', 'inapayan 青年工作站', '故火工作室', '達興山號', '藤你的樣子', '捌個零社企']) expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    expect(screen.getByText(/不代表平台已合作/)).toBeInTheDocument()
    expect(screen.getAllByText(/氛圍參考照・非場域實景/).length).toBeGreaterThan(0)
  })

  it('adds a candidate place to the selected date as a draft and leaves bookings untouched', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/places/lookout-cafe']}><Routes><Route path="/places/:placeId" element={<RegionalExplorePage/>}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
    await user.click(screen.getByRole('button', { name: '加入我的行程' }))
    await waitFor(() => expect(JSON.parse(localStorage.getItem('valley-freedom-state-v1')!).itineraries[0].items[0].place).toBe('眺港咖啡'))
    expect(screen.getByText(/已加入自由行程草稿/)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('valley-freedom-state-v1')!).bookings).toHaveLength(4)
  })
})
