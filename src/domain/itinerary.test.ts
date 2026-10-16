import { describe, expect, it } from 'vitest'
import { createInitialState } from './fixtures'
import { addExperienceToItinerary, addFreeActivity, getItinerarySummary } from './itinerary'

describe('itinerary editing', () => {
  it('adds experiences to a saved draft without creating a booking', () => {
    const state = createInitialState()
    const result = addExperienceToItinerary(state, { travelerId: state.travelerId, experienceId: 'experience-1', sessionId: 'session-pomelo-1', date: '2026-11-14' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.bookings).toHaveLength(state.bookings.length)
      expect(result.value.itineraries[0].items[0].kind).toBe('experience')
    }
  })

  it('accepts free activities without a provider session and calculates overlap and budget', () => {
    const state = createInitialState()
    const first = addFreeActivity(state, { travelerId: state.travelerId, title: '溪邊散步', date: '2026-11-14', startTime: '10:30', endTime: '12:00', price: 0 })
    expect(first.ok).toBe(true)
    if (first.ok) {
      const summary = getItinerarySummary({ ...first.value.itineraries[0], budget: 100 })
      expect(summary.remaining).toBe(100)
      expect(summary.conflicts.size).toBe(0)
    }
  })

  it('marks every entry involved in overlapping intervals, including a long enclosing activity', async () => {
    const { getItinerarySummary } = await import('./itinerary')
    const summary = getItinerarySummary({ id: 'itinerary-test', travelerId: 'traveler-demo', title: '測試', date: '2026-11-14', budget: 1000, interests: [], updatedAt: '', items: [
      { id: 'long', kind: 'free', title: '長行程', date: '2026-11-14', startTime: '09:00', endTime: '15:00', price: 0 },
      { id: 'short-one', kind: 'free', title: '短活動一', date: '2026-11-14', startTime: '10:00', endTime: '11:00', price: 0 },
      { id: 'short-two', kind: 'free', title: '短活動二', date: '2026-11-14', startTime: '12:00', endTime: '13:00', price: 0 },
    ] })
    expect([...summary.conflicts].sort()).toEqual(['long', 'short-one', 'short-two'])
  })
})
