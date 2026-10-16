import { createId } from './ids'
import type { AppState, DomainResult, Experience, PilotSession, Resource } from './types'
import { photos } from './photoSources'
export function addResource(state: AppState, input: Omit<Resource, 'id'>): DomainResult<AppState> {
  if (!input.name.trim() || !input.description.trim()) return { ok: false, error: { code: 'INVALID_RESOURCE', message: '請填寫地方資源名稱與內容。' } }
  const resource: Resource = { ...input, id: createId('resource') }
  return { ok: true, value: { ...state, resources: [...state.resources, resource] }, valueId: resource.id }
}
export function createDraft(state: AppState, input: { title: string; description: string; resourceIds: string[] }): DomainResult<AppState> {
  if (!input.title.trim() || !input.description.trim() || input.resourceIds.length === 0 || input.resourceIds.some((id) => !state.resources.some((resource) => resource.id === id))) return { ok: false, error: { code: 'INVALID_DRAFT', message: '請填寫草案內容並至少連結一項地方資源。' } }
  const draft = { id: createId('draft'), title: input.title.trim(), description: input.description.trim(), resourceIds: input.resourceIds, stage: 'draft' as const }
  return { ok: true, value: { ...state, drafts: [...state.drafts, draft], changeLog: [...state.changeLog, { id: createId('change'), draftId: draft.id, actorId: 'operator-demo', at: new Date().toISOString(), note: '建立體驗草案。' }] }, valueId: draft.id }
}
export function createPilot(state: AppState, input: { draftId: string; date: string; capacity: number }): DomainResult<AppState> {
  const draft = state.drafts.find((item) => item.id === input.draftId)
  if (!draft || draft.stage !== 'draft' || !input.date || !Number.isInteger(input.capacity) || input.capacity < 1) return { ok: false, error: { code: 'INVALID_PILOT', message: '請選擇草案並設定有效試辦日期與名額。' } }
  const pilot: PilotSession = { id: createId('pilot'), draftId: draft.id, date: input.date, capacity: input.capacity, label: '試辦' }
  return { ok: true, value: { ...state, pilotSessions: [...state.pilotSessions, pilot], drafts: state.drafts.map((item) => item.id === draft.id ? { ...item, stage: 'pilot' } : item), changeLog: [...state.changeLog, { id: createId('change'), draftId: draft.id, actorId: 'operator-demo', at: new Date().toISOString(), note: `建立試辦場次 ${input.date}。` }] }, valueId: pilot.id }
}
export function recordFeedback(state: AppState, input: { draftId: string; author: string; rating: number; text: string }): DomainResult<AppState> {
  const draft = state.drafts.find((item) => item.id === input.draftId)
  if (!draft || draft.stage !== 'pilot' || !state.pilotSessions.some((item) => item.draftId === draft.id) || !input.text.trim() || input.rating < 1 || input.rating > 5) return { ok: false, error: { code: 'INVALID_FEEDBACK', message: '須完成試辦並填寫有效回饋後才能評估。' } }
  const feedback = { id: createId('feedback'), draftId: draft.id, author: input.author.trim() || '示意參與者', rating: input.rating, text: input.text.trim() }
  return { ok: true, value: { ...state, feedback: [...state.feedback, feedback], drafts: state.drafts.map((item) => item.id === draft.id ? { ...item, stage: 'feedback' } : item), changeLog: [...state.changeLog, { id: createId('change'), draftId: draft.id, actorId: 'operator-demo', at: new Date().toISOString(), note: `試辦回饋評估：${feedback.text}` }] }, valueId: feedback.id }
}
export function reviseDraft(state: AppState, input: { draftId: string; title: string; description: string; note: string }): DomainResult<AppState> {
  const draft = state.drafts.find((item) => item.id === input.draftId)
  if (!draft || draft.stage === 'published' || !input.title.trim() || !input.description.trim() || !input.note.trim()) return { ok: false, error: { code: 'INVALID_REVISION', message: '請確認草案尚未上架，並填寫修改內容與原因。' } }
  return { ok: true, value: { ...state, drafts: state.drafts.map((item) => item.id === draft.id ? { ...item, title: input.title.trim(), description: input.description.trim() } : item), changeLog: [...state.changeLog, { id: createId('change'), draftId: draft.id, actorId: 'operator-demo', at: new Date().toISOString(), note: input.note.trim() }] } }
}
export function publishDraft(state: AppState, input: { draftId: string; operatorId: string; now: string }): DomainResult<AppState> {
  const draft = state.drafts.find((item) => item.id === input.draftId)
  if (!draft || draft.stage !== 'feedback' || draft.publishedExperienceId) return { ok: false, error: { code: 'INVALID_STAGE', message: '此草案尚未完成試辦回饋評估，或已正式上架。' } }
  const id = createId('experience')
  const experience: Experience = { id, title: draft.title, category: '共創體驗', description: draft.description, location: '木日光文旦驛站', meetingPoint: '木日光文旦驛站入口', durationMinutes: 120, price: 680, image: photos.food, tags: ['地方共創'], published: true, sourceDraftId: draft.id, isDemo: true }
  return { ok: true, value: { ...state, experiences: [...state.experiences, experience], drafts: state.drafts.map((item) => item.id === draft.id ? { ...item, stage: 'published', publishedExperienceId: id } : item), changeLog: [...state.changeLog, { id: createId('change'), draftId: draft.id, actorId: input.operatorId, at: input.now, note: '體驗正式上架。' }] }, valueId: id }
}
