import { describe, expect, it } from 'vitest'
import { createInitialState, getDemoServiceDate } from './fixtures'
import { cancelServiceRequest, companionRespond, createServiceRequest, matchingCompanions, travelerFinalizeRequest, updateCompanionProfile } from './companions'

const criteria = { destination: '瑞穗', date: getDemoServiceDate(), startTime: '14:00', durationMinutes: 240, partySize: 2, language: '英文', service: 'language-support' as const }
describe('local companion matching and request workflow', () => {
  it('validates and persists a companion profile photo and short bio', () => {
    const result = updateCompanionProfile(createInitialState(), { companionId: 'companion-lin', avatar: 'https://images.example.test/lin.jpg', bio: '熟悉瑞穗田間小路。' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.companions[0]).toMatchObject({ avatar: 'https://images.example.test/lin.jpg', bio: '熟悉瑞穗田間小路。' })
    expect(updateCompanionProfile(createInitialState(), { companionId: 'companion-lin', avatar: 'photo', bio: '旅'.repeat(101) }).ok).toBe(false)
  })
  it('matches by location, language, service, and available duration', () => {
    expect(matchingCompanions(createInitialState(), criteria).map((person) => person.id)).toEqual(['companion-lin', 'companion-chen', 'companion-huang', 'companion-zhao', 'companion-yang'])
  })
  it('matches the selected county or the full Hualien–Taitung region', () => {
    const state = createInitialState()
    expect(matchingCompanions(state, { ...criteria, destination: '臺東縣' }).map((person) => person.id)).toEqual(['companion-lin-taitung', 'companion-hsu-south'])
    expect(matchingCompanions(state, { ...criteria, destination: '花東全區' })).toHaveLength(7)
  })
  it('creates a request and adds it to a multi-day itinerary only after traveler confirmation', () => {
    const seeded = createInitialState()
    const created = createServiceRequest(seeded, { ...criteria, travelerId: seeded.travelerId, companionId: 'companion-lin', meetingPoint: '瑞穗車站', notes: '' }, '2026-10-16T00:00:00.000Z')
    expect(created.ok).toBe(true)
    if (!created.ok) return
    const requestId = created.valueId!
    expect(created.value.itineraries).toHaveLength(0)
    const accepted = companionRespond(created.value, { requestId, companionId: 'companion-lin', action: 'accept' })
    expect(accepted.ok).toBe(true)
    if (!accepted.ok) return
    const confirmed = travelerFinalizeRequest(accepted.value, { requestId, travelerId: seeded.travelerId, action: 'confirm' })
    expect(confirmed.ok).toBe(true)
    if (!confirmed.ok) return
    expect(confirmed.value.serviceRequests[0].status).toBe('confirmed')
    expect(confirmed.value.itineraries[0].items[0]).toMatchObject({ kind: 'companion', date: criteria.date, startTime: '14:00', endTime: '18:00' })
  })
  it('charges the half-day and full-day package per traveler', () => {
    const state = createInitialState()
    for (const [durationMinutes, startTime, price] of [[240, '14:00', 2000], [480, '09:00', 3600]] as const) {
      const result = createServiceRequest(state, { ...criteria, durationMinutes, startTime, travelerId: state.travelerId, companionId: 'companion-lin', meetingPoint: '瑞穗車站', notes: '' })
      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value.serviceRequests[0]).toMatchObject({ price, durationMinutes, revenueSnapshot: { gross: price, partySize: 2 } })
    }
  })
  it('rejects arbitrary minute-based requests', () => {
    const state = createInitialState()
    for (const durationMinutes of [15, 30, 90, 241]) {
      expect(createServiceRequest(state, { ...criteria, durationMinutes, travelerId: state.travelerId, companionId: 'companion-lin', meetingPoint: '瑞穗車站', notes: '' }).ok).toBe(false)
    }
  })
  it('blocks overlapping duplicate requests and records cancellation source and reason', () => {
    const seeded = createInitialState()
    const first = createServiceRequest(seeded, { ...criteria, travelerId: seeded.travelerId, companionId: 'companion-lin', meetingPoint: '瑞穗車站', notes: '' })
    expect(first.ok).toBe(true)
    if (!first.ok) return
    expect(matchingCompanions(first.value, criteria).map((person) => person.id)).not.toContain('companion-lin')
    const cancelled = cancelServiceRequest(first.value, { requestId: first.valueId!, actor: 'traveler', actorId: seeded.travelerId, reason: '改變行程' })
    expect(cancelled.ok && cancelled.value.serviceRequests[0]).toMatchObject({ status: 'cancelled', cancelReason: '改變行程', cancelSource: 'traveler' })
    if (!cancelled.ok) return
    const duplicateCancel = cancelServiceRequest(cancelled.value, { requestId: first.valueId!, actor: 'traveler', actorId: seeded.travelerId, reason: '重複取消' })
    expect(duplicateCancel.ok).toBe(false)
  })
  it('lets a companion propose a new time and makes the traveler confirm the offered terms', () => {
    const seeded = createInitialState()
    const created = createServiceRequest(seeded, { ...criteria, travelerId: seeded.travelerId, companionId: 'companion-lin', meetingPoint: '瑞穗車站', notes: '' })
    if (!created.ok) throw new Error('request create failed')
    const countered = companionRespond(created.value, { requestId: created.valueId!, companionId: 'companion-lin', action: 'counter', startTime: '13:00', durationMinutes: 240, note: '改為一點集合' })
    expect(countered.ok).toBe(true)
    if (!countered.ok) return
    const confirmed = travelerFinalizeRequest(countered.value, { requestId: created.valueId!, travelerId: seeded.travelerId, action: 'confirm' })
    expect(confirmed.ok && confirmed.value.serviceRequests[0]).toMatchObject({ status: 'confirmed', startTime: '13:00', price: 2000 })
  })
})
