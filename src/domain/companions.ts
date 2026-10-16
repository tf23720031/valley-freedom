import type { AppState, Companion, CompanionService, DomainResult, ServiceRequest, ServiceRequestStatus } from './types'
import { makeId } from './fixtures'

export interface CompanionSearch { destination: string; date: string; startTime: string; durationMinutes: number; partySize: number; language: string; service: CompanionService; itineraryId?: string }
const active = (status: ServiceRequestStatus) => ['pending', 'accepted', 'countered', 'confirmed'].includes(status)
const mins = (time: string) => { const [h, m] = time.split(':').map(Number); return h * 60 + m }
const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) => mins(aStart) < mins(bEnd) && mins(bStart) < mins(aEnd)
export function matchingCompanions(state: AppState, query: CompanionSearch): Companion[] {
  const end = mins(query.startTime) + query.durationMinutes
  if (!query.destination || !query.date || end > 24 * 60) return []
  return state.companions.filter((person) => {
    const areaMatch = person.serviceAreas.some((area) => query.destination.includes(area) || area.includes(query.destination))
    const slotMatch = person.availability.some((slot) => slot.date === query.date && mins(slot.startTime) <= mins(query.startTime) && mins(slot.endTime) >= end)
    const conflict = state.serviceRequests.some((request) => request.companionId === person.id && request.date === query.date && active(request.status) && overlaps(request.startTime, `${Math.floor((mins(request.startTime) + request.durationMinutes) / 60).toString().padStart(2, '0')}:${((mins(request.startTime) + request.durationMinutes) % 60).toString().padStart(2, '0')}`, query.startTime, `${Math.floor(end / 60).toString().padStart(2, '0')}:${(end % 60).toString().padStart(2, '0')}`))
    const itinerary = query.itineraryId ? state.itineraries.find((plan) => plan.id === query.itineraryId) : undefined
    const itineraryConflict = itinerary?.items.some((item) => item.date === query.date && mins(item.startTime) < end && mins(query.startTime) < mins(item.endTime)) ?? false
    return areaMatch && slotMatch && person.services.includes(query.service) && person.languages.includes(query.language) && !conflict && !itineraryConflict
  })
}
export function createServiceRequest(state: AppState, input: CompanionSearch & { travelerId: string; companionId: string; meetingPoint: string; notes: string; itineraryId?: string }, now = new Date().toISOString()): DomainResult<AppState> {
  if (!input.destination.trim() || !input.meetingPoint.trim() || input.durationMinutes < 30 || input.durationMinutes > 480 || input.partySize < 1 || input.partySize > 20) return fail('invalid', '請確認地點、人數與服務時長。')
  const companion = state.companions.find((item) => item.id === input.companionId)
  if (!companion || !matchingCompanions(state, input).some((item) => item.id === companion.id)) return fail('unavailable', '這位旅伴目前不符合條件或時段已被占用，請重新搜尋。')
  const price = Math.ceil(input.durationMinutes / 60 * companion.ratePerHour)
  const request: ServiceRequest = { id: makeId('request'), travelerId: input.travelerId, companionId: companion.id, itineraryId: input.itineraryId, status: 'pending', destination: input.destination, meetingPoint: input.meetingPoint, date: input.date, startTime: input.startTime, durationMinutes: input.durationMinutes, partySize: input.partySize, language: input.language, service: input.service, notes: input.notes, price, createdAt: now, updatedAt: now }
  return { ok: true, value: { ...state, serviceRequests: [...state.serviceRequests, request] }, valueId: request.id }
}
export function companionRespond(state: AppState, input: { requestId: string; companionId: string; action: 'accept' | 'reject' | 'counter'; note?: string; startTime?: string; durationMinutes?: number; price?: number }, now = new Date().toISOString()): DomainResult<AppState> {
  const request = state.serviceRequests.find((item) => item.id === input.requestId && item.companionId === input.companionId)
  if (!request || request.status !== 'pending') return fail('state', '此需求已處理或不屬於目前旅伴。')
  let next: ServiceRequest
  if (input.action === 'reject') next = { ...request, status: 'rejected', decisionNote: input.note || '目前無法承接', updatedAt: now }
  else if (input.action === 'accept') next = { ...request, status: 'accepted', updatedAt: now }
  else {
    const startTime = input.startTime ?? request.startTime, durationMinutes = input.durationMinutes ?? request.durationMinutes
    if (durationMinutes < 30 || durationMinutes > 480 || !isAvailable(state, request, startTime, durationMinutes)) return fail('conflict', '提出的時段不在可服務時間內或與其他需求重疊。')
    next = { ...request, status: 'countered', proposed: { startTime, durationMinutes, price: input.price ?? request.price, note: input.note ?? '' }, updatedAt: now }
  }
  return replace(state, next)
}
export function travelerFinalizeRequest(state: AppState, input: { requestId: string; travelerId: string; action: 'confirm' | 'decline'; now?: string }): DomainResult<AppState> {
  const request = state.serviceRequests.find((item) => item.id === input.requestId && item.travelerId === input.travelerId)
  if (!request || !['accepted', 'countered'].includes(request.status)) return fail('state', '目前沒有等待確認的服務方案。')
  if (input.action === 'decline') return replace(state, { ...request, status: 'rejected', decisionNote: '旅客未接受服務方案', updatedAt: input.now ?? new Date().toISOString() })
  const terms = request.proposed ?? { startTime: request.startTime, durationMinutes: request.durationMinutes, price: request.price }
  if (!isAvailable(state, request, terms.startTime, terms.durationMinutes)) return fail('conflict', '此時段已不再可用，請聯絡旅伴重新安排。')
  const confirmed = { ...request, ...terms, proposed: undefined, status: 'confirmed' as const, updatedAt: input.now ?? new Date().toISOString() }
  const itineraries = [...state.itineraries]
  let itinerary = itineraries.find((plan) => plan.id === request.itineraryId) ?? itineraries.find((plan) => plan.travelerId === request.travelerId && request.date >= plan.date && request.date <= (plan.endDate ?? plan.date))
  if (!itinerary) {
    itinerary = { id: makeId('itinerary'), travelerId: request.travelerId, title: '我的花東自由行', date: request.date, endDate: request.date, dayCount: 1, budget: 0, interests: [], items: [], updatedAt: confirmed.updatedAt }
    itineraries.push(itinerary)
  }
  const companion = state.companions.find((person) => person.id === request.companionId)!
  const endMinutes = mins(confirmed.startTime) + confirmed.durationMinutes
  const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`
  if (itinerary.items.some((existing) => existing.date === confirmed.date && mins(existing.startTime) < endMinutes && mins(confirmed.startTime) < mins(existing.endTime))) return fail('conflict', '旅程草稿中已有重疊安排，請調整後再確認服務。')
  const item = { id: `itinerary-${request.id}`, kind: 'companion' as const, serviceRequestId: request.id, title: `在地旅伴・${companion.name}`, category: '在地旅伴', place: request.meetingPoint, date: request.date, startTime: confirmed.startTime, endTime, price: confirmed.price, note: '已確認的旅伴服務；請由預約管理變更或取消。' }
  const updatedPlan = { ...itinerary, endDate: request.date > (itinerary.endDate ?? itinerary.date) ? request.date : itinerary.endDate, dayCount: Math.max(itinerary.dayCount ?? 1, Math.ceil((Date.parse(`${request.date}T00:00:00Z`) - Date.parse(`${itinerary.date}T00:00:00Z`)) / 86400000) + 1), items: [...itinerary.items.filter((old) => old.serviceRequestId !== request.id), item].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)), updatedAt: confirmed.updatedAt }
  return { ok: true, value: { ...state, serviceRequests: state.serviceRequests.map((item) => item.id === request.id ? confirmed : item), itineraries: itineraries.map((plan) => plan.id === updatedPlan.id ? updatedPlan : plan) } }
}
export function cancelServiceRequest(state: AppState, input: { requestId: string; actor: 'traveler' | 'companion'; actorId: string; reason: string }, now = new Date().toISOString()): DomainResult<AppState> {
  const request = state.serviceRequests.find((item) => item.id === input.requestId)
  if (!request || (input.actor === 'traveler' ? request.travelerId !== input.actorId : request.companionId !== input.actorId)) return fail('missing', '找不到這筆服務需求。')
  if (!active(request.status)) return fail('state', '此服務已結束或取消，無法再次取消。')
  return replace(state, { ...request, status: 'cancelled', cancelReason: input.reason.trim() || '行程調整', cancelSource: input.actor, updatedAt: now })
}
export function completeServiceRequest(state: AppState, requestId: string, companionId: string, now = new Date().toISOString()): DomainResult<AppState> {
  const request = state.serviceRequests.find((item) => item.id === requestId && item.companionId === companionId)
  if (!request || request.status !== 'confirmed') return fail('state', '只有已確認的服務可以標記完成。')
  return replace(state, { ...request, status: 'completed', updatedAt: now })
}
function isAvailable(state: AppState, request: ServiceRequest, start: string, duration: number) {
  const person = state.companions.find((item) => item.id === request.companionId), endMin = mins(start) + duration
  const end = `${Math.floor(endMin / 60).toString().padStart(2, '0')}:${(endMin % 60).toString().padStart(2, '0')}`
  return !!person?.availability.some((slot) => slot.date === request.date && mins(slot.startTime) <= mins(start) && mins(slot.endTime) >= endMin) && !state.serviceRequests.some((other) => other.id !== request.id && other.companionId === request.companionId && other.date === request.date && active(other.status) && overlaps(start, end, other.startTime, `${Math.floor((mins(other.startTime) + other.durationMinutes) / 60).toString().padStart(2, '0')}:${((mins(other.startTime) + other.durationMinutes) % 60).toString().padStart(2, '0')}`))
}
function replace(state: AppState, request: ServiceRequest): DomainResult<AppState> { return { ok: true, value: { ...state, serviceRequests: state.serviceRequests.map((item) => item.id === request.id ? request : item) } } }
function fail(code: string, message: string): DomainResult<AppState> { return { ok: false, error: { code, message } } }
