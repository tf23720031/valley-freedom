import { createId } from './ids'
import type { AppState, DomainResult, Itinerary, ItineraryItem } from './types'

export function getOrCreateItinerary(state: AppState, travelerId: string, date: string): Itinerary {
  return state.itineraries.find((item) => item.travelerId === travelerId && item.date === date) ?? { id: createId('itinerary'), travelerId, title: '我的縱谷日常', date, budget: 3000, interests: [], items: [], updatedAt: new Date().toISOString() }
}
export function addExperienceToItinerary(state: AppState, input: { travelerId: string; experienceId: string; sessionId: string; date: string }): DomainResult<AppState> {
  const experience = state.experiences.find((item) => item.id === input.experienceId && item.published)
  const session = state.sessions.find((item) => item.id === input.sessionId && !item.pilot)
  if (!experience || !session || session.experienceId !== experience.id) return { ok: false, error: { code: 'INVALID_ITEM', message: '這項體驗目前無法加入行程。' } }
  const itinerary = getOrCreateItinerary(state, input.travelerId, input.date)
  if (itinerary.items.some((item) => item.sessionId === session.id)) return { ok: false, error: { code: 'DUPLICATE_ITEM', message: '這個場次已在行程中。' } }
  const item: ItineraryItem = { id: createId('itinerary-item'), kind: 'experience', experienceId: experience.id, sessionId: session.id, title: experience.title, date: session.date, startTime: session.startTime, endTime: session.endTime, price: experience.price }
  return { ok: true, value: { ...state, itineraries: [...state.itineraries.filter((existing) => existing.id !== itinerary.id), { ...itinerary, items: [...itinerary.items, item], updatedAt: new Date().toISOString() }] } }
}
export function addFreeActivity(state: AppState, input: { travelerId: string; title: string; date: string; startTime: string; endTime: string; price?: number }): DomainResult<AppState> {
  if (!input.title.trim() || input.startTime >= input.endTime) return { ok: false, error: { code: 'INVALID_ACTIVITY', message: '請填寫活動名稱，並確認結束時間晚於開始時間。' } }
  const itinerary = getOrCreateItinerary(state, input.travelerId, input.date)
  const item: ItineraryItem = { id: createId('itinerary-item'), kind: 'free', title: input.title.trim(), date: input.date, startTime: input.startTime, endTime: input.endTime, price: Math.max(0, input.price ?? 0) }
  return { ok: true, value: { ...state, itineraries: [...state.itineraries.filter((existing) => existing.id !== itinerary.id), { ...itinerary, items: [...itinerary.items, item], updatedAt: new Date().toISOString() }] } }
}
export function getItinerarySummary(itinerary: Itinerary) {
  const total = itinerary.items.reduce((sum, item) => sum + item.price, 0)
  const sorted = [...itinerary.items].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
  const conflicts = new Set<string>()
  sorted.forEach((item, index) => {
    for (const other of sorted.slice(index + 1)) {
      if (other.date !== item.date) continue
      if (item.startTime < other.endTime && other.startTime < item.endTime) { conflicts.add(item.id); conflicts.add(other.id) }
    }
  })
  return { total, remaining: itinerary.budget - total, conflicts }
}
