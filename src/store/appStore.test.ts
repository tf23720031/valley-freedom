import { beforeEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY, dispatch, getSnapshot, resetStoreForTests, setRole, subscribe } from './appStore'
import { createInitialState } from '../domain/fixtures'
import { experiencePhotoSet } from '../domain/photoSources'

describe('shared LocalStorage application store', () => {
  beforeEach(() => { localStorage.clear(); resetStoreForTests() })

  it('persists role changes and restores them after module state is reset', () => {
    expect(setRole('operator').ok).toBe(true)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).role).toBe('operator')
    resetStoreForTests()
    expect(getSnapshot().role).toBe('operator')
  })

  it('notifies subscribers when another tab changes the shared storage key', () => {
    const listener = vi.fn()
    const unsubscribe = subscribe(listener)
    const external = { ...createInitialState(), role: 'companion' as const }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(external))
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(external) }))
    expect(getSnapshot().role).toBe('companion')
    expect(listener).toHaveBeenCalled()
    unsubscribe()
  })

  it('recovers from malformed storage content with a visible fallback state', () => {
    localStorage.setItem(STORAGE_KEY, '{broken')
    resetStoreForTests()
    expect(getSnapshot().experiences.length).toBeGreaterThanOrEqual(8)
  })

  it('migrates saved experience illustrations to the generated photo assets', () => {
    const previous = createInitialState()
    previous.experiences[0].image = '/illustrations/experience-1.svg'
    localStorage.setItem(STORAGE_KEY, JSON.stringify(previous))
    resetStoreForTests()
    expect(getSnapshot().experiences[0].image).toBe(experiencePhotoSet[0])
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).experiences[0].image).toBe(experiencePhotoSet[0])
  })

  it('migrates the previous youth perspective to the companion role without losing bookings', () => {
    const previous = { ...createInitialState(), schemaVersion: 1, role: 'youth', bookings: [{ ...createInitialState().bookings[0] }] }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(previous))
    resetStoreForTests()
    const migrated = getSnapshot()
    expect(migrated.role).toBe('companion')
    expect(migrated.bookings).toHaveLength(1)
    expect(migrated.companions.length).toBeGreaterThanOrEqual(3)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).schemaVersion).toBe(2)
  })

  it('routes all updates through a result-returning dispatcher', () => {
    const result = dispatch((state) => ({ ok: true, value: { ...state, role: 'operator' } }))
    expect(result.ok).toBe(true)
    expect(getSnapshot().role).toBe('operator')
  })
})
