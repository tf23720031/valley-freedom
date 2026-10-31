export type RegionId = 'taroko' | 'coast-11' | 'valley-9' | 'south-link'
export type VerificationStatus = 'verified' | 'partial' | 'pending'
export type BookingChannel = 'public' | 'not-listed' | 'unknown'
export interface PlaceCoordinates {
  latitude: number
  longitude: number
  sourceLabel: string
  sourceUrl: string
  locationNote?: string
}
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
  coordinates?: PlaceCoordinates
}
export interface Region { id: RegionId; name: string; road: string; intro: string; photo: string; planning: { stay: string; transport: string; mood: string }; places: Place[] }

const candidate = (id: string, name: string, regionId: RegionId, regionName: string, photo: string): Place => ({
  id, name, regionId, regionName, photo, verificationStatus: 'pending', verifiedFacts: [], activityInfo: [], bookingChannel: 'unknown', partnershipStatus: 'not-confirmed', companionService: 'not-confirmed', experienceService: 'not-confirmed', photoIsPlacePhoto: false, sources: [],
})

const googleMapSource = (name: string, query = name) => ({ label: 'Google 地圖公開地點資料', url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` })
const coordinates = (latitude: number, longitude: number, name: string, locationNote?: string): PlaceCoordinates => ({
  latitude, longitude, sourceLabel: 'Google 地圖公開地點資料', sourceUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`, locationNote,
})

