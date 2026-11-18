import { afterEach, describe, expect, it, vi } from 'vitest'
import { createInitialState, getDemoServiceDate } from './fixtures'

afterEach(() => vi.useRealTimers())

describe('current demo service dates', () => {
  it('uses the next Taiwan calendar day across the UTC date boundary', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-18T16:05:00Z'))
    expect(getDemoServiceDate(0)).toBe('2026-11-19')
    expect(getDemoServiceDate()).toBe('2026-11-20')
  })

  it('rolls into the next year and aligns sessions with companion availability', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-12-31T12:00:00Z'))
    const state = createInitialState()
    expect(state.sessions[0].date).toBe('2027-01-01')
    expect(state.companions[0].availability[0].date).toBe(state.sessions[0].date)
    expect(state.companions[0]).not.toHaveProperty('ratePerHour')
  })
})
