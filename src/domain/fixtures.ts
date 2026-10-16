import type { AppState, Experience, Role } from './types'
export const makeId = (prefix: string) => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`}`
const experienceSeed: Array<[string, string, string, number, number]> = [
  ['文旦田裡的一日農事', '食農體驗', '走進果園，從枝葉與季節認識瑞穗文旦。', 120, 680],
  ['瑞穗米香與灶腳', '地方飲食', '與在地家人一起備料，聽一段日常餐桌故事。', 150, 880],
  ['月桃編織小物', '手作技藝', '以縱谷常見植物練習簡單編織。', 90, 520],
  ['舞鶴台地茶路', '地方故事', '沿著茶香認識台地產業與生活地景。', 150, 760],
  ['縱谷田野觀察', '自然觀察', '在田埂間閱讀季節、水路與生態。', 100, 450],
  ['木日光果醬實驗室', '食農體驗', '把當季水果做成一罐可以帶走的風味。', 120, 720],
  ['老屋裡的地方記憶', '聚落走讀', '從器物與照片拼起聚落生活片段。', 80, 380],
  ['縱谷晨光攝影散步', '自然觀察', '用慢速步行捕捉山線和水田的晨間光影。', 90, 0],
]
const experiencePhotos = [
  '/photos/pomelo-orchard.webp', '/photos/rice-kitchen.webp', '/photos/bamboo-weaving.webp', '/photos/tea-harvest.webp',
  '/photos/valley-trail.webp', '/photos/pomelo-kitchen.webp', '/photos/valley-hero.webp', '/photos/river-study.webp',
]
export function createInitialState(): AppState {
  const experiences: Experience[] = experienceSeed.map(([title, category, description, durationMinutes, price], index) => ({
    id: `experience-${index + 1}`, title, category, description, location: index % 2 ? '花蓮縣瑞穗鄉' : '木日光文旦驛站', meetingPoint: '木日光文旦驛站入口', durationMinutes, price,
    image: experiencePhotos[index], tags: [category, '瑞穗'], featured: index < 3, published: true, isDemo: true,
  }))
  const sessions = experiences.slice(0, 7).map((experience, index) => ({ id: index === 0 ? 'session-pomelo-1' : `session-${index + 1}`, experienceId: experience.id, date: '2026-11-14', startTime: index % 2 ? '14:00' : '09:30', endTime: index % 2 ? '16:00' : '11:30', capacity: index === 0 ? 10 : 12, pilot: false }))
  return {
    schemaVersion: 1, role: 'traveler' as Role, travelerId: 'traveler-demo', youthId: 'youth-demo', experiences, sessions,
    bookings: [
      { id: 'booking-pending', sessionId: 'session-pomelo-1', experienceId: 'experience-1', travelerId: 'traveler-demo', partySize: 2, status: 'pending', createdAt: '2026-10-10T10:00:00.000Z' },
      { id: 'booking-confirmed', sessionId: 'session-pomelo-1', experienceId: 'experience-1', travelerId: 'traveler-other', partySize: 1, status: 'confirmed', createdAt: '2026-10-10T10:00:00.000Z' },
      { id: 'booking-cancelled', sessionId: 'session-pomelo-1', experienceId: 'experience-1', travelerId: 'traveler-other', partySize: 2, status: 'cancelled', createdAt: '2026-10-10T10:00:00.000Z', cancelReason: '行程異動', cancelSource: 'traveler', cancelledAt: '2026-10-10T11:00:00.000Z' },
      { id: 'booking-completed', sessionId: 'session-pomelo-1', experienceId: 'experience-1', travelerId: 'traveler-other', partySize: 1, status: 'completed', createdAt: '2026-10-01T10:00:00.000Z' },
    ], itineraries: [],
    tasks: [
      { id: 'task-harvest', title: '文旦體驗場域協力', category: '活動接待', description: '協助報到、物資整理與活動紀錄。', date: '2026-11-14', startTime: '08:30', endTime: '12:30', hours: 4, pay: 900, slots: 2, eligible: true, location: '木日光文旦驛站' },
      { id: 'task-content', title: '地方故事影像整理', category: '內容製作', description: '協助整理照片與撰寫活動紀錄。', date: '2026-11-16', startTime: '13:00', endTime: '17:00', hours: 4, pay: 1000, slots: 1, eligible: true, location: '瑞穗' },
      { id: 'task-operations', title: '平台資料校對', category: '數位營運', description: '協助校對體驗資訊與回饋資料。', date: '2026-11-18', startTime: '09:00', endTime: '12:00', hours: 3, pay: 750, slots: 1, eligible: true, location: '遠端協作' },
    ],
    applications: [
      { id: 'application-accepted', taskId: 'task-harvest', youthId: 'youth-demo', status: 'accepted', appliedAt: '2026-10-12T08:00:00.000Z' },
      { id: 'application-pending', taskId: 'task-content', youthId: 'youth-demo', status: 'pending', appliedAt: '2026-10-13T08:00:00.000Z' },
    ],
    resources: [{ id: 'resource-pomelo', name: '文旦果園與農事經驗', type: 'space', description: '果園場域、季節農事與地方栽培知識。', partner: '木日光', availability: '產季預約' }],
    drafts: [{ id: 'draft-pomelo', title: '果園裡的一餐', resourceIds: ['resource-pomelo'], description: '以當季果物與農家餐桌串連的共食體驗。', stage: 'feedback' }],
    pilotSessions: [{ id: 'pilot-pomelo', draftId: 'draft-pomelo', date: '2026-10-18', capacity: 8, label: '試辦' }],
    feedback: [{ id: 'feedback-pomelo', draftId: 'draft-pomelo', author: '試辦旅人 A', rating: 5, text: '希望多留一點時間認識果園。' }],
    changeLog: [{ id: 'change-pomelo-1', draftId: 'draft-pomelo', actorId: 'operator-demo', at: '2026-10-14T08:00:00.000Z', note: '依據試辦回饋增加果園導覽時間。' }],
  }
}
