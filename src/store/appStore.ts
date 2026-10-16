import type { AppState, DomainResult } from '../domain/types'
import { createInitialState } from '../domain/fixtures'
import type { Companion, Role } from '../domain/types'
import { experiencePhotoSet } from '../domain/photoSources'

export const STORAGE_KEY = 'valley-freedom-state-v1'
type Listener = () => void
const listeners = new Set<Listener>()
let state: AppState | undefined
let warning = ''

function notify() { listeners.forEach((listener) => listener()) }
function isAppState(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return [1, 2].includes(candidate.schemaVersion as number) && ['experiences', 'sessions', 'bookings', 'itineraries', 'tasks', 'applications', 'resources', 'drafts', 'pilotSessions', 'feedback', 'changeLog'].every((key) => Array.isArray(candidate[key]))
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
  if (raw.schemaVersion === 2 && Array.isArray(raw.companions) && Array.isArray(raw.serviceRequests)) return raw as unknown as AppState
  const old = raw as unknown as Record<string, any>
  const companions = fresh.companions.map((person) => ({ ...person })) as Companion[]
  return { ...fresh, ...old, schemaVersion: 2, role: (old.role === 'youth' ? 'companion' : old.role) as Role, companionId: old.companionId ?? companions[0].id, companions, serviceRequests: [], itineraries: (old.itineraries ?? []).map((plan: AppState['itineraries'][number]) => ({ ...plan, endDate: plan.endDate ?? plan.date, dayCount: plan.dayCount ?? 1, items: plan.items.map((item) => ({ ...item, place: item.place ?? '', category: item.category ?? (item.kind === 'experience' ? '地方體驗' : '自由活動') })) })) }
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
