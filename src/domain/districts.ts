export type RegionId = 'taroko' | 'coast-11' | 'valley-9' | 'south-link'
export type VerificationStatus = 'verified' | 'partial' | 'pending'
export type BookingChannel = 'public' | 'not-listed' | 'unknown'
export interface Place {
  id: string
  name: string
  regionId: RegionId
  regionName: string
  photo: string
  verificationStatus: VerificationStatus
  verifiedFacts: string[]
  address?: string
  activityInfo: string[]
  bookingChannel: BookingChannel
  bookingUrl?: string
  partnershipStatus: 'not-confirmed'
  companionService: 'confirmed' | 'not-confirmed'
  experienceService: 'publicly-described' | 'not-confirmed'
  photoIsPlacePhoto: false
  sources: Array<{ label: string; url: string }>
}
export interface Region { id: RegionId; name: string; road: string; intro: string; photo: string; places: Place[] }

const candidate = (id: string, name: string, regionId: RegionId, regionName: string, photo: string): Place => ({
  id, name, regionId, regionName, photo, verificationStatus: 'pending', verifiedFacts: [], activityInfo: [], bookingChannel: 'unknown', partnershipStatus: 'not-confirmed', companionService: 'not-confirmed', experienceService: 'not-confirmed', photoIsPlacePhoto: false, sources: [],
})

