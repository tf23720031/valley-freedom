import type { AppState, Companion, Experience, Role } from './types'
import { experiencePhotoSet, photos } from './photoSources'
import { districts } from './districts'
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
export function createInitialState(): AppState {
  const experiences: Experience[] = experienceSeed.map(([title, category, description, durationMinutes, price], index) => ({
    id: `experience-${index + 1}`, title, category, description, location: index % 2 ? '花蓮縣瑞穗鄉' : '木日光文旦驛站', meetingPoint: '木日光文旦驛站入口', durationMinutes, price,
    image: experiencePhotoSet[index], tags: [category, '瑞穗'], featured: index < 3, published: true, isDemo: true,
  }))
  const sessions = experiences.slice(0, 7).map((experience, index) => ({ id: index === 0 ? 'session-pomelo-1' : `session-${index + 1}`, experienceId: experience.id, date: '2026-11-14', startTime: index % 2 ? '14:00' : '09:30', endTime: index % 2 ? '16:00' : '11:30', capacity: index === 0 ? 10 : 12, pilot: false }))
  const companions: Companion[] = [
    { id: 'companion-lin', name: '林雨禾', avatar: photos.personLin, bio: '在瑞穗生活的地方工作者，熟悉舞鶴台地與農村日常。喜歡陪旅人慢慢走、把問題說清楚。', serviceAreas: ['瑞穗', '舞鶴', '玉里'], languages: ['中文', '英文'], services: ['companionship', 'language-support', 'local-information'], qualifications: ['地方文化培訓（示意）'], restrictions: ['不提供依法須資格的導覽、載客接送或高風險活動'], interests: ['農村日常', '地方飲食', '慢步行'], ratePerHour: 900, availability: [{ id: 'slot-lin-1', date: '2026-11-15', startTime: '13:00', endTime: '18:00' }, { id: 'slot-lin-2', date: '2026-11-16', startTime: '09:00', endTime: '16:00' }], demo: true },
    { id: 'companion-chen', name: '陳以安', avatar: photos.personChen, bio: '長住瑞穗的雙語活動協作者，擅長現場溝通與活動流程支援。', serviceAreas: ['瑞穗', '富里'], languages: ['中文', '英文', '日文'], services: ['companionship', 'event-support', 'language-support'], qualifications: ['活動安全訓練（示意）'], restrictions: ['不承接專業導覽、交通接送及水域或高風險活動'], interests: ['活動協作', '地方工藝', '雙語交流'], ratePerHour: 1100, availability: [{ id: 'slot-chen-1', date: '2026-11-15', startTime: '12:00', endTime: '18:00' }, { id: 'slot-chen-2', date: '2026-11-16', startTime: '12:00', endTime: '18:00' }], demo: true },
    { id: 'companion-wu', name: '吳映秋', avatar: photos.personWu, bio: '返鄉投入地方活動協作，熟悉手作場域、聚落生活與親子同行需求。', serviceAreas: ['瑞穗', '光復'], languages: ['中文'], services: ['companionship', 'event-support', 'local-information'], qualifications: [], restrictions: ['不提供導遊、接送或需專業資格的活動服務'], interests: ['手作體驗', '親子同行', '聚落生活'], ratePerHour: 800, availability: [{ id: 'slot-wu-1', date: '2026-11-15', startTime: '09:00', endTime: '17:00' }], demo: true },
    { id: 'companion-huang', name: '黃子晴', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&h=700&q=85', bio: '在瑞穗協助地方活動與餐桌交流，擅長整理需求、協助中英文溝通。', serviceAreas: ['瑞穗', '玉里'], languages: ['中文', '英文'], services: ['companionship', 'event-support', 'language-support'], qualifications: ['活動接待研習（示意）'], restrictions: ['不提供專業導覽、載客接送或高風險活動'], interests: ['地方餐桌', '市集活動', '雙語交流'], ratePerHour: 1000, availability: [{ id: 'slot-huang-1', date: '2026-11-15', startTime: '10:00', endTime: '18:00' }], demo: true },
    { id: 'companion-zhao', name: '趙承佑', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&h=700&q=85&sat=-55', bio: '熟悉縱谷小鎮與單車補給點，可協助行程溝通和一般同行安排。', serviceAreas: ['瑞穗', '富里', '玉里'], languages: ['中文', '英文'], services: ['companionship', 'language-support', 'local-information'], qualifications: ['旅客接待基礎課程（示意）'], restrictions: ['不提供自行車帶隊、載客接送或專業導覽'], interests: ['單車旅行', '小鎮咖啡', '鐵道'], ratePerHour: 850, availability: [{ id: 'slot-zhao-1', date: '2026-11-15', startTime: '12:00', endTime: '18:00' }], demo: true },
    { id: 'companion-lin-yi', name: '林以柔', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&h=700&q=85', bio: '返鄉投入農村共學，喜歡分享季節食材、聚落日常與親子友善資訊。', serviceAreas: ['瑞穗', '光復'], languages: ['中文', '英文', '日文'], services: ['companionship', 'language-support', 'local-information'], qualifications: ['地方交流工作坊（示意）'], restrictions: ['不提供專業導覽、醫療照護或接送服務'], interests: ['農村生活', '親子同行', '季節食材'], ratePerHour: 950, availability: [{ id: 'slot-lin-yi-1', date: '2026-11-15', startTime: '09:00', endTime: '16:30' }], demo: true },
    { id: 'companion-yang', name: '楊柏翰', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=700&q=85&sat=-40', bio: '長住花蓮南區，熟悉火車轉乘與小鎮生活，可協助旅客釐清移動安排。', serviceAreas: ['瑞穗', '玉里', '富里'], languages: ['中文', '英文'], services: ['companionship', 'language-support', 'local-information'], qualifications: ['旅客服務訓練（示意）'], restrictions: ['不代訂交通、不提供載客接送或專業導覽'], interests: ['火車旅行', '小鎮散步', '地方選物'], ratePerHour: 900, availability: [{ id: 'slot-yang-1', date: '2026-11-15', startTime: '13:00', endTime: '19:00' }], demo: true },
    { id: 'companion-lin-taitung', name: '林知夏', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=700&q=85', bio: '在臺東市參與地方活動企劃，熟悉市區步行路線、交通轉乘與小店。', serviceAreas: ['臺東市', '卑南', '知本'], languages: ['中文', '英文'], services: ['companionship', 'language-support', 'local-information'], qualifications: ['地方活動接待研習（示意）'], restrictions: ['不提供專業導覽、載客接送或高風險活動'], interests: ['地方市集', '咖啡店', '鐵道旅行'], ratePerHour: 950, availability: [{ id: 'slot-lin-taitung-1', date: '2026-11-15', startTime: '10:00', endTime: '18:00' }], demo: true },
    { id: 'companion-hsu-south', name: '許柏勳', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&h=700&q=85&sat=-25', bio: '熟悉太麻里到大武一帶的補給點與火車班次，可協助安排一般同行。', serviceAreas: ['太麻里', '大武', '南迴'], languages: ['中文', '英文'], services: ['companionship', 'language-support', 'local-information'], qualifications: ['旅客服務基礎訓練（示意）'], restrictions: ['不提供登山帶隊、載客接送或專業導覽'], interests: ['海岸散步', '火車旅行', '在地食堂'], ratePerHour: 850, availability: [{ id: 'slot-hsu-south-1', date: '2026-11-15', startTime: '10:00', endTime: '18:00' }], demo: true },
  ]
  return {
    schemaVersion: 4, authenticated: false, rememberLogin: false, role: 'traveler' as Role, travelerId: 'traveler-demo', youthId: 'youth-demo', companionId: 'companion-lin', experiences, sessions, bookings: [
      { id: 'booking-pending', sessionId: 'session-pomelo-1', experienceId: 'experience-1', travelerId: 'traveler-seed', partySize: 2, travelerCount: 2, status: 'pending', createdAt: '2026-10-10T10:00:00.000Z' },
      { id: 'booking-confirmed', sessionId: 'session-pomelo-1', experienceId: 'experience-1', travelerId: 'traveler-other', partySize: 1, travelerCount: 1, status: 'confirmed', createdAt: '2026-10-10T10:00:00.000Z' },
      { id: 'booking-cancelled', sessionId: 'session-pomelo-1', experienceId: 'experience-1', travelerId: 'traveler-other', partySize: 2, travelerCount: 2, status: 'cancelled', createdAt: '2026-10-10T10:00:00.000Z', cancelReason: '行程異動', cancelSource: 'traveler', cancelledAt: '2026-10-10T11:00:00.000Z' },
      { id: 'booking-completed', sessionId: 'session-pomelo-1', experienceId: 'experience-1', travelerId: 'traveler-other', partySize: 1, travelerCount: 1, status: 'completed', createdAt: '2026-10-01T10:00:00.000Z' },
    ], itineraries: [], companions, serviceRequests: [], companionDemands: [], demandApplications: [], shopProfile: { id: 'shop-muri', name: '木日光文旦驛站', introduction: '以鶴岡文旦柚為主題，提供農事導覽、食農教育、DIY與餐飲等體驗，內容依季節與預約安排。', address: '花蓮縣瑞穗鄉北一路121號', contact: '', website: 'https://www.838.url.tw/index.html', region: '花東縱谷・瑞穗' },
    placeStamps: [], placeRatings: [], routeRewards: [], partnerLinks: [], subsidies: [], placeMetrics: districts.flatMap((region) => region.places.map((place, index) => ({ placeId: place.id, size: index === 0 && region.id !== 'valley-9' ? 'large' as const : 'small' as const, lastMonthVisits: 20 + index * 13, thisMonthVisits: Math.round((20 + index * 13) * (place.id === 'rice-like-fu' ? .88 : region.id === 'valley-9' && index === 0 ? 3.5 : 1.15)), views: 250 + index * 71, qrScans: 42 + index * 9, conversions: 12 + index * 3, monthlySubsidyLimit: 1 }))),
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
