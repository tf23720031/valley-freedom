import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppStateProvider } from '../../store/AppStateProvider'
import { FeedbackProvider } from '../../components/Feedback'
import { resetStoreForTests } from '../../store/appStore'
import { ItineraryPage } from './ItineraryPage'

beforeEach(() => { localStorage.clear(); resetStoreForTests() })
describe('itinerary draft UI', () => {
  it('adds an experience to a saved draft without submitting a reservation', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/itinerary']}><Routes><Route path="/itinerary" element={<ItineraryPage/>}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
    await user.click(screen.getAllByRole('button', { name: /加入$/ })[0])
    await waitFor(() => expect(JSON.parse(localStorage.getItem('valley-freedom-state-v1')!).itineraries[0].items).toHaveLength(1))
    const state = JSON.parse(localStorage.getItem('valley-freedom-state-v1')!)
    expect(state.bookings).toHaveLength(4)
    expect(state.itineraries[0].items[0].kind).toBe('experience')
  })
})
