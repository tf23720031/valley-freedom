import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppStateProvider } from '../../store/AppStateProvider'
import { FeedbackProvider } from '../../components/Feedback'
import { resetStoreForTests } from '../../store/appStore'
import { ExperienceDetailPage, BookingsPage } from './TravelerPages'

function renderAt(path: string, page: React.ReactNode) {
  return render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={[path]}><Routes><Route path="/experiences/:experienceId" element={page}/><Route path="/bookings" element={page}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
}
beforeEach(() => { localStorage.clear(); resetStoreForTests() })

describe('traveler booking flow', () => {
  it('creates a pending booking from the experience detail and uses available seats', async () => {
    const user = userEvent.setup()
    renderAt('/experiences/experience-1', <ExperienceDetailPage />)
    await user.click(screen.getByRole('button', { name: /送出模擬預約/ }))
    await user.click(screen.getByRole('button', { name: '確認送出' }))
    await waitFor(() => expect(JSON.parse(localStorage.getItem('valley-freedom-state-v1')!).bookings).toHaveLength(5))
    const state = JSON.parse(localStorage.getItem('valley-freedom-state-v1')!)
    expect(state.bookings.at(-1)).toMatchObject({ status: 'pending', partySize: 1, sessionId: 'session-pomelo-1' })
  })

  it('cancels one booking with a reason and releases the party size', async () => {
    const user = userEvent.setup()
    renderAt('/bookings', <BookingsPage />)
    await user.click(screen.getAllByRole('button', { name: '取消預約' })[0])
    fireEvent.change(screen.getByLabelText('取消原因'), { target: { value: '需要改期' } })
    await user.click(screen.getByRole('button', { name: '確認取消' }))
    await waitFor(() => expect(JSON.parse(localStorage.getItem('valley-freedom-state-v1')!).bookings.find((item: { id: string }) => item.id === 'booking-pending').status).toBe('cancelled'))
    const state = JSON.parse(localStorage.getItem('valley-freedom-state-v1')!)
    expect(state.bookings.find((item: { id: string }) => item.id === 'booking-pending')).toMatchObject({ cancelSource: 'traveler', cancelReason: '需要改期' })
  })
})
