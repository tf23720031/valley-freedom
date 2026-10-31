import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AppStateProvider } from '../../store/AppStateProvider'
import { FeedbackProvider } from '../../components/Feedback'
import { resetStoreForTests } from '../../store/appStore'
import { ItineraryPage } from './ItineraryPage'
function SearchParamsView(){const location=useLocation();return <div data-testid="companion-query">{location.search}</div>}

beforeEach(() => { cleanup(); localStorage.clear(); resetStoreForTests() })
describe('itinerary draft UI', () => {
  it('makes the empty day a direct companion-search entry and adds quiet photo texture', () => {
    render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/itinerary']}><Routes><Route path="/itinerary" element={<ItineraryPage/>}/><Route path="/companions" element={<SearchParamsView/>}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
    expect(screen.getByRole('heading', { name: '這裡有空' })).toBeInTheDocument()
    const companionEntry = screen.getByRole('link', { name: '要找旅伴嗎' })
    expect(companionEntry).toHaveAttribute('href', expect.stringContaining('/companions?'))
    expect(companionEntry).toHaveAttribute('href', expect.stringContaining('date=2026-11-14'))
    expect(companionEntry).toHaveAttribute('href', expect.stringContaining('startTime=14%3A00'))
    expect(companionEntry).toHaveAttribute('href', expect.stringContaining('destination='))
    expect(document.querySelectorAll('.timeline-empty-photos span')).toHaveLength(3)
  })

  it('offers accessible plus actions between timeline stops and opens companion search with the selected day and time', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/itinerary']}><Routes><Route path="/itinerary" element={<ItineraryPage/>}/><Route path="/companions" element={<SearchParamsView/>}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
    await user.click(screen.getAllByRole('button', { name: /新增安排/ })[0])
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
    await user.click(screen.getAllByRole('button', { name: '選人數並加入' })[0])
    await user.click(screen.getByRole('button', { name: '以 1 人加入行程草稿' }))
    await waitFor(() => expect(JSON.parse(localStorage.getItem('valley-freedom-state-v1')!).itineraries[0].items).toHaveLength(1))
    const state = JSON.parse(localStorage.getItem('valley-freedom-state-v1')!)
    expect(state.bookings).toHaveLength(4)
    expect(state.itineraries[0].items[0].kind).toBe('experience')
  })

  it('opens experience details and applies a custom itinerary duration while keeping the selected session', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><FeedbackProvider><MemoryRouter initialEntries={['/itinerary']}><Routes><Route path="/itinerary" element={<ItineraryPage/>}/></Routes></MemoryRouter></FeedbackProvider></AppStateProvider>)
    await user.click(screen.getAllByRole('button', { name: /查看更多/ })[0])
    expect(screen.getByRole('dialog', { name: /文旦田裡的一日農事/ })).toBeInTheDocument()
    expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src', expect.stringContaining('images.unsplash.com'))
    await user.clear(screen.getByRole('spinbutton', { name: '行程停留分鐘數' }))
    await user.type(screen.getByRole('spinbutton', { name: '行程停留分鐘數' }), '45')
    await waitFor(() => expect(screen.getByRole('spinbutton', { name: '行程停留分鐘數' })).toHaveValue(45))
    expect(screen.getByRole('dialog').textContent).toContain('09:30–10:15')
    await user.click(screen.getByRole('button', { name: '以 1 人加入行程草稿' }))
    await waitFor(() => expect(JSON.parse(localStorage.getItem('valley-freedom-state-v1')!).itineraries[0].items).toHaveLength(1))
    const item = JSON.parse(localStorage.getItem('valley-freedom-state-v1')!).itineraries[0].items[0]
    expect(item.kind).toBe('experience')
    expect(item.sessionId).toBe('session-pomelo-1')
    expect(item.endTime).toBe('10:15')
  })
})