const taroko: Region = {
  id: 'taroko', name: '花蓮太魯閣', road: 'HUALIEN · TAROKO', intro: '山線聚落與部落生活。名單來自旅客提供的候選參考。', photo: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1500&q=85', places: [
    candidate('practice-song', '練習曲', 'taroko', '花蓮太魯閣', 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=85'),
    { ...candidate('big-bamboo', '大竹子走部落', 'taroko', '花蓮太魯閣', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'partial', verifiedFacts: ['花蓮縣秀林鄉加灣部落的部落旅遊品牌，公開介紹以部落生活、工藝與農業為主。'], activityInfo: ['公開介紹提及「跟著部落獵人上山生活」遊程；目前場次與預約條件待業者確認。'], bookingChannel: 'not-listed', experienceService: 'publicly-described', sources: [{ label: '花東縱谷國家風景區管理處', url: 'https://www.erv-nsa.gov.tw/zh-tw/travel/tribes' }, { label: '台灣地方創生基金會', url: 'https://twrr.org.tw/zh-TW/partner/325' }] },
  ],
}
const coast: Region = {
  id: 'coast-11', name: '東海岸台 11 線', road: 'EAST COAST · ROUTE 11', intro: '沿著海岸公路，收進港口、餐桌與海的日常。', photo: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1500&q=85', places: [
    { ...candidate('chenggong-bank', '成功海銀行', 'coast-11', '東海岸台 11 線', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'partial', verifiedFacts: ['公開資料介紹其以餐飲呈現成功漁港與阿美族潮間帶文化。'], activityInfo: ['可確認為餐飲及地方文化敘事場域；目前菜單、營業與預約狀態待確認。'], bookingChannel: 'not-listed', sources: [{ label: '永豐基金會地方創生案例', url: 'https://www.sinopacfoundation.org.tw/sinopac_found/public/community/47' }] },
    candidate('new-pacific-1', '新太平洋一號店', 'coast-11', '東海岸台 11 線', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=85'),
    { ...candidate('lookout-cafe', '眺港咖啡', 'coast-11', '東海岸台 11 線', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'partial', verifiedFacts: ['臺東縣成功鎮的咖啡場域；縣府藝文平台曾介紹其位於新港漁港旁老屋。'], activityInfo: ['公開資料可確認為咖啡場域，營業與預約資訊待確認。'], bookingChannel: 'not-listed', sources: [{ label: '臺東縣政府文化處', url: 'https://culture.taitung.gov.tw/activity/2024%E8%87%BA%E6%9D%B1%E8%97%9D%E6%96%87%E8%B7%AF%E7%B7%9A%EF%BC%8D%E6%B5%B7%E5%B2%B8%E7%B7%9A' }] },
    { ...candidate('liay-kitchen', 'Liay 里艾廚房', 'coast-11', '東海岸台 11 線', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'partial', verifiedFacts: ['東海岸國家風景區資料介紹其為靜浦部落的料理場域，使用當季在地食材。'], activityInfo: ['官方旅遊資料曾刊載料理及預約資訊；現行預約條件需再次確認。'], bookingChannel: 'not-listed', sources: [{ label: '東部海岸國家風景區管理處', url: 'https://www.eastcoast-nsa.gov.tw/file/11038/' }] },
    candidate('jinling-hao', '晉領號', 'coast-11', '東海岸台 11 線', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85'),
    candidate('bamboo-lake', '竹湖山居', 'coast-11', '東海岸台 11 線', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85'),
  ],
}
const valley: Region = {
  id: 'valley-9', name: '花東縱谷台 9 線', road: 'EAST RIFT VALLEY · ROUTE 9', intro: '田野、山脈、農作與手藝，沿縱谷慢慢走。', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/05_Countryside_of_Taiwan_-_rice_fields_and_mountains_in_Ruisui%2C_Hualien_County%2C_Taiwan.jpg/1280px-05_Countryside_of_Taiwan_-_rice_fields_and_mountains_in_Ruisui%2C_Hualien_County%2C_Taiwan.jpg', places: [
    { ...candidate('muri-sunshine', '木日光文旦驛站', 'valley-9', '花東縱谷台 9 線', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'verified', verifiedFacts: ['位於花蓮縣瑞穗鄉，台九線 255K 西側。', '公開資料介紹其提供農事導覽與文旦相關 DIY 體驗。'], address: '花蓮縣瑞穗鄉北一路 121 號（官方網站列示）', activityInfo: ['農事導覽、文旦相關 DIY；實際場次與季節供應請以業者公告為準。'], bookingChannel: 'public', bookingUrl: 'https://tour.ibon.com.tw/event/60cae8e93fcfe4449f6cdfc4', experienceService: 'publicly-described', sources: [{ label: '木日光文旦驛站官方網站', url: 'https://www.838.url.tw/index.html' }, { label: '瑞穗鄉公所', url: 'https://www.juisui.gov.tw/' }, { label: 'ibon 售票預約頁', url: 'https://tour.ibon.com.tw/event/60cae8e93fcfe4449f6cdfc4' }] },
    { ...candidate('bamboo-symphony', '笙笙不息', 'valley-9', '花東縱谷台 9 線', 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'verified', verifiedFacts: ['官方網站載明其位於花蓮縣富里鄉石牌村，經營竹產業再造與竹林資源循環。'], address: '花蓮縣富里鄉石牌村富北 68 號（官方網站列示）', activityInfo: ['官方網站介紹竹產業、竹製品與課程方向；目前可報名項目及時段待確認。'], bookingChannel: 'not-listed', experienceService: 'publicly-described', sources: [{ label: '笙笙不息官方網站', url: 'https://www.ssbuxii.com.tw/' }] },
    candidate('rice-like-fu', '米粒如福', 'valley-9', '花東縱谷台 9 線', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85'),
    candidate('kanasui', '卡那歲工坊', 'valley-9', '花東縱谷台 9 線', 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1000&q=85'),
  ],
}
const south: Region = {
  id: 'south-link', name: '臺東南迴', road: 'TAITUNG · SOUTH LINK', intro: '把山海之間的小鎮與地方工作者，留給下一段旅程。', photo: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1500&q=85', places: [
    candidate('inapayan', 'inapayan 青年工作站', 'south-link', '臺東南迴', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85'), candidate('fire-studio', '故火工作室', 'south-link', '臺東南迴', 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1000&q=85'), candidate('daxing-mountain', '達興山號', 'south-link', '臺東南迴', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85'), candidate('vine-your-way', '藤你的樣子', 'south-link', '臺東南迴', 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1000&q=85'), candidate('eight-zero', '捌個零社企', 'south-link', '臺東南迴', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85'),
  ],
}

export const districts = [taroko, coast, valley, south]
export const getPlaceById = (id: string) => districts.flatMap((region) => region.places).find((place) => place.id === id)
