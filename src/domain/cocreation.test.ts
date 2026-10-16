import { describe, expect, it } from 'vitest'
import { createInitialState } from './fixtures'
import { addResource, createDraft, createPilot, publishDraft, recordFeedback } from './cocreation'

describe('co-creation provenance', () => {
  it('publishes a new experience linked to the source draft exactly once', () => {
    const state = createInitialState()
    const result = publishDraft(state, { draftId: 'draft-pomelo', operatorId: 'operator-demo', now: '2026-10-16T10:00:00.000Z' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      const published = result.value.experiences.find((item) => item.id === result.valueId)
      expect(published?.sourceDraftId).toBe('draft-pomelo')
      expect(published?.id).not.toBe('draft-pomelo')
      expect(publishDraft(result.value, { draftId: 'draft-pomelo', operatorId: 'operator-demo', now: '2026-10-16T10:00:00.000Z' }).ok).toBe(false)
    }
  })

  it('moves a newly inventoried place resource through draft, pilot, feedback and publication', () => {
    const resource = addResource(createInitialState(), { name: '舊農具與曬穀場', type: 'idle', description: '午後可開放的老場域和農具。', partner: '山下農家', availability: '週末午後' })
    expect(resource.ok).toBe(true)
    if (!resource.ok) return
    const draft = createDraft(resource.value, { title: '曬穀場的午後', description: '從農具與稻米認識地方生活。', resourceIds: [resource.valueId!] })
    expect(draft.ok).toBe(true)
    if (!draft.ok) return
    const pilot = createPilot(draft.value, { draftId: draft.valueId!, date: '2026-11-20', capacity: 6 })
    expect(pilot.ok).toBe(true)
    if (!pilot.ok) return
    const feedback = recordFeedback(pilot.value, { draftId: draft.valueId!, author: '試辦旅人 B', rating: 4, text: '很喜歡跟著農家認識器物。' })
    expect(feedback.ok).toBe(true)
    if (!feedback.ok) return
    const published = publishDraft(feedback.value, { draftId: draft.valueId!, operatorId: 'operator-demo', now: '2026-10-16T10:00:00.000Z' })
    expect(published.ok).toBe(true)
    if (published.ok) {
      expect(published.value.experiences.find((item) => item.id === published.valueId)?.sourceDraftId).toBe(draft.valueId)
      expect(published.value.pilotSessions.some((item) => item.draftId === draft.valueId && item.label === '試辦')).toBe(true)
      expect(published.value.feedback.some((item) => item.draftId === draft.valueId)).toBe(true)
    }
  })
})
