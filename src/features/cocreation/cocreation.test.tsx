import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppStateProvider } from '../../store/AppStateProvider'
import { FeedbackProvider } from '../../components/Feedback'
import { resetStoreForTests } from '../../store/appStore'
import { CocreationPage } from './CocreationPage'

beforeEach(() => { localStorage.clear(); resetStoreForTests() })
describe('co-creation release flow', () => {
  it('publishes an evaluated draft and exposes the linked formal experience', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/co-create']}><Routes><Route path="/co-create" element={<CocreationPage/>}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
    await user.click(screen.getByRole('button', { name: '正式上架為地方體驗' }))
    await user.click(screen.getByRole('button', { name: '確認正式上架' }))
    await waitFor(() => expect(JSON.parse(localStorage.getItem('valley-freedom-state-v1')!).drafts[0].stage).toBe('published'))
    const state = JSON.parse(localStorage.getItem('valley-freedom-state-v1')!)
    const experience = state.experiences.find((item: { sourceDraftId: string }) => item.sourceDraftId === 'draft-pomelo')
    expect(experience).toBeTruthy()
    expect(experience.id).not.toBe('draft-pomelo')
  })
})
