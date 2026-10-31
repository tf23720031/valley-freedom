import { describe, expect, it } from 'vitest'
import { getItineraryConflicts, sortItineraryItems } from './itineraryTimeline'
import type { ItineraryItem } from './types'

const item = (id: string, startTime: string, endTime: string): ItineraryItem => ({ id, kind: 'free', title: id, date: '2026-11-14', startTime, endTime, price: 0 })

describe('itinerary timeline', () => {
  it('sorts by date and 24-hour start time without changing item times', () => {
    const afternoon = item('walk', '14:00', '15:30')
    const morning = item('farm', '09:30', '11:30')
    expect(sortItineraryItems([afternoon, morning]).map(({ id }) => id)).toEqual(['farm', 'walk'])
    expect(afternoon.startTime).toBe('14:00')
  })
  it('reports overlaps while allowing adjacent time slots', () => {
    expect(getItineraryConflicts([item('farm', '09:30', '11:30'), item('walk', '14:00', '15:30')])).toEqual([])
    expect(getItineraryConflicts([item('a', '09:30', '11:30'), item('b', '11:00', '12:00')])).toHaveLength(2)
  })
})
