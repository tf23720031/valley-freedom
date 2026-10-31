import type { ItineraryItem } from './types'

export interface ItineraryGap { date: string; startTime: string; endTime: string; durationMinutes: number; place: string }

const toMinutes = (value: string) => {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null
  const hours = Number(match[1]), minutes = Number(match[2])
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null
}
const asTime = (value: number) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`

/** Finds real gaps between valid itinerary items; it does not invent an end-of-day window. */
export function findItineraryGaps(items: ItineraryItem[], minimumMinutes = 30): ItineraryGap[] {
  const grouped = new Map<string, Array<{ item: ItineraryItem; start: number; end: number }>>()
  items.map(item => ({ item, start: toMinutes(item.startTime), end: toMinutes(item.endTime) }))
    .filter((entry): entry is { item: ItineraryItem; start: number; end: number } => entry.start !== null && entry.end !== null && entry.end > entry.start)
    .forEach(entry => grouped.set(entry.item.date, [...(grouped.get(entry.item.date) ?? []), entry]))
  const gaps: ItineraryGap[] = []
  for (const [date, ordered] of grouped) {
    ordered.sort((a, b) => a.start - b.start || a.end - b.end)
    let currentEnd = -1
    let previous: ItineraryItem | undefined
    for (const entry of ordered) {
      if (previous && entry.start > currentEnd && entry.start - currentEnd >= minimumMinutes) {
        gaps.push({ date, startTime: asTime(currentEnd), endTime: asTime(entry.start), durationMinutes: entry.start - currentEnd, place: previous.place || entry.item.place || '' })
      }
      if (entry.end > currentEnd) { currentEnd = entry.end; previous = entry.item }
    }
  }
  return gaps.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
}
