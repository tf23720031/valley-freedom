import { describe, expect, it } from 'vitest'
import { createInitialState } from './fixtures'
import { confirmItineraryItems } from './v2Workflow'
import { applyToDemand, acceptDemandApplication, publishDemand, recommendCompanions } from './companionDemand'

describe('V2 traveler and companion workflows', () => {
  it('submits available itinerary experiences item by item and is idempotent', () => {
    const state = createInitialState()
    const plan = { id: 'plan-v2', travelerId: state.travelerId, title: '三天行程', date: '2026-11-14', endDate: '2026-11-16', dayCount: 3, budget: 8000, interests: [], updatedAt: '2026-10-31T00:00:00Z', items: [
      { id: 'i1', kind: 'experience' as const, experienceId: 'experience-2', sessionId: 'session-2', title: '體驗一', date: '2026-11-14', startTime: '09:30', endTime: '11:30', price: 680, partySize: 2 },
      { id: 'i2', kind: 'experience' as const, experienceId: 'experience-3', sessionId: 'session-3', title: '額滿體驗', date: '2026-11-14', startTime: '14:00', endTime: '16:00', price: 880, partySize: 99 },
      { id: 'i3', kind: 'free' as const, title: '散步', date: '2026-11-14', startTime: '17:00', endTime: '18:00', price: 0 },
    ] }
    const submitted = confirmItineraryItems({ ...state, itineraries: [plan] }, plan.id, '2026-10-31T00:00:00Z')
    expect(submitted.report).toMatchObject({ sent: ['i1'], failed: [{ itemId: 'i2', reason: expect.stringContaining('名額') }] })
    expect(submitted.state.bookings.filter((booking) => booking.travelerId === state.travelerId && booking.createdAt === '2026-10-31T00:00:00Z')).toHaveLength(1)
    const repeated = confirmItineraryItems(submitted.state, plan.id, '2026-10-31T00:00:00Z')
    expect(repeated.report.sent).toHaveLength(0)
    expect(repeated.state.bookings).toHaveLength(submitted.state.bookings.length)
  })

  it('ranks full matches first and keeps applicant quote separate from budget cap', () => {
    const state = createInitialState()
    const published = publishDemand(state, { travelerId: state.travelerId, date: '2026-11-15', startTime: '14:00', durationMinutes: 90, meetingPoint: '瑞穗車站', destination: '瑞穗', language: '英文', skills: ['language-support'], maxBudget: 1500, travelerCount: 2, notes: '' }, '2026-10-31T00:00:00Z')
    expect(published.ok).toBe(true)
    if (!published.ok) return
    const demand = published.value.companionDemands[0]
    expect(recommendCompanions(published.value, demand.id)[0]?.fullyMatched).toBe(true)
    const applied = applyToDemand(published.value, { demandId: demand.id, companionId: 'companion-lin', quote: 1350, proposal: '可提供英文溝通' }, '2026-10-31T00:00:00Z')
    expect(applied.ok).toBe(true)
    if (!applied.ok) return
    expect(applied.value.demandApplications[0].quote).toBe(1350)
    expect(applied.value.companionDemands[0].maxBudget).toBe(1500)
  })

  it('accepts only one applicant, uses that applicant quote, and closes the rest', () => {
    let state = createInitialState()
    const demandResult = publishDemand(state, { travelerId: state.travelerId, date: '2026-11-15', startTime: '14:00', durationMinutes: 90, meetingPoint: '瑞穗車站', destination: '瑞穗', language: '英文', skills: ['language-support'], maxBudget: 1500, travelerCount: 2, notes: '' }, '2026-10-31T00:00:00Z')
    if (!demandResult.ok) throw new Error('demand creation failed')
    state = demandResult.value
    for (const [companionId, quote] of [['companion-lin', 1350], ['companion-chen', 1450]] as const) {
      const applied = applyToDemand(state, { demandId: state.companionDemands[0].id, companionId, quote, proposal: '測試提案' }, '2026-10-31T00:00:00Z')
      if (!applied.ok) throw new Error(applied.error.message)
      state = applied.value
    }
    const accepted = acceptDemandApplication(state, { applicationId: state.demandApplications[0].id, travelerId: state.travelerId }, '2026-10-31T00:00:00Z')
    expect(accepted.ok).toBe(true)
    if (!accepted.ok) return
    expect(accepted.value.companionDemands[0].status).toBe('matched')
    expect(accepted.value.demandApplications.map((application) => application.status)).toEqual(['accepted', 'closed'])
    expect(accepted.value.serviceRequests[0].price).toBe(1350)
    expect(acceptDemandApplication(accepted.value, { applicationId: accepted.value.demandApplications[1].id, travelerId: state.travelerId }, '2026-10-31T00:00:00Z').ok).toBe(false)
  })
})
