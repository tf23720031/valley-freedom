import { describe, expect, it } from 'vitest'
import { createInitialState } from './fixtures'
import { createServiceRequest } from './companions'
import { recordPlaceStamp } from './routeRewards'

describe('place route rewards', () => {
  it('unlocks one NT$200 companion reward after two distinct place stamps', () => {
    const initial = createInitialState()
    const first = recordPlaceStamp(initial, 'muri-sunshine', '2026-11-01T08:00:00.000Z')
    expect(first.ok).toBe(true)
    if (!first.ok) return
    expect(first.value.routeRewards).toHaveLength(0)
    const second = recordPlaceStamp(first.value, 'bamboo-symphony', '2026-11-02T08:00:00.000Z')
    expect(second.ok).toBe(true)
    if (!second.ok) return
    expect(second.value.routeRewards).toMatchObject([{ amount: 200, status: 'available', stampIds: [expect.any(String), expect.any(String)] }])
  })

  it('rejects duplicate stamps and redeems the reward atomically with a companion request', () => {
    const first = recordPlaceStamp(createInitialState(), 'muri-sunshine')
    if (!first.ok) throw Error(first.error.message)
    expect(recordPlaceStamp(first.value, 'muri-sunshine').ok).toBe(false)
    const second = recordPlaceStamp(first.value, 'bamboo-symphony')
    if (!second.ok) throw Error(second.error.message)
    const reward = second.value.routeRewards[0]
    const request = createServiceRequest(second.value, { travelerId: 'traveler-demo', companionId: 'companion-lin', destination: '瑞穗', meetingPoint: '瑞穗車站', date: '2026-11-15', startTime: '14:00', durationMinutes: 90, partySize: 2, language: '英文', service: 'language-support', notes: '', rewardId: reward.id })
    expect(request.ok).toBe(true)
    if (!request.ok) return
    expect(request.value.routeRewards[0]).toMatchObject({ status: 'redeemed', redeemedRequestId: request.value.serviceRequests[0].id })
    expect(request.value.serviceRequests[0]).toMatchObject({ discountAmount: 200, price: 1350, status: 'pending' })
  })
})
