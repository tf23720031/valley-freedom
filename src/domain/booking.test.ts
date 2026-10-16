import { describe, expect, it } from 'vitest'
import { createInitialState } from './fixtures'
import { cancelBooking, createBooking, remainingSeats } from './booking'

describe('booking domain rules', () => {
  it('counts pending and confirmed orders but excludes cancelled orders', () => {
    const state = createInitialState()
    const session = state.sessions.find((item) => item.id === 'session-pomelo-1')!
    expect(remainingSeats(state, session.id)).toBe(session.capacity - 3)
  })

  it('rejects an order larger than the available capacity', () => {
    const state = createInitialState()
    const result = createBooking(state, { sessionId: 'session-pomelo-1', travelerId: 'traveler-demo', partySize: 99, now: '2026-10-16T10:00:00.000Z' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('NO_CAPACITY')
  })

  it('cancels through one operation, records source and reason, and releases seats', () => {
    const state = createInitialState()
    const before = remainingSeats(state, 'session-pomelo-1')
    const result = cancelBooking(state, { bookingId: 'booking-pending', source: 'operator', reason: '場域臨時維護', now: '2026-10-16T10:00:00.000Z' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(remainingSeats(result.value, 'session-pomelo-1')).toBe(before + 2)
      expect(result.value.bookings.find((item) => item.id === 'booking-pending')).toMatchObject({ status: 'cancelled', cancelSource: 'operator', cancelReason: '場域臨時維護' })
    }
  })

  it('rejects repeat cancellation and cancellation of completed bookings', () => {
    const state = createInitialState()
    const repeat = cancelBooking(state, { bookingId: 'booking-cancelled', source: 'traveler', reason: '改期', now: '2026-10-16T10:00:00.000Z' })
    const completed = cancelBooking(state, { bookingId: 'booking-completed', source: 'traveler', reason: '改期', now: '2026-10-16T10:00:00.000Z' })
    expect(repeat.ok).toBe(false)
    expect(completed.ok).toBe(false)
  })
})
