import { describe, expect, it } from 'vitest'
import { createInitialState } from './fixtures'
import { cancelBooking, createBooking, remainingSeats } from './booking'
import { companionRespond, createServiceRequest, travelerFinalizeRequest } from './companions'
import { createSession } from './operator'

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

  it('counts a companion only after that companion service is confirmed', () => {
    const state = createInitialState()
    const query = { destination: '瑞穗', date: '2026-11-15', startTime: '14:00', durationMinutes: 90, partySize: 2, language: '英文', service: 'language-support' as const }
    const request = createServiceRequest(state, { ...query, travelerId: state.travelerId, companionId: 'companion-lin', meetingPoint: '瑞穗車站', notes: '' }, '2026-10-31T00:00:00Z')
    if (!request.ok) throw new Error('request create failed')
    const blocked = createBooking(request.value, { sessionId: 'session-pomelo-1', travelerId: state.travelerId, partySize: 3, travelerCount: 2, includesCompanion: true, serviceRequestId: request.valueId, now: '2026-10-31T00:00:00Z' })
    expect(blocked.ok).toBe(false)
    if (!blocked.ok) expect(blocked.error.code).toBe('COMPANION_NOT_CONFIRMED')
    const accepted = companionRespond(request.value, { requestId: request.valueId!, companionId: 'companion-lin', action: 'accept' })
    if (!accepted.ok) throw new Error('accept failed')
    const confirmed = travelerFinalizeRequest(accepted.value, { requestId: request.valueId!, travelerId: state.travelerId, action: 'confirm', now: '2026-10-31T00:00:00Z' })
    if (!confirmed.ok) throw new Error('confirm failed')
    const withSession = createSession(confirmed.value, { experienceId: 'experience-1', date: '2026-11-15', startTime: '14:00', endTime: '16:00', capacity: 10 })
    if (!withSession.ok) throw new Error('session create failed')
    const booking = createBooking(withSession.value, { sessionId: withSession.valueId!, travelerId: state.travelerId, partySize: 3, travelerCount: 2, includesCompanion: true, serviceRequestId: request.valueId, now: '2026-10-31T00:00:00Z' })
    expect(booking.ok).toBe(true)
    if (booking.ok) expect(booking.value.bookings.at(-1)).toMatchObject({ partySize: 3, travelerCount: 2, includesCompanion: true })
  })
})
