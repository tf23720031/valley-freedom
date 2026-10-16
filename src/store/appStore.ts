import type { AppState, DomainResult, Role } from '../domain/types'
import { createInitialState } from '../domain/fixtures'

export const STORAGE_KEY = 'valley-freedom-state-v1'
type Listener = () => void
const listeners = new Set<Listener>()
let state: AppState | undefined
let warning = ''

function notify() { listeners.forEach((listener) => listener()) }
function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AppState>
  return candidate.schemaVersion === 1 && ['experiences', 'sessions', 'bookings', 'itineraries', 'tasks', 'applications', 'resources', 'drafts', 'pilotSessions', 'feedback', 'changeLog'].every((key) => Array.isArray(candidate[key as keyof AppState]))
}
function persist(value: AppState) {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(value)) }
  catch { warning = '瀏覽器無法保存資料，請確認儲存空間設定。' }
}
const demoExperiencePhotos = ['/photos/pomelo-orchard.webp', '/photos/rice-kitchen.webp', '/photos/bamboo-weaving.webp', '/photos/tea-harvest.webp', '/photos/valley-trail.webp', '/photos/pomelo-kitchen.webp', '/photos/valley-hero.webp', '/photos/river-study.webp']
function migratePhotoAssets(value: AppState): AppState {
  let changed = false
  const experiences = value.experiences.map((experience) => {
    if (!experience.image.includes('/illustrations/')) return experience
    const index = Number(experience.id.match(/experience-(\d+)/)?.[1] ?? 1) - 1
    changed = true
    return { ...experience, image: demoExperiencePhotos[index] ?? demoExperiencePhotos[0] }
  })
  if (!changed) return value
  return { ...value, experiences }
}
function loadState(): AppState {
  if (state) return state
  try {
    const saved = typeof localStorage === 'undefined' ? null : localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      if (isAppState(parsed)) { state = migratePhotoAssets(parsed); persist(state); return state }
      warning = '示範資料格式不相容，已載入初始資料。'
    }
  } catch { warning = '示範資料無法讀取，已載入初始資料。' }
  state = createInitialState()
  persist(state)
  return state
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
