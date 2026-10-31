import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Route, Sparkles } from 'lucide-react'
import { districts, getPlaceById } from '../../domain/districts'
import { useAppState } from '../../store/AppStateProvider'

const yByRegion: Record<string, number> = { taroko: 18, 'coast-11': 40, 'valley-9': 57, 'south-link': 83 }
const eastXByRegion: Record<string, number> = { taroko: 70, 'coast-11': 77, 'valley-9': 70, 'south-link': 78 }
const positions = districts.flatMap((region) => region.places.map((place, index) => ({ place, x: eastXByRegion[region.id] + (index % 2 ? 3 : -3), y: yByRegion[region.id] + (index - (region.places.length - 1) / 2) * 2.3 })))

export function RouteMapPage() {
  const state = useAppState()
  const [selectedId, setSelectedId] = useState(positions[0]?.place.id ?? '')
  const [area, setArea] = useState('瑞穗')
  const selected = getPlaceById(selectedId)
  const nearest = useMemo(() => {
    const sameRoute = districts.find((region) => region.name.includes(area) || (area === '東海岸' && region.id === 'coast-11') || (area === '太魯閣' && region.id === 'taroko') || (area === '南迴' && region.id === 'south-link'))
    return sameRoute?.places ?? (area === '花東全區' ? districts.flatMap((region) => region.places) : districts.find((region) => region.id === 'valley-9')?.places ?? [])
  }, [area])
  const stamps = new Set(state.placeStamps.map((stamp) => stamp.placeId))
  return <main className="route-map-page editorial-wrap">
    <header className="route-map-heading"><span className="eyebrow"><Route size={16}/> 沿著花東走 / 路線地圖</span><h1>先選一段路，再慢慢逛。</h1><p>地圖標記依四條路線概略排列，不代表精確地址或實際距離。</p></header>
    <div className="route-map-layout">
      <section className="taiwan-map-wrap" aria-label="臺灣東部推薦場域概略地圖">
        <div className="map-caption"><span>TAIWAN · EAST</span><b>花東候選場域</b><small>路線位置示意</small></div>
        <img className="taiwan-silhouette" src="/images/taiwan-map-transparent.png" alt="臺灣縣市輪廓地圖；花東地區標記為概略位置" />
        {positions.map(({ place, x, y }, index) => <button key={place.id} className={`map-pin ${selectedId === place.id ? 'is-selected' : ''} ${stamps.has(place.id) ? 'is-stamped' : ''}`} style={{ left: `${x}%`, top: `${y}%` }} onClick={() => setSelectedId(place.id)} aria-label={`查看${place.name}`} title={place.name}><span>{index + 1}</span></button>)}
        <div className="map-legend"><span><i/>推薦場域</span><span><i className="stamped-dot"/>已集示意章</span></div>
      </section>
      <aside className="map-place-panel">
        {selected && <><span className="eyebrow">{selected.regionName} / 候選名單</span><h2>{selected.name}</h2><p>{selected.verifiedFacts[0] ?? '目前是候選參考名單；場域活動、地址及預約方式尚待查證。'}</p><dl><div><dt>地點資料</dt><dd>{selected.address ?? '尚未查得可核對地址'}</dd></div><div><dt>可確認服務</dt><dd>{selected.activityInfo[0] ?? '尚未查證，不推定提供體驗或服務'}</dd></div><div><dt>合作狀態</dt><dd>尚未取得平台合作同意</dd></div></dl><Link className="text-link" to={`/places/${selected.id}`}>查看場域資料 <ArrowRight size={16}/></Link></>}
        <div className="nearby-box"><span className="eyebrow"><MapPin size={15}/>附近推薦</span><h3>依路線區域為你排序</h3><label>目前規劃位置<select value={area} onChange={(event) => setArea(event.target.value)}><option>瑞穗</option><option>東海岸</option><option>太魯閣</option><option>南迴</option><option>花東全區</option></select></label><ul>{nearest.slice(0, 4).map((place, index) => <li key={place.id}><button onClick={() => setSelectedId(place.id)}><span>0{index + 1}</span><b>{place.name}</b><small>{place.regionName}・路線相近排序</small></button></li>)}</ul><small className="fine-print">尚無可用地址座標，這是同區域／同路線推薦示意，不表示導航距離。</small></div>
      </aside>
    </div>
    <section className="route-reward-band"><div><span className="eyebrow"><Sparkles size={15}/> 路線集章展示</span><h2>走訪兩個不同場域，解鎖旅伴折抵。</h2><p>目前紀錄 {state.placeStamps.length} 個場域；達兩個後可取得 NT$200 旅伴服務折抵示意券。</p></div><div className="reward-count"><b>{Math.min(state.placeStamps.length, 2)}<small> / 2</small></b><span>已累積場域</span><Link className="button button-primary" to="/companions">找一位旅伴 <ArrowRight size={16}/></Link></div></section>
    <section className="route-benefit-note"><h2>地方回饋構想</h2><p>綠色點數、信用卡紅利、企業採購與員工優惠目前僅為合作提案方向，尚未串接銀行或企業系統，也未取得店家合作同意。</p><div><span>店家互相推薦下一站</span><span>指定路線集章內容</span><span>企業消費回饋提案</span></div></section>
  </main>
}
