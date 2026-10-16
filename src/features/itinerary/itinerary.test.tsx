import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AppStateProvider } from '../../store/AppStateProvider'
import { FeedbackProvider } from '../../components/Feedback'
import { resetStoreForTests } from '../../store/appStore'
import { ItineraryPage } from './ItineraryPage'
function SearchParamsView(){const location=useLocation();return <div data-testid="companion-query">{location.search}</div>}

beforeEach(() => { localStorage.clear(); resetStoreForTests() })
describe('itinerary draft UI', () => {
  it('offers accessible plus actions between timeline stops and opens companion search with the selected day and time', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/itinerary']}><Routes><Route path="/itinerary" element={<ItineraryPage/>}/><Route path="/companions" element={<SearchParamsView/>}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
    await user.click(screen.getByRole('button', { name: /新增安排/ }))
    await user.click(screen.getByRole('button', { name: '找在地旅伴' }))
    await waitFor(() => expect(screen.getByTestId('companion-query')).toBeInTheDocument())
    expect(screen.getByTestId('companion-query').textContent).toContain('date=2026-11-14')
    expect(screen.getByTestId('companion-query').textContent).toContain('startTime=14%3A00')
    expect(screen.getByTestId('companion-query').textContent).toContain('duration=90')
    expect(screen.getByTestId('companion-query').textContent).toContain('language=英文')
  })

  it('keeps the experience entry point and adds a draft without submitting a reservation', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/itinerary']}><Routes><Route path="/itinerary" element={<ItineraryPage/>}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
    await user.click(screen.getAllByRole('button', { name: '加入行程' })[0])
    await waitFor(() => expect(JSON.parse(localStorage.getItem('valley-freedom-state-v1')!).itineraries[0].items).toHaveLength(1))
    const state = JSON.parse(localStorage.getItem('valley-freedom-state-v1')!)
    expect(state.bookings).toHaveLength(4)
    expect(state.itineraries[0].items[0].kind).toBe('experience')
  })
})
