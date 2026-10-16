import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppStateProvider } from '../../store/AppStateProvider'
import { FeedbackProvider } from '../../components/Feedback'
import { resetStoreForTests } from '../../store/appStore'
import { YouthPage } from './YouthPage'

beforeEach(() => { localStorage.clear(); resetStoreForTests() })
describe('youth task view', () => {
  it('applies for an available task once and persists the pending status', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/youth']}><Routes><Route path="/youth" element={<YouthPage/>}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
    await user.click(screen.getAllByRole('button', { name: /提出申請/ })[0])
    await waitFor(() => expect(JSON.parse(localStorage.getItem('valley-freedom-state-v1')!).applications.some((item: { taskId: string; status: string }) => item.taskId === 'task-operations' && item.status === 'pending')).toBe(true))
  })
})
