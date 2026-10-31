import type { AppState, Companion, CompanionDemand, CompanionService, DemandApplication, DomainResult, Itinerary, ServiceRequest } from './types'
import { estimateCompanionFee } from './companions'
import { makeId } from './fixtures'

export type DemandDraft = Omit<CompanionDemand, 'id' | 'status' | 'createdAt'>
export interface CompanionRecommendation { companion: Companion; fullyMatched: boolean; missing: string[]; suggestedQuote: number }
const minutes = (time: string) => { const [hour, minute] = time.split(':').map(Number); return hour * 60 + minute }
const timeFrom = (total: number) => `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
const activeRequest = (status: ServiceRequest['status']) => ['pending', 'accepted', 'countered', 'confirmed'].includes(status)
function areaMatch(person: Companion, destination: string) { return destination === '花東全區' || person.serviceAreas.some((area) => destination.includes(area) || area.includes(destination) || (destination.includes('瑞穗') && area === '舞鶴') || (destination.includes('臺東') && area.includes('台東'))) }
function hasConflict(state: AppState, person: Companion, date: string, startTime: string, endTime: string) {
  return state.serviceRequests.some((request) => request.companionId === person.id && request.date === date && activeRequest(request.status) && minutes(request.startTime) < minutes(endTime) && minutes(startTime) < minutes(request.startTime) + request.durationMinutes)
}
export function publishDemand(state: AppState, draft: DemandDraft, now: string): DomainResult<AppState> {
  if (!draft.date || draft.date < now.slice(0, 10) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.startTime) || !draft.meetingPoint.trim() || !draft.destination.trim() || !draft.language || !draft.skills.length || !Number.isInteger(draft.durationMinutes) || draft.durationMinutes < 30 || draft.durationMinutes > 480 || !Number.isInteger(draft.maxBudget) || draft.maxBudget < 1 || !Number.isInteger(draft.travelerCount) || draft.travelerCount < 1 || draft.travelerCount > 20) return fail('INVALID_DEMAND', '請確認日期、時間、地點、服務條件、預算與同行人數。')
  if (minutes(draft.startTime) + draft.durationMinutes > 1440) return fail('INVALID_TIME', '服務時間不可超過午夜。')
  const demand: CompanionDemand = { ...draft, id: makeId('demand'), meetingPoint: draft.meetingPoint.trim(), destination: draft.destination.trim(), notes: draft.notes.trim(), status: 'open', createdAt: now }
  return { ok: true, value: { ...state, companionDemands: [...state.companionDemands, demand] }, valueId: demand.id }
}
export function recommendCompanions(state: AppState, demandId: string): CompanionRecommendation[] {
  const demand = state.companionDemands.find((item) => item.id === demandId)
  if (!demand) return []
  const end = timeFrom(minutes(demand.startTime) + demand.durationMinutes)
  return state.companions.map((companion) => {
    const missing: string[] = []
    if (!areaMatch(companion, demand.destination)) missing.push('服務地區不符')
    if (!companion.availability.some((slot) => slot.date === demand.date && slot.startTime <= demand.startTime && slot.endTime >= end)) missing.push('時段未開放')
    if (!companion.languages.includes(demand.language)) missing.push(`不支援${demand.language}`)
    const unsupported = demand.skills.filter((skill) => !companion.services.includes(skill))
    if (unsupported.length) missing.push('服務技能不足')
    const quote = estimateCompanionFee(demand.durationMinutes, companion.ratePerHour)
    if (quote > demand.maxBudget) missing.push('預估服務費超出預算')
    if (hasConflict(state, companion, demand.date, demand.startTime, end)) missing.push('時段已有服務')
    return { companion, fullyMatched: missing.length === 0, missing, suggestedQuote: quote }
  }).sort((a, b) => Number(b.fullyMatched) - Number(a.fullyMatched) || a.missing.length - b.missing.length || a.suggestedQuote - b.suggestedQuote)
}
export function applyToDemand(state: AppState, input: { demandId: string; companionId: string; quote: number; proposal: string }, now: string): DomainResult<AppState> {
  const demand = state.companionDemands.find((item) => item.id === input.demandId)
  if (!demand || demand.status !== 'open' || demand.date < now.slice(0, 10)) return fail('DEMAND_CLOSED', '這項需求已截止或不再開放申請。')
  if (!state.companions.some((person) => person.id === input.companionId)) return fail('COMPANION_NOT_FOUND', '找不到這位旅伴。')
  if (!Number.isInteger(input.quote) || input.quote < 1 || input.quote > demand.maxBudget || !input.proposal.trim() || input.proposal.trim().length > 300) return fail('INVALID_PROPOSAL', `請提出 1 至 NT$${demand.maxBudget.toLocaleString()} 的報價與 300 字內服務提案。`)
  if (state.demandApplications.some((application) => application.demandId === demand.id && application.companionId === input.companionId && ['pending', 'accepted'].includes(application.status))) return fail('DUPLICATE_APPLICATION', '你已申請這項需求。')
  const application: DemandApplication = { id: makeId('demand-application'), demandId: demand.id, companionId: input.companionId, quote: input.quote, proposal: input.proposal.trim(), status: 'pending', appliedAt: now }
  return { ok: true, value: { ...state, demandApplications: [...state.demandApplications, application] }, valueId: application.id }
}
export function withdrawDemandApplication(state: AppState, input: { applicationId: string; companionId: string }): DomainResult<AppState> {
  const application = state.demandApplications.find((item) => item.id === input.applicationId && item.companionId === input.companionId)
  if (!application || application.status !== 'pending') return fail('APPLICATION_CLOSED', '只有待處理的申請可以撤回。')
  return replaceApplication(state, { ...application, status: 'withdrawn' })
}
export function cancelDemand(state: AppState, input: { demandId: string; travelerId: string }): DomainResult<AppState> {
  const demand = state.companionDemands.find((item) => item.id === input.demandId && item.travelerId === input.travelerId)
  if (!demand || demand.status !== 'open') return fail('DEMAND_CLOSED', '只有尚未媒合的需求可以取消。')
  return { ok: true, value: { ...state, companionDemands: state.companionDemands.map((item) => item.id === demand.id ? { ...item, status: 'cancelled' } : item), demandApplications: state.demandApplications.map((item) => item.demandId === demand.id && item.status === 'pending' ? { ...item, status: 'closed' } : item) } }
}
export function acceptDemandApplication(state: AppState, input: { applicationId: string; travelerId: string }, now: string): DomainResult<AppState> {
  const application = state.demandApplications.find((item) => item.id === input.applicationId && item.status === 'pending')
  const demand = application && state.companionDemands.find((item) => item.id === application.demandId && item.travelerId === input.travelerId && item.status === 'open')
  if (!application || !demand || demand.date < now.slice(0, 10)) return fail('DEMAND_CLOSED', '需求已媒合、取消或過期，不能再接受申請。')
  if (application.quote > demand.maxBudget) return fail('OVER_BUDGET', '旅伴報價超過你的預算上限。')
  const candidate = recommendCompanions(state, demand.id).find((item) => item.companion.id === application.companionId)
  if (!candidate?.fullyMatched) return fail('MISMATCHED', `無法確認這位旅伴符合所有條件：${candidate?.missing.join('、') ?? '旅伴資料已不存在'}。`)
  const startEnd = timeFrom(minutes(demand.startTime) + demand.durationMinutes)
  if (hasConflict(state, candidate.companion, demand.date, demand.startTime, startEnd)) return fail('SCHEDULE_CONFLICT', '旅伴時段已被其他已確認服務占用。')
  const plan = state.itineraries.find((item) => item.id === demand.itineraryId) ?? state.itineraries.find((item) => item.travelerId === demand.travelerId && demand.date >= item.date && demand.date <= (item.endDate ?? item.date))
  if (plan?.items.some((item) => item.date === demand.date && minutes(item.startTime) < minutes(startEnd) && minutes(demand.startTime) < minutes(item.endTime) && item.serviceRequestId !== undefined)) return fail('ITINERARY_CONFLICT', '行程已有另一筆旅伴安排，請先調整時間。')
  const serviceRequest: ServiceRequest = { id: makeId('request'), travelerId: demand.travelerId, companionId: candidate.companion.id, itineraryId: plan?.id, status: 'confirmed', destination: demand.destination, meetingPoint: demand.meetingPoint, date: demand.date, startTime: demand.startTime, durationMinutes: demand.durationMinutes, partySize: demand.travelerCount, language: demand.language, service: demand.skills[0] as CompanionService, notes: demand.notes, price: application.quote, createdAt: now, updatedAt: now }
  let itineraries = state.itineraries
  const target = plan ?? ({ id: makeId('itinerary'), travelerId: demand.travelerId, title: '我的花東自由行', date: demand.date, endDate: demand.date, dayCount: 1, budget: 0, interests: [], items: [], updatedAt: now, submissionStatus: 'draft' as const } satisfies Itinerary)
  if (!plan) itineraries = [...itineraries, target]
  const endMinutes = minutes(demand.startTime) + demand.durationMinutes
  const item = { id: makeId('item'), kind: 'companion' as const, serviceRequestId: serviceRequest.id, title: `在地旅伴・${candidate.companion.name}`, category: '在地旅伴', place: demand.meetingPoint, date: demand.date, startTime: demand.startTime, endTime: timeFrom(endMinutes), price: application.quote, note: '依旅客接受的旅伴報價建立；與體驗費分開。' }
  itineraries = itineraries.map((itinerary) => itinerary.id === target.id ? { ...itinerary, items: [...itinerary.items, item].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)), updatedAt: now } : itinerary)
  return { ok: true, value: { ...state, itineraries, serviceRequests: [...state.serviceRequests, serviceRequest], companionDemands: state.companionDemands.map((item) => item.id === demand.id ? { ...item, status: 'matched', acceptedApplicationId: application.id } : item), demandApplications: state.demandApplications.map((item) => item.demandId !== demand.id ? item : { ...item, status: item.id === application.id ? 'accepted' : item.status === 'pending' ? 'closed' : item.status }) } }
}
function replaceApplication(state: AppState, next: DemandApplication): DomainResult<AppState> { return { ok: true, value: { ...state, demandApplications: state.demandApplications.map((item) => item.id === next.id ? next : item) } } }
function fail<T = AppState>(code: string, message: string): DomainResult<T> { return { ok: false, error: { code, message } } }
