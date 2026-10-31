import type { ItineraryItem } from './types'

export function sortItineraryItems(items: ItineraryItem[]): ItineraryItem[] {
  return [...items].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime) || a.id.localeCompare(b.id))
}

export function getItineraryConflicts(items: ItineraryItem[]): string[] {
  const sorted = sortItineraryItems(items)
  const conflicts = new Set<string>()
  for (let i = 0; i < sorted.length; i += 1) {
    const a = sorted[i]
    for (let j = i + 1; j < sorted.length && sorted[j].date === a.date; j += 1) {
      const b = sorted[j]
      if (a.startTime < b.endTime && b.startTime < a.endTime) {
        conflicts.add(a.id)
        conflicts.add(b.id)
      }
    }
  }
  return [...conflicts]
}