const taroko: Region = {
  id: 'taroko', name: '花蓮太魯閣', road: 'HUALIEN · TAROKO', intro: '山線聚落與部落生活。名單來自旅客提供的候選參考。', photo: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1500&q=85', planning: { stay: '半日－1 日｜規劃示意', transport: '大眾運輸與自駕接駁需自行確認｜交通規劃提示', mood: '峽谷地景、山線聚落、慢步行讀地方' }, places: [
    { ...candidate('practice-song', '練習曲', 'taroko', '花蓮太魯閣', 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'partial', verifiedFacts: ['練習曲書店位於花蓮縣新城鄉信義路。'], address: '花蓮縣新城鄉新城村信義路 252 號', activityInfo: ['目前可確認為書店；活動、服務與預約方式未確認。'], sources: [{ label: '花蓮縣政府青年發展中心空間資料', url: 'https://startup.sme.gov.tw/home/modules/rmap/space_detail.php?sId=518' }, googleMapSource('練習曲書店 花蓮新城信義路252號')], coordinates: coordinates(24.1291036, 121.6505854, '練習曲書店 花蓮新城信義路252號') },
    { ...candidate('big-bamboo', '大竹子走部落', 'taroko', '花蓮太魯閣', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'partial', verifiedFacts: ['花蓮縣秀林鄉加灣部落的部落旅遊品牌，公開介紹以部落生活、工藝與農業為主。'], address: '花蓮縣秀林鄉景美村加灣 6 之 4 號', activityInfo: ['公開介紹提及「跟著部落獵人上山生活」遊程；目前場次與預約條件待業者確認。'], bookingChannel: 'not-listed', experienceService: 'publicly-described', sources: [{ label: '花東縱谷國家風景區管理處', url: 'https://www.erv-nsa.gov.tw/zh-tw/travel/tribes' }, { label: '台灣地方創生基金會', url: 'https://twrr.org.tw/zh-TW/partner/325' }, googleMapSource('大竹子走部落 花蓮秀林加灣6之4號')], coordinates: coordinates(24.0713277, 121.6081534, '大竹子走部落 花蓮秀林加灣6之4號') },
  ],
}
const coast: Region = {
  id: 'coast-11', name: '東海岸台 11 線', road: 'EAST COAST · ROUTE 11', intro: '沿著海岸公路，收進港口、餐桌與海的日常。', photo: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1500&q=85', planning: { stay: '1－2 日｜規劃示意', transport: '沿線接駁與班次需自行確認｜交通規劃提示', mood: '海岸公路、漁港餐桌、看潮與停留' }, places: [
    { ...candidate('chenggong-bank', '成功海銀行', 'coast-11', '東海岸台 11 線', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'partial', verifiedFacts: ['公開資料介紹其以餐飲呈現成功漁港與阿美族潮間帶文化。'], address: '臺東縣成功鎮中華路 66 號', activityInfo: ['可確認為餐飲及地方文化敘事場域；目前菜單、營業與預約狀態待確認。'], bookingChannel: 'not-listed', sources: [{ label: '成功海銀行官方網站', url: 'https://chenggongculturebank.com/about/' }, googleMapSource('成功海銀行 臺東成功鎮中華路66號')], coordinates: coordinates(23.1004993, 121.3784724, '成功海銀行 臺東成功鎮中華路66號') },
    { ...candidate('new-pacific-1', '新太平洋一號店', 'coast-11', '東海岸台 11 線', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'verified', verifiedFacts: ['交通部觀光署與花蓮觀光資料均列出此店地址。'], address: '花蓮縣豐濱鄉靜浦村靜浦 8 之 1 號', activityInfo: ['公開旅遊資料列為地方店家；目前商品、活動與預約服務待店家確認。'], sources: [{ label: '交通部觀光署台灣觀光資訊網', url: 'https://www.taiwan.net.tw/m1.aspx?id=A12-00418&sNo=0001124' }, { label: '花蓮觀光資訊網', url: 'https://hualien.travel/zh-tw/attraction/295/' }], coordinates: { latitude: 23.466666, longitude: 121.48782, sourceLabel: '交通部觀光署公開地點座標', sourceUrl: 'https://www.taiwan.net.tw/m1.aspx?id=A12-00418&sNo=0001124' } },
    { ...candidate('lookout-cafe', '眺港咖啡', 'coast-11', '東海岸台 11 線', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'partial', verifiedFacts: ['臺東縣成功鎮的咖啡場域；縣府藝文平台曾介紹其位於新港漁港旁老屋。'], address: '臺東縣成功鎮中山東路 57 號', activityInfo: ['公開資料可確認為咖啡場域，營業與預約資訊待確認。'], bookingChannel: 'not-listed', sources: [{ label: '臺東縣政府文化處', url: 'https://culture.taitung.gov.tw/activity/2024%E8%87%BA%E6%9D%B1%E8%97%9D%E6%96%87%E8%B7%AF%E7%B7%9A%EF%BC%8D%E6%B5%B7%E5%B2%B8%E7%B7%9A' }, { label: '東部海岸國家風景區管理處', url: 'https://www.eastcoast-nsa.gov.tw/teclandart/zh-tw/studio/studio/57' }, googleMapSource('眺港café 臺東成功鎮中山東路57號')], coordinates: coordinates(23.0999454, 121.3785514, '眺港café 臺東成功鎮中山東路57號') },
    { ...candidate('liay-kitchen', 'Liay 里艾廚房', 'coast-11', '東海岸台 11 線', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'partial', verifiedFacts: ['東海岸國家風景區資料介紹其為靜浦部落的料理場域，使用當季在地食材。'], address: '花蓮縣豐濱鄉靜浦村 338 之 1 號（地圖商家地址；請出發前再次確認）', activityInfo: ['官方旅遊資料曾刊載料理及預約資訊；現行預約條件需再次確認。'], bookingChannel: 'not-listed', sources: [{ label: '東部海岸國家風景區管理處', url: 'https://www.eastcoast-nsa.gov.tw/file/11038/' }, googleMapSource('里艾廚房與人魚海 花蓮豐濱靜浦338之1號')], coordinates: coordinates(23.450182, 121.4965929, '里艾廚房與人魚海 花蓮豐濱靜浦338之1號') },
    { ...candidate('jinling-hao', '晉領號', 'coast-11', '東海岸台 11 線', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'partial', verifiedFacts: ['Google 地圖列有成功港邊的賞鯨服務點。'], address: '臺東縣成功鎮港邊路 1 之 5 號', activityInfo: ['為海上賞鯨服務；船舶位置會移動，地圖點標示業者服務／出發處，不代表船舶位置。'], bookingChannel: 'not-listed', sources: [googleMapSource('晉領 賞鯨 臺東成功港邊路1之5號')], coordinates: coordinates(23.0979649, 121.3829633, '晉領 賞鯨 臺東成功港邊路1之5號', '此為岸上服務／出發點；船舶航行位置會移動。') },
    { ...candidate('bamboo-lake', '竹湖山居', 'coast-11', '東海岸台 11 線', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'verified', verifiedFacts: ['官方網站列示其位於臺東縣長濱鄉竹湖村。'], address: '臺東縣長濱鄉竹湖村 1 鄰 41 號', activityInfo: ['官方網站可確認為住宿場域；入住與預約資訊以官方公告為準。'], sources: [{ label: '竹湖山居官方網站', url: 'https://www.juhu.com.tw/zh-tw/about' }, googleMapSource('竹湖山居 臺東長濱竹湖村41號')], coordinates: { latitude: 23.3027169, longitude: 121.4196416, sourceLabel: 'Google 地圖公開地點資料', sourceUrl: 'https://www.google.com/maps/search/?api=1&query=%E7%AB%B9%E6%B9%96%E5%B1%B1%E5%B1%85%20%E8%87%BA%E6%9D%B1%E9%95%B7%E6%BF%B1%E7%AB%B9%E6%B9%96%E6%9D%9141%E8%99%9F' } },
  ],
}
const valley: Region = {
  id: 'valley-9', name: '花東縱谷台 9 線', road: 'EAST RIFT VALLEY · ROUTE 9', intro: '田野、山脈、農作與手藝，沿縱谷慢慢走。', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/05_Countryside_of_Taiwan_-_rice_fields_and_mountains_in_Ruisui%2C_Hualien_County%2C_Taiwan.jpg/1280px-05_Countryside_of_Taiwan_-_rice_fields_and_mountains_in_Ruisui%2C_Hualien_County%2C_Taiwan.jpg', planning: { stay: '1－2 日｜規劃示意', transport: '鐵路串聯與站點接駁需自行確認｜交通規劃提示', mood: '縱谷田野、農事體驗、工藝聚落' }, places: [
    { ...candidate('muri-sunshine', '木日光文旦驛站', 'valley-9', '花東縱谷台 9 線', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'verified', verifiedFacts: ['位於花蓮縣瑞穗鄉，台九線 255K 西側。', '公開資料介紹其提供農事導覽與文旦相關 DIY 體驗。'], address: '花蓮縣瑞穗鄉北一路 121 號（官方網站列示）', activityInfo: ['農事導覽、文旦相關 DIY；實際場次與季節供應請以業者公告為準。'], bookingChannel: 'public', bookingUrl: 'https://tour.ibon.com.tw/event/60cae8e93fcfe4449f6cdfc4', experienceService: 'publicly-described', sources: [{ label: '木日光文旦驛站官方網站', url: 'https://www.838.url.tw/index.html' }, { label: '農業部食農教育資訊整合平台', url: 'https://fae.moa.gov.tw/theme_data.php?id=34&theme=field' }, { label: 'ibon 售票預約頁', url: 'https://tour.ibon.com.tw/event/60cae8e93fcfe4449f6cdfc4' }, googleMapSource('木日光文旦驛站 花蓮瑞穗北一路121號')], coordinates: coordinates(23.5002438, 121.3683844, '木日光文旦驛站 花蓮瑞穗北一路121號') },
    { ...candidate('bamboo-symphony', '笙笙不息', 'valley-9', '花東縱谷台 9 線', 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'verified', verifiedFacts: ['官方網站載明其位於花蓮縣富里鄉石牌村，經營竹產業再造與竹林資源循環。'], address: '花蓮縣富里鄉石牌村富北 68 號（官方網站列示）', activityInfo: ['官方網站介紹竹產業、竹製品與課程方向；目前可報名項目及時段待確認。'], bookingChannel: 'not-listed', experienceService: 'publicly-described', sources: [{ label: '笙笙不息官方網站', url: 'https://www.ssbuxii.com.tw/' }, googleMapSource('笙笙不息有限公司 花蓮富里石牌村富北68號')], coordinates: coordinates(23.1941752, 121.2664323, '笙笙不息有限公司 花蓮富里石牌村富北68號') },
    { ...candidate('rice-like-fu', '米粒如福', 'valley-9', '花東縱谷台 9 線', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'partial', verifiedFacts: ['政府觀光資料提及米粒如福在光復糖廠園區內。'], address: '花蓮縣光復鄉光復糖廠園區內（店鋪位置待確認）', activityInfo: ['具體服務、營業與預約資訊待查證；未以舊店址推定新位置。'], sources: [{ label: '交通部觀光署花東縱谷國家風景區管理處', url: 'https://www.erv-nsa.gov.tw/zh-tw/event/news/7113' }, googleMapSource('米粒如福 花蓮光復糖廠') ] },
    { ...candidate('kanasui', '卡那歲工坊', 'valley-9', '花東縱谷台 9 線', 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'partial', verifiedFacts: ['文化部國家文化記憶庫列出其位於臺東縣延平鄉武陵村。'], address: '臺東縣延平鄉武陵村明野路 44 之 2 號', activityInfo: ['公開介紹包含手作、親子旅遊與露營等內容；目前項目與預約條件待確認。'], sources: [{ label: '文化部國家文化記憶庫', url: 'https://tcmb.culture.tw/zh-tw/detail?id=315138&indexCode=Culture_Organization' }, { label: '臺東慢食旅遊', url: 'https://ttstylefood-travel.org/portfolio-item/%E5%8D%A1%E9%82%A3%E6%AD%B2%E5%B7%A5%E4%BD%9C%E5%9D%8A/' }, googleMapSource('台東卡那歲親子旅遊住宿手作DIY')], coordinates: coordinates(22.9695971, 121.0980054, '台東卡那歲親子旅遊住宿手作DIY 延平鄉') },
  ],
}
const south: Region = {
  id: 'south-link', name: '臺東南迴', road: 'TAITUNG · SOUTH LINK', intro: '把山海之間的小鎮與地方工作者，留給下一段旅程。', photo: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1500&q=85', planning: { stay: '1 日以上｜規劃示意', transport: '鐵路班次與在地接駁需自行確認｜交通規劃提示', mood: '山海交界、小鎮日常、青年工作者故事' }, places: [
    { ...candidate('inapayan', 'Sinapayan 青年工作站', 'south-link', '臺東南迴', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'partial', verifiedFacts: ['公開資料確認其為金峰鄉正興部落的青年工作站與旅人交流空間。'], address: '臺東縣金峰鄉正興村（公開地圖未列街道地址）', activityInfo: ['公開介紹其作為青年聚會、文化學習與接待旅人交流的場域；未確認付費活動或預約服務。'], sources: [{ label: '原住民族文化事業基金會', url: 'https://www.ipcf.org.tw/zh-/News/Detail?newsId=25071412215649356' }, { label: '臺東縣政府公告（提及 sinapayan 青年工作站）', url: 'https://taimali.gov.tw/home/attachments/article/4619/%E3%80%90%E5%8D%94%E5%8A%A9%E5%85%AC%E5%91%8A%E3%80%91%E8%87%BA%E6%9D%B1%E7%B8%A3%E9%87%91%E5%B3%B0%E9%84%89%E8%8C%B2%E8%A8%82%E6%96%BC113%E5%B9%B46%E6%9C%8829%E6%97%A5%28%E6%98%9F%E6%9C%9F%E5%85%AD%29%E5%81%87%E5%A4%A7%E7%8E%8B%E5%9C%8B%E6%B0%91%E5%B0%8F%E5%AD%B8%E8%BE%A6%E7%90%86%E3%80%8C113%E5%B9%B4%E8%87%BA%E6%9D%B1%E7%B8%A3%E9%87%91%E9%BB%83%E5%B0%8F%E7%B1%B3%E5%B3%B0%E6%94%B6%E7%9B%83%E6%A1%8C%E7%90%83%E9%8C%A6%E6%A8%99%E8%B3%BD%E3%80%8D%E6%B4%BB%E5%8B%95.pdf' }, googleMapSource('Sinapayan青年工作站 臺東金峰鄉正興村')], coordinates: { latitude: 22.6034207, longitude: 120.9986272, sourceLabel: 'Google 地圖相同名稱公開地點', sourceUrl: 'https://www.google.com/maps/search/?api=1&query=Sinapayan%20%E9%9D%92%E5%B9%B4%E5%B7%A5%E4%BD%9C%E7%AB%99%20%E8%87%BA%E6%9D%B1%E9%87%91%E5%B3%B0%E9%84%89%E6%AD%A3%E8%88%88%E6%9D%91', locationNote: '公開地址僅到正興村；地圖座標依相同名稱的 Google Maps 公開地點，出發前請再確認。' } },
    { ...candidate('fire-studio', '故火工作室', 'south-link', '臺東南迴', 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'partial', verifiedFacts: ['教育部青年發展署介紹其以出版、地方策展與文化交流連結南迴青年、旅人及社群。'], address: '臺東縣南迴地區（公開資料未列固定街道地址）', activityInfo: ['可確認的工作內容包括刊物出版、地方策展及文化交流；旅客活動與預約方式未確認。'], sources: [{ label: '教育部青年發展署青年社區參與行動', url: 'https://changemaker.yda.gov.tw/Lesson?u=782' }, googleMapSource('故火工作室 臺東南迴')] },
    { ...candidate('daxing-mountain', '達興山號', 'south-link', '臺東南迴', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'partial', verifiedFacts: ['Google 地圖公開地點項目可核對名稱與大武鄉南興村地址。'], address: '臺東縣大武鄉南興村 3 號', activityInfo: ['Google 地圖列為餐飲場域；其他體驗或服務未確認。'], sources: [googleMapSource('達興山號 臺東大武南興村3號')], coordinates: coordinates(22.3095291, 120.8897244, '達興山號 臺東大武南興村3號') },
    { ...candidate('vine-your-way', '藤你的樣子', 'south-link', '臺東市（原候選名單列南迴）', 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'partial', verifiedFacts: ['臺東地方工藝介紹將品牌連結至臺東市建和鹿寮青創基地；此地址不在候選清單所列南迴區。'], address: '臺東縣臺東市建和里建和二街 71 巷 30 號（建和鹿寮青創基地；品牌日常服務地點待確認）', activityInfo: ['公開介紹其創作與傳承藤編工藝；目前工作坊場次及報名方式待確認。'], sources: [{ label: '台東製造地方工藝介紹', url: 'https://www.zztaitung.com/?p=22870' }, googleMapSource('建和鹿寮 臺東市建和二街71巷30號')], coordinates: coordinates(22.7200268, 121.0491867, '建和鹿寮 臺東市建和二街71巷30號', '標記為官方介紹所連結的青創基地；不代表品牌固定營業或服務點。') },
    { ...candidate('eight-zero', '捌個零社企', 'south-link', '臺東南迴', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85'), verificationStatus: 'partial', verifiedFacts: ['Google 地圖公開地點項目可核對「捌個零社會企業」在達仁鄉土坂村。'], address: '臺東縣達仁鄉土坂村 69 之 2 號', activityInfo: ['固定地點為社企公開資訊地址；是否有旅客可參與服務、服務時段或預約方式未確認。'], sources: [{ label: '台灣地方創生基金會', url: 'https://www.arksunshine.org/contents/text?id=41' }, googleMapSource('捌個零社會企業 臺東達仁鄉土坂村69之2號')], coordinates: coordinates(22.4519573, 120.8841088, '捌個零社會企業 臺東達仁鄉土坂村69之2號') },
  ],
}

export const districts = [taroko, coast, valley, south]
export const getPlaceById = (id: string) => districts.flatMap((region) => region.places).find((place) => place.id === id)
