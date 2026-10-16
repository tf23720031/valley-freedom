import { describe, expect, it } from 'vitest'
import { createInitialState } from './fixtures'
import { acceptApplication, applyForTask, cancelApplication, completeApplication, totalEligibleHours } from './youth'

describe('youth task rules', () => {
  it('prevents the same youth applying twice for a task', () => {
    const state = createInitialState()
    const first = applyForTask(state, { taskId: 'task-harvest', youthId: 'youth-demo', now: '2026-10-16T10:00:00.000Z' })
    expect(first.ok).toBe(false)
  })

  it('counts hours only after an eligible accepted task is completed', () => {
    const state = createInitialState()
    const accepted = acceptApplication(state, { applicationId: 'application-pending', now: '2026-10-16T10:00:00.000Z' })
    expect(accepted.ok).toBe(true)
    if (accepted.ok) {
      const complete = completeApplication(accepted.value, { applicationId: 'application-pending', now: '2026-10-16T11:00:00.000Z' })
      expect(complete.ok).toBe(true)
      if (complete.ok) expect(totalEligibleHours(complete.value, 'youth-demo')).toBeGreaterThan(0)
    }
  })

  it('records a youth withdrawal and prevents submitting a second application for that task', () => {
    const state = createInitialState()
    const result = cancelApplication(state, { applicationId: 'application-pending', youthId: 'youth-demo', now: '2026-10-16T10:00:00.000Z' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.applications.find((item) => item.id === 'application-pending')?.status).toBe('cancelled')
      expect(applyForTask(result.value, { taskId: 'task-content', youthId: 'youth-demo', now: '2026-10-16T11:00:00.000Z' }).ok).toBe(false)
    }
  })
})

