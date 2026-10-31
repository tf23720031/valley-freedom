import { describe, expect, it } from 'vitest'
import { createInitialState } from './fixtures'
import { cancelServiceRequest, companionRespond, createServiceRequest, estimateCompanionFee, matchingCompanions, travelerFinalizeRequest, updateCompanionProfile } from './companions'

const criteria = { destination: '瑞穗', date: '2026-11-15', startTime: '14:00', durationMinutes: 90, partySize: 2, language: '英文', service: 'language-support' as const }
describe('local companion matching and request workflow', () => {
  it('validates and persists a companion hourly rate and short bio', () => {
    const result = updateCompanionProfile(createInitialState(), { companionId: 'companion-lin', avatar: 'https://images.example.test/lin.jpg', bio: '熟悉瑞穗田間小路。', ratePerHour: 1250 })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.companions[0]).toMatchObject({ avatar: 'https://images.example.test/lin.jpg', bio: '熟悉瑞穗田間小路。', ratePerHour: 1250 })
    expect(updateCompanionProfile(createInitialState(), { companionId: 'companion-lin', avatar: 'photo', bio: '旅'.repeat(101), ratePerHour: 900 }).ok).toBe(false)
  })
  it('matches by location, language, service, and available duration', () => {
    expect(matchingCompanions(createInitialState(), criteria).map((person) => person.id)).toEqual(['companion-lin', 'companion-chen', 'companion-huang', 'companion-zhao', 'companion-lin-yi', 'companion-yang'])
  })
  it('matches the selected county or the full Hualien–Taitung region', () => {
    const state = createInitialState()
    expect(matchingCompanions(state, { ...criteria, destination: '臺東縣' }).map((person) => person.id)).toEqual(['companion-lin-taitung', 'companion-hsu-south'])
    expect(matchingCompanions(state, { ...criteria, destination: '花東全區' })).toHaveLength(8)
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
    expect(confirmed.value.itineraries[0].items[0]).toMatchObject({ kind: 'companion', date: criteria.date, startTime: '14:00', endTime: '15:30' })
  })
  it('rounds requested durations up to the next 30-minute price unit', () => {
    expect([15, 20, 23, 24, 30].map((minutes) => estimateCompanionFee(minutes, 900))).toEqual([450, 450, 450, 450, 450])
    expect([31, 45, 50, 55, 60].map((minutes) => estimateCompanionFee(minutes, 900))).toEqual([900, 900, 900, 900, 900])
    expect(estimateCompanionFee(61, 900)).toBe(1350)
  })
  it('accepts a 15-minute request and bills the 30-minute minimum', () => {
    const seeded = createInitialState()
    const created = createServiceRequest(seeded, { ...criteria, durationMinutes: 15, travelerId: seeded.travelerId, companionId: 'companion-lin', meetingPoint: '瑞穗車站', notes: '' })
    expect(created.ok && created.value.serviceRequests[0].price).toBe(450)
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
    const countered = companionRespond(created.value, { requestId: created.valueId!, companionId: 'companion-lin', action: 'counter', startTime: '15:00', durationMinutes: 90, price: 1500, note: '改為三點集合' })
    expect(countered.ok).toBe(true)
    if (!countered.ok) return
    const confirmed = travelerFinalizeRequest(countered.value, { requestId: created.valueId!, travelerId: seeded.travelerId, action: 'confirm' })
    expect(confirmed.ok && confirmed.value.serviceRequests[0]).toMatchObject({ status: 'confirmed', startTime: '15:00', price: 1500 })
  })
})
