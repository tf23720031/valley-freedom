import { createContext, useContext, useSyncExternalStore } from 'react'
import type { AppState } from '../domain/types'
import { getSnapshot, subscribe } from './appStore'

const StateContext = createContext<AppState | null>(null)
export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return <StateContext.Provider value={state}>{children}</StateContext.Provider>
}
export function useAppState() {
  const state = useContext(StateContext)
  if (!state) throw new Error('useAppState must be used inside AppStateProvider')
  return state
}
