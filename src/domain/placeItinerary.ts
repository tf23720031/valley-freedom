import { createId } from './ids'
import { getPlaceById } from './districts'
import type { AppState, DomainResult, Itinerary } from './types'

export function addPlaceToItinerary(state: AppState, placeId: string, date: string): DomainResult<AppState> {
  const place = getPlaceById(placeId)
  if (!place || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: { code: 'INVALID_PLACE', message: '找不到這個場域，或日期格式不正確。' } }
  let itinerary = state.itineraries.find((plan) => plan.travelerId === state.travelerId && date >= plan.date && date <= (plan.endDate ?? plan.date))
  if (!itinerary) {
    const plan: Itinerary = { id: createId('itinerary'), travelerId: state.travelerId, title: '我的花東自由行', date, endDate: date, dayCount: 1, budget: 0, interests: [], items: [], updatedAt: new Date().toISOString() }
    itinerary = plan
  }
  if (itinerary.items.some((item) => item.category === '候選場域' && item.placeId === place.id && item.date === date)) return { ok: false, error: { code: 'ALREADY_ADDED', message: '這個地點已加入當日行程。' } }
  const item = { id: createId('item'), kind: 'free' as const, category: '候選場域', placeId: place.id, place: place.name, note: '行程草稿・尚未向場域預約', title: place.name, date, startTime: '11:00', endTime: '12:00', price: 0 }
  const next = { ...itinerary, items: [...itinerary.items, item].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)), updatedAt: new Date().toISOString() }
  return { ok: true, value: { ...state, itineraries: [...state.itineraries.filter((plan) => plan.id !== itinerary!.id), next] } }
}
