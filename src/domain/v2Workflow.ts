import type { AppState, Itinerary, ItineraryItem } from './types'
import { createBooking, remainingSeats } from './booking'

export interface ItineraryConfirmationReport { sent: string[]; failed: Array<{ itemId: string; title: string; reason: string }> }
export function confirmItineraryItems(state: AppState, itineraryId: string, now: string): { state: AppState; report: ItineraryConfirmationReport } {
  const plan = state.itineraries.find((item) => item.id === itineraryId)
  const report: ItineraryConfirmationReport = { sent: [], failed: [] }
  if (!plan) return { state, report: { sent: [], failed: [{ itemId: itineraryId, title: '行程', reason: '找不到這份行程。' }] } }
  let current = state
  const items = plan.items.map((item) => {
    if (item.kind !== 'experience') return item
    if (item.bookingId && current.bookings.some((booking) => booking.id === item.bookingId && ['pending', 'confirmed'].includes(booking.status))) return item
    if (!item.sessionId) { report.failed.push({ itemId: item.id, title: item.title, reason: '尚未選擇場次。' }); return item }
    const session = current.sessions.find((candidate) => candidate.id === item.sessionId)
    if (session && session.date < now.slice(0, 10)) { report.failed.push({ itemId: item.id, title: item.title, reason: '場次日期已過，請重新選擇。' }); return item }
    const travelerCount = item.partySize ?? 1
    let requestedCompanion = item.companionIncluded ?? false
    const linkedRequest = item.companionRequestId ? current.serviceRequests.find((request) => request.id === item.companionRequestId) : undefined
    if (requestedCompanion && (!linkedRequest || linkedRequest.status !== 'confirmed')) requestedCompanion = false
    const partySize = travelerCount + (requestedCompanion ? 1 : 0)
    const booking = createBooking(current, { sessionId: item.sessionId, travelerId: plan.travelerId, partySize, travelerCount, includesCompanion: requestedCompanion, serviceRequestId: requestedCompanion ? linkedRequest?.id : undefined, now })
    if (!booking.ok) { report.failed.push({ itemId: item.id, title: item.title, reason: booking.error.message }); return item }
    current = booking.value
    report.sent.push(item.id)
    return { ...item, bookingId: booking.valueId, companionIncluded: requestedCompanion }
  })
  const nextStatus = report.failed.length ? report.sent.length ? 'partial' : plan.submissionStatus === 'submitted' ? 'submitted' : 'draft' : report.sent.length || plan.submissionStatus === 'submitted' ? 'submitted' : 'draft'
  const updated: Itinerary = { ...plan, items, submissionStatus: nextStatus, updatedAt: now }
  return { state: { ...current, itineraries: current.itineraries.map((item) => item.id === plan.id ? updated : item) }, report }
}

export function itemHasActiveBooking(item: ItineraryItem, state: AppState): boolean {
  return Boolean(item.bookingId && state.bookings.some((booking) => booking.id === item.bookingId && ['pending', 'confirmed'].includes(booking.status)))
}
export function itineraryRemainingSeats(state: AppState, sessionId: string): number { return remainingSeats(state, sessionId) }
