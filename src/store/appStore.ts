import type { AppState, DomainResult } from '../domain/types'
import { createInitialState, getDemoServiceDate } from '../domain/fixtures'
import type { Companion, Role } from '../domain/types'
import { experiencePhotoSet } from '../domain/photoSources'
import { DEFAULT_REVENUE_ASSUMPTIONS } from '../domain/revenueShare'

export const STORAGE_KEY = 'valley-freedom-state-v1'
type Listener = () => void
const listeners = new Set<Listener>()
let state: AppState | undefined
let warning = ''

function notify() { listeners.forEach((listener) => listener()) }
function isAppState(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return [1, 2, 3, 4, 5].includes(candidate.schemaVersion as number) && ['experiences', 'sessions', 'bookings', 'itineraries', 'tasks', 'applications', 'resources', 'drafts', 'pilotSessions', 'feedback', 'changeLog'].every((key) => Array.isArray(candidate[key]))
}
function persist(value: AppState) {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(value)) }
  catch { warning = '瀏覽器無法保存資料，請確認儲存空間設定。' }
}
function migratePhotoAssets(value: AppState): AppState {
  let changed = false
  const experiences = value.experiences.map((experience) => {
    if (!experience.image.startsWith('/photos/') && !experience.image.includes('/illustrations/')) return experience
    const index = Number(experience.id.match(/experience-(\d+)/)?.[1] ?? 1) - 1
    changed = true
    return { ...experience, image: experiencePhotoSet[index] ?? experiencePhotoSet[0] }
  })
  const companions = value.companions.map((companion, index) => {
    const profile = { ...companion } as Companion & { ratePerHour?: number }
    if ('ratePerHour' in profile) { delete profile.ratePerHour; changed = true }
    companion = profile
    if (!companion.avatar.startsWith('/photos/')) return companion
    changed = true
    return { ...companion, avatar: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=700&q=85', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=700&q=85', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&h=700&q=85'][index] }
  })
  if (!changed) return value
  return { ...value, experiences, companions }
}
function loadState(): AppState {
  if (state) return state
  try {
    const saved = typeof localStorage === 'undefined' ? null : localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      if (isAppState(parsed)) { state = migratePhotoAssets(migrateState(parsed)); persist(state); return state }
      warning = '示範資料格式不相容，已載入初始資料。'
    }
  } catch { warning = '示範資料無法讀取，已載入初始資料。' }
  state = createInitialState()
  persist(state)
  return state
}
function migrateState(raw: Record<string, unknown>): AppState {
  const fresh = createInitialState()
  if ((raw.schemaVersion === 4 || raw.schemaVersion === 5) && Array.isArray(raw.companions) && Array.isArray(raw.serviceRequests)) {
    const saved = raw as unknown as AppState
    const freshCompanionsById = new Map(fresh.companions.map((person) => [person.id, person]))
    const todayISO = getDemoServiceDate(0)
    const companionsWithCurrentDemoSlots = saved.companions.map((person) => {
      const demo = freshCompanionsById.get(person.id)
      if (!person.demo || !demo || !person.availability.length || person.availability.some((slot) => slot.date >= todayISO)) return person
      return { ...person, availability: demo.availability }
    })
    const savedIds = new Set(saved.companions.map((person) => person.id))
    const missingDemoCompanions = fresh.companions.filter((person) => !savedIds.has(person.id))
    const sessions = saved.sessions.map((session) => {
      const demo = fresh.sessions.find((item) => item.id === session.id)
      const hasTravelerBooking = saved.bookings.some((booking) => booking.sessionId === session.id && booking.travelerId === saved.travelerId)
      return demo && session.date < todayISO && !hasTravelerBooking ? { ...session, date: demo.date } : session
    })
    return {
      ...saved,
      schemaVersion: 5,
      sessions,
      revenueAssumptions: saved.revenueAssumptions ?? { ...DEFAULT_REVENUE_ASSUMPTIONS },
      serviceRequests: saved.serviceRequests.map((request) => ({ ...request, legacyEstimate: request.revenueSnapshot ? request.legacyEstimate : true })),
      companions: [...companionsWithCurrentDemoSlots, ...missingDemoCompanions],
    }
  }
  if ((raw.schemaVersion === 2 || raw.schemaVersion === 3) && Array.isArray(raw.companions) && Array.isArray(raw.serviceRequests)) {
    const saved = raw as unknown as Omit<AppState, 'schemaVersion' | 'placeStamps' | 'placeRatings' | 'routeRewards' | 'partnerLinks' | 'subsidies' | 'placeMetrics'>
    const savedIds = new Set(saved.companions.map((person) => person.id))
    const missingDemoCompanions = fresh.companions.filter((person) => !savedIds.has(person.id))
    return { ...fresh, ...saved, authenticated: false, rememberLogin: false, companionDemands: [], demandApplications: [], shopProfile: fresh.shopProfile, revenueAssumptions: { ...DEFAULT_REVENUE_ASSUMPTIONS }, serviceRequests: saved.serviceRequests.map((request) => ({ ...request, legacyEstimate: true })), companions: [...saved.companions, ...missingDemoCompanions], schemaVersion: 5 }
  }
  const old = raw as unknown as Record<string, any>
  const companions = fresh.companions.map((person) => ({ ...person })) as Companion[]
  return { ...fresh, ...old, authenticated: false, rememberLogin: false, schemaVersion: 5, role: (old.role === 'youth' ? 'companion' : old.role) as Role, companionId: old.companionId ?? companions[0].id, companions, serviceRequests: [], companionDemands: [], demandApplications: [], shopProfile: fresh.shopProfile, revenueAssumptions: { ...DEFAULT_REVENUE_ASSUMPTIONS }, bookings: (old.bookings ?? fresh.bookings).map((booking: AppState['bookings'][number]) => ({ ...booking, travelerCount: booking.travelerCount ?? booking.partySize })), itineraries: (old.itineraries ?? []).map((plan: AppState['itineraries'][number]) => ({ ...plan, endDate: plan.endDate ?? plan.date, dayCount: plan.dayCount ?? 1, submissionStatus: plan.submissionStatus ?? 'draft', items: plan.items.map((item) => ({ ...item, partySize: item.partySize ?? 1, place: item.place ?? '', category: item.category ?? (item.kind === 'experience' ? '地方體驗' : '自由活動') })) })), placeStamps: [], placeRatings: [], routeRewards: [], partnerLinks: [], subsidies: [], placeMetrics: fresh.placeMetrics }
}
export function getSnapshot(): AppState { return loadState() }
export function getStoreWarning(): string { loadState(); return warning }
export function subscribe(listener: Listener): () => void { listeners.add(listener); return () => listeners.delete(listener) }
export function dispatch(updater: (current: AppState) => DomainResult<AppState>): DomainResult<AppState> {
  const result = updater(loadState())
  if (!result.ok) return result
  state = result.value
  persist(state)
  notify()
  return result
}
export function setRole(role: Role): DomainResult<AppState> { return dispatch((current) => ({ ok: true, value: { ...current, role } })) }
export function loginDemo(rememberLogin = false, role: Role = 'traveler'): DomainResult<AppState> { return dispatch((current) => ({ ok: true, value: { ...current, authenticated: true, rememberLogin, role } })) }
export function logoutDemo(): DomainResult<AppState> { return dispatch((current) => ({ ok: true, value: { ...current, authenticated: false, rememberLogin: false } })) }
export function resetDemoData(): AppState {
  state = createInitialState()
  warning = ''
  persist(state)
  notify()
  return state
}
export function resetStoreForTests() { state = undefined; warning = '' }

// `storage` only updates the display across tabs; it does not serialize concurrent writes.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return
    state = undefined
    loadState()
    notify()
  })
}
