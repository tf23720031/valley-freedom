import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CalendarDays, MapPin } from 'lucide-react'
import { districts, getPlaceById, type Place } from '../../domain/districts'
import { addPlaceToItinerary } from '../../domain/placeItinerary'
import { dispatch } from '../../store/appStore'
import { useNotify } from '../../components/Feedback'
import { useAppState } from '../../store/AppStateProvider'
import { recordPlaceStamp, ratePlace } from '../../domain/routeRewards'

function PlaceCard({ place }: { place: Place }) {
  return <Link to={`/places/${place.id}`} className="place-card">
    <div className="place-card-photo"><img src={place.photo} alt=""/><span>氛圍參考照・非場域實景</span></div>
    <div className="place-card-body"><span>{place.regionName}</span><h3>{place.name}</h3><p>{place.verifiedFacts[0] ?? '候選參考名單，場域資料待查證。'}</p><b>查看已確認資訊 <ArrowRight size={16}/></b></div>
  </Link>
}

export function RegionalExplorePage() {
  const { placeId, regionId } = useParams()
  const notify = useNotify(), navigate = useNavigate()
  const state = useAppState()
  const [date, setDate] = useState('2026-11-16')
  const place = placeId ? getPlaceById(placeId) : undefined

  if (placeId) {
    if (!place) return <section className="page-section editorial-wrap"><h1>找不到這個場域</h1><Link to="/explore">返回沿著花東走</Link></section>
    const bookingLabel = place.bookingChannel === 'public' ? '有公開預約頁' : place.bookingChannel === 'not-listed' ? '目前未列公開預約管道' : '預約管道待確認'
    const add = () => {
      const result = dispatch((current) => addPlaceToItinerary(current, place.id, date))
      notify(result.ok ? '已加入自由行程草稿，尚未向場域預約。' : result.error.message, result.ok ? 'success' : 'error')
    }
    const searchNearby = () => navigate(`/companions?destination=${encodeURIComponent(place.regionName)}&date=${date}&startTime=14%3A00&duration=90&language=英文&service=language-support`)
    const stamped = state.placeStamps.some((stamp) => stamp.placeId === place.id)
    const placeRatings = state.placeRatings.filter((item) => item.placeId === place.id)
    const routePlaces = districts.find((region) => region.id === place.regionId)?.places ?? []
    const nextPlace = routePlaces[(routePlaces.findIndex((item) => item.id === place.id) + 1) % routePlaces.length]
    const connectedOffers = state.partnerLinks.filter((link) => link.active && (link.anchorPlaceId === place.id || link.smallPlaceId === place.id))
    const stampVisit = () => { const result = dispatch((current) => recordPlaceStamp(current, place.id)); notify(result.ok ? result.value.routeRewards.length > state.routeRewards.length ? '已記錄示意場域紀錄，NT$200 旅伴折抵已解鎖。' : '已記錄示意場域紀錄。' : result.error.message, result.ok ? 'success' : 'error') }
    const submitRating = (rating: number) => { const result = dispatch((current) => ratePlace(current, place.id, rating)); notify(result.ok ? '已保存本裝置的示意評分。' : result.error.message, result.ok ? 'success' : 'error') }
    return <section className="place-detail editorial-wrap">
      <Link className="back-link" to={`/explore/${place.regionId}`}><ArrowLeft size={16}/>返回{place.regionName}</Link>
      <div className="place-detail-hero"><img src={place.photo} alt=""/><span>氛圍參考照・非場域實景</span></div>
      <div className="place-detail-copy"><span className="eyebrow">{place.regionName} / 候選參考場域</span><h1>{place.name}</h1>
        <p className="place-region-note"><MapPin size={17}/>{place.regionName}（依本次提供的區域名單分類；精確位置以已查證資料為準）</p>
        <div className="place-facts"><h2>已確認資訊</h2>{place.verifiedFacts.length ? <ul>{place.verifiedFacts.map((fact) => <li key={fact}>{fact}</li>)}</ul> : <p>目前沒有足夠來源確認場域簡介與精確地點，資料待查證。</p>}
          {place.address && <p><b>公開地點資訊：</b>{place.address}</p>}
          <p><b>活動資訊：</b>{place.activityInfo.length ? place.activityInfo.join('；') : '尚未查證，不列活動或場次。'}</p>
          <p><b>公開預約管道：</b>{place.bookingUrl ? <a href={place.bookingUrl} target="_blank" rel="noreferrer">前往公開頁面 <ArrowRight size={14}/></a> : bookingLabel}</p>
          <p><b>公開資料中的體驗服務：</b>{place.experienceService === 'publicly-described' ? '有公開來源介紹相關活動或體驗方向；目前是否開放報名仍須確認。' : '尚未查證，不視為有提供體驗。'}</p><p><b>旅伴服務：</b>{place.companionService === 'confirmed' ? '有公開來源確認。' : '尚未查證該場域提供旅伴服務。平台旅伴由獨立人員承接。'}</p><p><b>平台合作：</b>尚未取得合作同意。</p>
          <p className="verification-state">資料查核狀態：{place.verificationStatus === 'verified' ? '公開來源已核對' : place.verificationStatus === 'partial' ? '部分資訊已核對，細節待查' : '候選資料待查證'}</p>
          {place.sources.length > 0 && <div className="place-source-list"><b>資料來源</b>{place.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} <ArrowRight size={13}/></a>)}</div>}
        </div>
        <div className="place-itinerary-actions"><label className="field-label"><span><CalendarDays size={16}/>加入哪一天</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)}/></label><button className="button button-primary" onClick={add}>加入我的行程</button><button className="button button-outline" onClick={searchNearby}>在這附近找旅伴</button></div>
        <section className="place-stamp-panel"><div><span className="eyebrow">造訪紀錄 / 展示用</span><h2>{stamped ? '這個場域已記錄' : '到訪後留下路線紀錄'}</h2><p>原型以手動按鈕模擬消費或體驗完成，沒有掃碼驗證或店家核銷。不同場域累積兩枚，可解鎖旅伴折抵示意券。</p></div><button className="button button-primary" disabled={stamped} onClick={stampVisit}>{stamped ? '已取得示意紀錄' : '模擬完成消費／體驗並集章'}</button></section>
        {stamped && nextPlace && <section className="next-place-note"><span className="eyebrow">下一站推薦 / 同路線示意</span><b>{nextPlace.name}</b><p>{nextPlace.verifiedFacts[0] ?? '候選參考場域，資訊待查證。'}後續活動與營業資訊請先向場域確認。</p><Link to={`/places/${nextPlace.id}`}>查看下一站 <ArrowRight size={15}/></Link></section>}
        {connectedOffers.length > 0 && <section className="next-place-note"><span className="eyebrow">店家串連方案 / 示意</span>{connectedOffers.map((link) => <div key={link.id}><b>{districts.flatMap((region) => region.places).find((item) => item.id === (link.anchorPlaceId === place.id ? link.smallPlaceId : link.anchorPlaceId))?.name}</b><p>{link.description}；目前未取得合作同意，優惠尚未生效。</p></div>)}</section>}
        <section className="place-rating"><div><h2>路線評分</h2><p>{placeRatings.length ? `本裝置展示平均 ${ (placeRatings.reduce((sum, item) => sum + item.rating, 0) / placeRatings.length).toFixed(1) } 分・${placeRatings.length} 則` : '目前尚無展示評分'}</p></div><div aria-label="為場域評分">{[1,2,3,4,5].map((rating) => <button key={rating} aria-label={`${rating} 分`} onClick={() => submitRating(rating)}>{rating}</button>)}</div></section>
      </div>
    </section>
  }

  const regions = regionId ? districts.filter((region) => region.id === regionId) : districts
  return <section className="regional-explore editorial-wrap">
    <header className="regional-intro"><span className="eyebrow">VALLEY FREEDOM / PLACE JOURNAL</span><h1>沿著花東走</h1><p>四條路線，17 個候選場域。先看地方，再決定怎麼走。</p><small>名單為旅客探索參考，不代表平台已合作、可預約或提供體驗。場域資訊逐筆標示查證狀態。</small><Link className="button button-outline explore-map-entry" to="/explore/map">在花東地圖上探索 <ArrowRight size={16}/></Link></header>
    {!regionId && <nav className="region-index" aria-label="花東地區">{districts.map((region, index) => <a key={region.id} href={`#${region.id}`}><span>0{index + 1}</span>{region.name}</a>)}</nav>}
    <div className="region-collection">{regions.map((region, index) => <section className={`region-section region-layout-${index}`} id={region.id} key={region.id}>
      <div className="region-heading"><img src={region.photo} alt=""/><span className="region-road">{region.road}</span><div><span>0{districts.indexOf(region) + 1} / 花東地區</span><h2>{region.name}</h2><p>{region.intro}</p></div></div>
      <aside className="region-planning"><span className="eyebrow">ROUTE NOTES / 規劃示意</span><div><b>建議停留</b><span>{region.planning.stay}</span></div><div><b>交通提示</b><span>{region.planning.transport}</span></div><div><b>路線氣質</b><span>{region.planning.mood}</span></div><small>停留時間為展示用規劃建議，交通、場域開放資訊請出發前自行確認。</small></aside>
      <div className="region-place-list">{region.places.map((item) => <PlaceCard key={item.id} place={item}/>)}</div>
      {regionId && <Link className="back-link" to="/explore"><ArrowLeft size={16}/>看全部路線</Link>}
    </section>)}</div>
  </section>
}
