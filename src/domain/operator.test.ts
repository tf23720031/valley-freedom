import { describe, expect, it } from 'vitest'
import { createInitialState } from './fixtures'
import { createExperience, createSession, updateExperience, updateSession } from './operator'

describe('operator catalog management', () => {
  it('publishes a created experience in the shared formal catalog', () => {
    const result = createExperience(createInitialState(), { title: '水圳邊的慢下午', category: '自然觀察', description: '沿著水路認識農村日常。', price: 250, durationMinutes: 60, location: '瑞穗', now: '2026-10-16T10:00:00.000Z' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.experiences.at(-1)).toMatchObject({ title: '水圳邊的慢下午', published: true, isDemo: true })
  })

  it('rejects a session whose capacity or time range is invalid', () => {
    const state = createInitialState()
    const result = createSession(state, { experienceId: 'experience-1', date: '2026-11-14', startTime: '12:00', endTime: '10:00', capacity: 0 })
    expect(result.ok).toBe(false)
  })

  it('edits an experience and prevents reducing a session below occupied seats', () => {
    const state = createInitialState()
    const edited = updateExperience(state, { experienceId: 'experience-1', title: '果園季節筆記', description: '更新後的活動介紹。', price: 700, durationMinutes: 100, location: '木日光' })
    expect(edited.ok).toBe(true)
    const capacity = updateSession(state, { sessionId: 'session-pomelo-1', capacity: 2 })
    expect(capacity.ok).toBe(false)
    if (!capacity.ok) expect(capacity.error.code).toBe('CAPACITY_BELOW_BOOKED')
  })
})
