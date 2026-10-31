import type { AppState, DomainResult } from './types'

const id = (prefix: string) => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`
export function recordPlaceStamp(state: AppState, placeId: string, now = new Date().toISOString()): DomainResult<AppState> {
  if (!state.placeMetrics.some((place) => place.placeId === placeId)) return { ok: false, error: { code: 'missing', message: '找不到這個候選場域。' } }
  if (state.placeStamps.some((stamp) => stamp.placeId === placeId)) return { ok: false, error: { code: 'duplicate', message: '這個場域已在本裝置集過示意紀錄。' } }
  const stamp = { id: id('stamp'), placeId, stampedAt: now, mode: 'demo' as const }
  const placeStamps = [...state.placeStamps, stamp]
  const distinct = new Set(placeStamps.map((item) => item.placeId))
  const qualifies = distinct.size >= 2 && !state.routeRewards.some((reward) => reward.kind === 'companion-200' && reward.status === 'available')
  const reward = qualifies ? { id: id('reward'), kind: 'companion-200' as const, amount: 200 as const, status: 'available' as const, stampIds: placeStamps.slice(-2).map((item) => item.id), createdAt: now } : undefined
  return { ok: true, value: { ...state, placeStamps, routeRewards: reward ? [...state.routeRewards, reward] : state.routeRewards } }
}
export function ratePlace(state: AppState, placeId: string, rating: number, now = new Date().toISOString()): DomainResult<AppState> {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { ok: false, error: { code: 'rating', message: '請選擇 1 至 5 分。' } }
  return { ok: true, value: { ...state, placeRatings: [...state.placeRatings, { id: id('rating'), placeId, rating, createdAt: now }] } }
}
