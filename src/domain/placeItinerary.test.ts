import { describe, expect, it } from 'vitest'
import { createInitialState } from './fixtures'
import { addPlaceToItinerary } from './placeItinerary'

describe('candidate destination itinerary entries', () => {
  it('adds a place as an unbooked zero-price draft without creating a business reservation', () => {
    const state = createInitialState()
    const result = addPlaceToItinerary(state, 'lookout-cafe', '2026-11-16')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.bookings).toEqual(state.bookings)
    expect(result.value.serviceRequests).toHaveLength(0)
    expect(result.value.itineraries[0].items[0]).toMatchObject({ category: '候選場域', title: '眺港咖啡', date: '2026-11-16', price: 0 })
    expect(addPlaceToItinerary(result.value, 'lookout-cafe', '2026-11-16')).toMatchObject({ ok: false, error: { code: 'ALREADY_ADDED' } })
  })
})
