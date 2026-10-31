import type { AppState, Booking, CancelSource, DomainResult } from './types'
export function remainingSeats(state: AppState, sessionId: string): number {
  const session = state.sessions.find((item) => item.id === sessionId)
  if (!session || session.pilot) return 0
  const occupied = state.bookings.filter((booking) => booking.sessionId === sessionId && (booking.status === 'pending' || booking.status === 'confirmed')).reduce((total, booking) => total + booking.partySize, 0)
  return Math.max(0, session.capacity - occupied)
}
export function createBooking(state: AppState, input: { sessionId: string; travelerId: string; partySize: number; travelerCount?: number; includesCompanion?: boolean; serviceRequestId?: string; now: string }): DomainResult<AppState> {
  const session = state.sessions.find((item) => item.id === input.sessionId)
  if (!session || session.pilot || !Number.isInteger(input.partySize) || input.partySize < 1) return { ok: false, error: { code: 'INVALID_BOOKING', message: '請選擇有效場次與人數。' } }
  const travelerCount = input.travelerCount ?? input.partySize
  if (!Number.isInteger(travelerCount) || travelerCount < 1 || input.partySize !== travelerCount + (input.includesCompanion ? 1 : 0)) return { ok: false, error: { code: 'INVALID_PARTY_SIZE', message: '請確認旅客人數與旅伴占位設定。' } }
  if (input.includesCompanion) {
    const request = state.serviceRequests.find((item) => item.id === input.serviceRequestId && item.travelerId === input.travelerId && item.status === 'confirmed' && item.date === session.date)
    if (!request) return { ok: false, error: { code: 'COMPANION_NOT_CONFIRMED', message: '旅伴服務尚未確認，不能先占用體驗名額。' } }
  }
  if (session.date < input.now.slice(0, 10)) return { ok: false, error: { code: 'EXPIRED_SESSION', message: '場次日期已過，請重新選擇。' } }
  if (remainingSeats(state, session.id) < input.partySize) return { ok: false, error: { code: 'NO_CAPACITY', message: '剩餘名額不足，請調整人數或選擇其他場次。' } }
  if (state.bookings.some((booking) => booking.sessionId === session.id && booking.travelerId === input.travelerId && ['pending', 'confirmed'].includes(booking.status))) return { ok: false, error: { code: 'DUPLICATE_BOOKING', message: '你已預約這個場次，請查看預約紀錄。' } }
  const booking: Booking = { id: `booking-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`, sessionId: session.id, experienceId: session.experienceId, travelerId: input.travelerId, partySize: input.partySize, travelerCount, includesCompanion: input.includesCompanion ?? false, serviceRequestId: input.serviceRequestId, status: 'pending', createdAt: input.now }
  return { ok: true, value: { ...state, bookings: [...state.bookings, booking] }, valueId: booking.id }
}
export function cancelBooking(state: AppState, input: { bookingId: string; source: CancelSource; reason: string; now: string }): DomainResult<AppState> {
  const booking = state.bookings.find((item) => item.id === input.bookingId)
  if (!booking) return { ok: false, error: { code: 'NOT_FOUND', message: '找不到這筆預約。' } }
  if (booking.status === 'cancelled') return { ok: false, error: { code: 'ALREADY_CANCELLED', message: '這筆預約已取消。' } }
  if (booking.status === 'completed') return { ok: false, error: { code: 'ALREADY_COMPLETED', message: '已完成的預約無法取消。' } }
  if (!input.reason.trim()) return { ok: false, error: { code: 'REASON_REQUIRED', message: '請填寫取消原因。' } }
  return { ok: true, value: { ...state, bookings: state.bookings.map((item) => item.id === booking.id ? { ...item, status: 'cancelled', cancelReason: input.reason.trim(), cancelSource: input.source, cancelledAt: input.now } : item) } }
}
export function confirmBooking(state: AppState, bookingId: string): DomainResult<AppState> {
  const booking = state.bookings.find((item) => item.id === bookingId)
  if (!booking || booking.status !== 'pending') return { ok: false, error: { code: 'INVALID_STATUS', message: '只有待確認預約可以確認。' } }
  return { ok: true, value: { ...state, bookings: state.bookings.map((item) => item.id === bookingId ? { ...item, status: 'confirmed' } : item) } }
}
