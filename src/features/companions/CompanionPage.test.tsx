import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppStateProvider } from '../../store/AppStateProvider'
import { FeedbackProvider } from '../../components/Feedback'
import { resetStoreForTests } from '../../store/appStore'
import { CompanionPage } from './CompanionPage'

beforeEach(() => { localStorage.clear(); resetStoreForTests() })

describe('companion profile workspace', () => {
  it('lets a companion update their rate, profile photo and short introduction', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/companion']}><Routes><Route path="/companion" element={<CompanionPage/>}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
    await user.click(screen.getByRole('button', { name: '旅伴端：接單管理' }))
    await user.clear(screen.getByRole('spinbutton', { name: '時薪' }))
    await user.type(screen.getByRole('spinbutton', { name: '時薪' }), '1250')
    await user.clear(screen.getByRole('textbox', { name: '照片網址' }))
    await user.type(screen.getByRole('textbox', { name: '照片網址' }), 'https://images.example.test/companion.jpg')
    await user.clear(screen.getByRole('textbox', { name: '個人介紹（100字內）' }))
    await user.type(screen.getByRole('textbox', { name: '個人介紹（100字內）' }), '我熟悉瑞穗的小路。')
    await user.click(screen.getByRole('button', { name: '儲存個人資料' }))
    await screen.findByText('個人資料已更新。')
    await waitFor(() => expect(JSON.parse(localStorage.getItem('valley-freedom-state-v1')!).companions[0].ratePerHour).toBe(1250))
    const saved = JSON.parse(localStorage.getItem('valley-freedom-state-v1')!).companions[0]
    expect(saved).toMatchObject({ avatar: 'https://images.example.test/companion.jpg', bio: '我熟悉瑞穗的小路。' })
  })
})
