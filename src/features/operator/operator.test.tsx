import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppStateProvider } from '../../store/AppStateProvider'
import { FeedbackProvider } from '../../components/Feedback'
import { resetStoreForTests } from '../../store/appStore'
import { OperatorPage } from './OperatorPage'

beforeEach(() => { localStorage.clear(); resetStoreForTests() })
describe('operator shared booking workflow', () => {
  it('confirms a pending booking and persists a status travelers can read', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/operator/bookings']}><Routes><Route path="/operator/bookings" element={<OperatorPage/>}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
    await user.click(screen.getAllByRole('button', { name: /確認預約/ })[0])
    await waitFor(() => expect(JSON.parse(localStorage.getItem('valley-freedom-state-v1')!).bookings.find((item: { id: string }) => item.id === 'booking-pending').status).toBe('confirmed'))
  })

  it('lets an operator edit the image used by an experience', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/operator/experiences']}><Routes><Route path="/operator/experiences" element={<OperatorPage/>}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
    await user.click(screen.getAllByRole('button', { name: '編輯' })[0])
    const imageField = screen.getByRole('textbox', { name: '體驗照片網址' })
    await user.clear(imageField)
    await user.type(imageField, 'https://images.example.test/field.jpg')
    await user.click(screen.getByRole('button', { name: '儲存體驗修改' }))
    await waitFor(() => expect(JSON.parse(localStorage.getItem('valley-freedom-state-v1')!).experiences[0].image).toBe('https://images.example.test/field.jpg'))
  })
})
