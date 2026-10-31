import { describe, expect, it } from 'vitest'
import { findItineraryGaps } from './itineraryGaps'
import type { ItineraryItem } from './types'

const item = (id: string, startTime: string, endTime: string, place = '瑞穗'): ItineraryItem => ({ id, kind: 'free', title: id, date: '2026-11-14', startTime, endTime, price: 0, place })

describe('findItineraryGaps', () => {
  it('returns only usable empty intervals, sorted by start time, with duration and nearby place', () => {
    expect(findItineraryGaps([item('late', '15:00', '16:00', '玉里'), item('early', '10:00', '11:00')], 30)).toEqual([
      { date: '2026-11-14', startTime: '11:00', endTime: '15:00', durationMinutes: 240, place: '瑞穗' },
    ])
  })
  it('keeps dates separate, ignores overlaps, touching events, invalid times, and short gaps', () => {
    const nextDay = { ...item('next-day', '10:00', '11:00'), date: '2026-11-15' }
    const invalid = { ...item('invalid', '24:00', '25:00'), date: '2026-11-14' }
    const zeroLength = { ...item('zero', '13:00', '13:00'), date: '2026-11-14' }
    expect(findItineraryGaps([item('a', '10:00', '12:00'), item('b', '11:30', '13:00'), item('c', '13:00', '13:20'), nextDay, invalid, zeroLength], 30)).toEqual([])
  })
  it('uses the next place if the preceding stop has no location and invents no final gap', () => {
    expect(findItineraryGaps([item('a', '10:00', '11:00', ''), item('b', '12:00', '12:30', '玉里')])).toEqual([
      { date: '2026-11-14', startTime: '11:00', endTime: '12:00', durationMinutes: 60, place: '玉里' },
    ])
  })
})
