import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppStateProvider } from '../../store/AppStateProvider'
import { FeedbackProvider } from '../../components/Feedback'
import { resetStoreForTests } from '../../store/appStore'
import { YouthPage } from './YouthPage'

beforeEach(() => { localStorage.clear(); resetStoreForTests() })
describe('youth task view', () => {
  it('keeps the selected task and its application status consistent after applying and filtering', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><FeedbackProvider><MemoryRouter><YouthPage/></MemoryRouter></FeedbackProvider></AppStateProvider>)
    const detail = screen.getByRole('complementary', { name: '選取任務詳情' })
    expect(within(detail).getByRole('heading', { name: '平台資料校對' })).toBeInTheDocument()
    await user.click(within(detail).getByRole('button', { name: /提出申請/ }))
    expect(within(detail).getByRole('heading', { name: '平台資料校對' })).toBeInTheDocument()
    expect(within(detail).getByText('待審核')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '我的申請' }))
    expect(within(detail).getByRole('heading', { name: '平台資料校對' })).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: '查看任務內容' })[0])
    expect(within(detail).getByRole('heading', { name: '文旦體驗場域協力' })).toBeInTheDocument()
    expect(within(detail).getByText('已錄取')).toBeInTheDocument()
  })
  it('applies for an available task once and persists the pending status', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/youth']}><Routes><Route path="/youth" element={<YouthPage/>}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
    await user.click(screen.getAllByRole('button', { name: /提出申請/ })[0])
    await waitFor(() => expect(JSON.parse(localStorage.getItem('valley-freedom-state-v1')!).applications.some((item: { taskId: string; status: string }) => item.taskId === 'task-operations' && item.status === 'pending')).toBe(true))
  })
})
