import { createId } from './ids'
import type { AppState, DomainResult, TaskApplication } from './types'
export function applyForTask(state: AppState, input: { taskId: string; youthId: string; now: string }): DomainResult<AppState> {
  const task = state.tasks.find((item) => item.id === input.taskId)
  if (!task) return { ok: false, error: { code: 'NOT_FOUND', message: '找不到這項任務。' } }
  if (state.applications.some((item) => item.taskId === task.id && item.youthId === input.youthId)) return { ok: false, error: { code: 'DUPLICATE_APPLICATION', message: '你已申請過這項任務。' } }
  const application: TaskApplication = { id: createId('application'), taskId: task.id, youthId: input.youthId, status: 'pending', appliedAt: input.now }
  return { ok: true, value: { ...state, applications: [...state.applications, application] }, valueId: application.id }
}
export function acceptApplication(state: AppState, input: { applicationId: string; now: string }): DomainResult<AppState> {
  const application = state.applications.find((item) => item.id === input.applicationId)
  const task = state.tasks.find((item) => item.id === application?.taskId)
  if (!application || !task || application.status !== 'pending') return { ok: false, error: { code: 'INVALID_STATUS', message: '這筆申請目前無法錄取。' } }
  const accepted = state.applications.filter((item) => item.taskId === task.id && (item.status === 'accepted' || item.status === 'completed')).length
  if (accepted >= task.slots) return { ok: false, error: { code: 'TASK_FULL', message: '任務錄取名額已滿。' } }
  return { ok: true, value: { ...state, applications: state.applications.map((item) => item.id === application.id ? { ...item, status: 'accepted' } : item) } }
}
export function rejectApplication(state: AppState, applicationId: string): DomainResult<AppState> {
  const application = state.applications.find((item) => item.id === applicationId)
  if (!application || application.status !== 'pending') return { ok: false, error: { code: 'INVALID_STATUS', message: '只有待審核申請可以標記未錄取。' } }
  return { ok: true, value: { ...state, applications: state.applications.map((item) => item.id === application.id ? { ...item, status: 'rejected' } : item) } }
}
export function cancelApplication(state: AppState, input: { applicationId: string; youthId: string; now: string }): DomainResult<AppState> {
  const application = state.applications.find((item) => item.id === input.applicationId && item.youthId === input.youthId)
  if (!application || !['pending', 'accepted'].includes(application.status)) return { ok: false, error: { code: 'INVALID_STATUS', message: '這筆申請目前無法取消。' } }
  return { ok: true, value: { ...state, applications: state.applications.map((item) => item.id === application.id ? { ...item, status: 'cancelled' } : item) } }
}
export function completeApplication(state: AppState, input: { applicationId: string; now: string }): DomainResult<AppState> {
  const application = state.applications.find((item) => item.id === input.applicationId)
  const task = state.tasks.find((item) => item.id === application?.taskId)
  if (!application || !task || application.status !== 'accepted' || !task.eligible) return { ok: false, error: { code: 'NOT_ELIGIBLE', message: '只有已錄取且符合資格的任務可以完成。' } }
  return { ok: true, value: { ...state, applications: state.applications.map((item) => item.id === application.id ? { ...item, status: 'completed' } : item) } }
}
export function totalEligibleHours(state: AppState, youthId: string): number {
  return state.applications.filter((application) => application.youthId === youthId && application.status === 'completed').reduce((hours, application) => hours + (state.tasks.find((task) => task.id === application.taskId && task.eligible)?.hours ?? 0), 0)
}
