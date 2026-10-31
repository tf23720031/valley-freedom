import { describe, expect, it } from 'vitest'
import { ageAt, validateCompanionBirthDate } from './companionProfile'

describe('companion birth date', () => {
  it('calculates age before and after the birthday', () => {
    expect(ageAt('2000-11-02', new Date('2026-11-01T12:00:00'))).toBe(25)
    expect(ageAt('2000-11-02', new Date('2026-11-02T12:00:00'))).toBe(26)
  })
  it('requires a valid non-future date and age 20 or older', () => {
    expect(validateCompanionBirthDate('2007-01-01', new Date('2026-11-01')).ok).toBe(false)
    expect(validateCompanionBirthDate('2027-01-01', new Date('2026-11-01')).ok).toBe(false)
    expect(validateCompanionBirthDate('1990-01-01', new Date('2026-11-01')).ok).toBe(true)
  })
})
