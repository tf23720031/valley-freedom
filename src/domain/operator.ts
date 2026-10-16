import { createId } from './ids'
import type { AppState, DomainResult, Experience, Session, Task } from './types'

export function createExperience(state: AppState, input: { title: string; category: string; description: string; price: number; durationMinutes: number; location: string; now: string }): DomainResult<AppState> {
  if (!input.title.trim() || !input.description.trim() || input.price < 0 || input.durationMinutes < 15) return { ok: false, error: { code: 'INVALID_EXPERIENCE', message: '請確認名稱、介紹、價格與體驗時間。' } }
  const experience: Experience = { id: createId('experience'), title: input.title.trim(), category: input.category, description: input.description.trim(), price: input.price, durationMinutes: input.durationMinutes, location: input.location.trim() || '花蓮縣瑞穗鄉', meetingPoint: input.location.trim() || '木日光文旦驛站入口', image: '/photos/pomelo-orchard.webp', tags: [input.category], published: true, isDemo: true }
  return { ok: true, value: { ...state, experiences: [...state.experiences, experience] }, valueId: experience.id }
}
export function updateExperience(state: AppState, input: { experienceId: string; title: string; description: string; price: number; durationMinutes: number; location: string }): DomainResult<AppState> {
  const current = state.experiences.find((item) => item.id === input.experienceId)
  if (!current || !input.title.trim() || !input.description.trim() || input.price < 0 || input.durationMinutes < 15) return { ok: false, error: { code: 'INVALID_EXPERIENCE', message: '請確認體驗名稱、介紹、價格與時長。' } }
  return { ok: true, value: { ...state, experiences: state.experiences.map((item) => item.id === current.id ? { ...item, title: input.title.trim(), description: input.description.trim(), price: input.price, durationMinutes: input.durationMinutes, location: input.location.trim() || item.location, meetingPoint: input.location.trim() || item.meetingPoint } : item) } }
}
export function createSession(state: AppState, input: { experienceId: string; date: string; startTime: string; endTime: string; capacity: number }): DomainResult<AppState> {
  if (!state.experiences.some((item) => item.id === input.experienceId && item.published) || !input.date || input.startTime >= input.endTime || !Number.isInteger(input.capacity) || input.capacity < 1) return { ok: false, error: { code: 'INVALID_SESSION', message: '請確認體驗、日期、時間及可預約名額。' } }
  const session: Session = { ...input, id: createId('session'), pilot: false }
  return { ok: true, value: { ...state, sessions: [...state.sessions, session] }, valueId: session.id }
}
export function updateSession(state: AppState, input: { sessionId: string; capacity: number }): DomainResult<AppState> {
  const session = state.sessions.find((item) => item.id === input.sessionId)
  const occupied = state.bookings.filter((booking) => booking.sessionId === input.sessionId && ['pending', 'confirmed'].includes(booking.status)).reduce((sum, booking) => sum + booking.partySize, 0)
  if (!session || !Number.isInteger(input.capacity) || input.capacity < 1) return { ok: false, error: { code: 'INVALID_CAPACITY', message: '請設定有效的場次名額。' } }
  if (input.capacity < occupied) return { ok: false, error: { code: 'CAPACITY_BELOW_BOOKED', message: `目前已有 ${occupied} 位旅客占用名額，容量不能低於此數。` } }
  return { ok: true, value: { ...state, sessions: state.sessions.map((item) => item.id === session.id ? { ...item, capacity: input.capacity } : item) } }
}
export function createTask(state: AppState, input: Omit<Task, 'id'>): DomainResult<AppState> {
  if (!input.title.trim() || input.startTime >= input.endTime || input.hours <= 0 || input.pay < 0 || input.slots < 1) return { ok: false, error: { code: 'INVALID_TASK', message: '請確認任務名稱、時段、工時、報酬與名額。' } }
  const task: Task = { ...input, id: createId('task') }
  return { ok: true, value: { ...state, tasks: [...state.tasks, task] }, valueId: task.id }
}
