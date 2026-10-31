import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Route, Sparkles } from 'lucide-react'
import { districts, getPlaceById, type Place } from '../../domain/districts'
import { useAppState } from '../../store/AppStateProvider'
import { createProjectedPlaces, countyPath, fitTaiwanProjection, mainlandCounties, type TaiwanCountyCollection } from './mapGeometry'

const MAP_WIDTH = 600
const MAP_HEIGHT = 760
const COUNTY_DATASET_URL = 'https://geo.maderaojen.me/en/'
const COUNTY_GOVERNMENT_SOURCE = 'https://github.com/plotdb/pdmaptw'

function mapsDirections(place: Place) {
  const point = place.coordinates
  if (point) return `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`
  return place.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.address}`)}` : undefined
}

export function RouteMapPage() {
  const state = useAppState()
  const [countyData, setCountyData] = useState<TaiwanCountyCollection | null>(null)
  const [mapError, setMapError] = useState(false)
  const [selectedId, setSelectedId] = useState('practice-song')
  const [area, setArea] = useState('瑞穗')
  const selected = getPlaceById(selectedId)
  const places = useMemo(() => districts.flatMap((region) => region.places), [])
  const projection = useMemo(() => countyData ? fitTaiwanProjection(countyData, MAP_WIDTH, MAP_HEIGHT) : null, [countyData])
  const features = useMemo(() => countyData ? mainlandCounties(countyData).features : [], [countyData])
  const projectedPlaces = useMemo(() => countyData ? createProjectedPlaces(countyData, places.map((place) => ({
    id: place.id, name: place.name, longitude: place.coordinates?.longitude, latitude: place.coordinates?.latitude,
  })), MAP_WIDTH, MAP_HEIGHT) : [], [countyData, places])
  const nearest = useMemo(() => {
    const sameRoute = districts.find((region) => region.name.includes(area) || (area === '東海岸' && region.id === 'coast-11') || (area === '太魯閣' && region.id === 'taroko') || (area === '南迴' && region.id === 'south-link'))
    return sameRoute?.places ?? (area === '花東全區' ? places : districts.find((region) => region.id === 'valley-9')?.places ?? [])
  }, [area, places])
  const stamps = new Set(state.placeStamps.map((stamp) => stamp.placeId))
  const selectedSources = selected ? [
    ...selected.sources,
    ...(selected.coordinates && !selected.sources.some((source) => source.url === selected.coordinates?.sourceUrl)
      ? [{ label: selected.coordinates.sourceLabel, url: selected.coordinates.sourceUrl }]
      : []),
  ] : []

  useEffect(() => {
    const controller = new AbortController()
    fetch('/data/taiwan-counties.geojson', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`GeoJSON request failed: ${response.status}`)
        return response.json() as Promise<TaiwanCountyCollection>
      })
      .then(setCountyData)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setMapError(true)
      })
    return () => controller.abort()
  }, [])

  const selectedDirections = selected ? mapsDirections(selected) : undefined
  return <main className="route-map-page editorial-wrap">
    <header className="route-map-heading"><span className="eyebrow"><Route size={16}/> 沿著花東走 / 場域地圖</span><h1>順著海岸與縱谷，找到下一站。</h1><p>地圖只標出可核對的地點。候選名單不代表合作或可預約。</p></header>
    <div className="route-map-layout">
      <section className="taiwan-map-wrap" aria-label="臺灣本島縣市界線與花東候選場域地圖">
        <div className="map-caption"><span>TAIWAN · EAST</span><b>花東候選場域</b><small>{projectedPlaces.length} 處位置已核對</small></div>
        {projection ? <svg className="taiwan-map-svg" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label="依公開地理座標定位的花東候選場域">
          <g className="taiwan-county-shapes">
            {features.map((feature, index) => <path key={`${feature.properties?.COUNTYCODE ?? feature.properties?.COUNTYNAME ?? 'county'}-${index}`} d={countyPath(projection, feature) ?? undefined} />)}
          </g>
          <g className="map-place-markers">
            {projectedPlaces.map((point) => {
              const place = getPlaceById(point.id)
              const number = places.findIndex((item) => item.id === point.id) + 1
              const stamped = stamps.has(point.id)
              return <g key={point.id} className={`map-place-marker ${selectedId === point.id ? 'is-selected' : ''} ${stamped ? 'is-stamped' : ''}`}>
                <path className="map-leader-line" d={`M${point.anchorX},${point.anchorY} L${point.labelX},${point.labelY}`} />
                <circle className="map-geo-anchor" cx={point.anchorX} cy={point.anchorY} r="3.5" />
                <g className="map-pin-hit-area" role="button" tabIndex={0} aria-label={`查看第${number}處 ${point.name}${place?.address ? `，${place.address}` : ''}`} onClick={() => setSelectedId(point.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedId(point.id) } }}>
                  <circle className="map-pin-halo" cx={point.labelX} cy={point.labelY} r="18" />
                  <circle className="map-pin-number" cx={point.labelX} cy={point.labelY} r="14" />
                  <text className="map-pin-label" x={point.labelX} y={point.labelY + 4.5} textAnchor="middle">{String(number).padStart(2, '0')}</text>
                  <title>{place?.name}｜{place?.address ?? '位置已核對'}</title>
                </g>
              </g>
            })}
          </g>
        </svg> : <div className="map-loading" role="status">{mapError ? '縣市地圖資料暫時無法載入。' : '正在載入縣市地圖…'}</div>}
        <div className="map-legend"><span><i/>已核對位置</span><span><i className="stamped-dot"/>已集示意章</span></div>
        <small className="map-source-note">行政區資料：內政部國土測繪中心 2025 縣市界線（1140318），資料版本 2026-08-07.1，EPSG:4326；政府資料開放授權條款第 1 版。<a href={COUNTY_DATASET_URL} target="_blank" rel="noreferrer">資料版本</a> · <a href={COUNTY_GOVERNMENT_SOURCE} target="_blank" rel="noreferrer">原始資料說明</a></small>
      </section>
      <aside className="map-place-panel">
        {selected && <><span className="eyebrow">{selected.regionName} / 候選名單</span><h2>{selected.name}</h2><p>{selected.verifiedFacts[0] ?? '目前是候選參考名單；地點、活動與預約資訊尚待查證。'}</p><dl><div><dt>地址</dt><dd>{selected.address ?? '尚未查得可核對地址'}</dd></div><div><dt>座標</dt><dd>{selected.coordinates ? `${selected.coordinates.latitude.toFixed(6)}, ${selected.coordinates.longitude.toFixed(6)}${selected.coordinates.locationNote ? `；${selected.coordinates.locationNote}` : ''}` : '待確認，不顯示地圖標記'}</dd></div><div><dt>可確認服務</dt><dd>{selected.activityInfo[0] ?? '尚未查證，不推定提供體驗或服務'}</dd></div><div><dt>預約／合作</dt><dd>{selected.bookingChannel === 'public' ? '有公開預約資訊，請以業者公告為準' : '無可確認公開預約管道'}；尚未取得平台合作同意</dd></div></dl>
          {selectedDirections && <a className="text-link map-directions-link" href={selectedDirections} target="_blank" rel="noreferrer">{selected.coordinates ? 'Google Maps 導航' : 'Google Maps 搜尋'} <ArrowRight size={16}/></a>}
          <Link className="text-link" to={`/places/${selected.id}`}>查看場域資料 <ArrowRight size={16}/></Link></>}
        {selected && <section className="map-source-list"><h3>資料來源</h3><ul>{selectedSources.map((source) => <li key={`${selected.id}-${source.url}`}><a href={source.url} target="_blank" rel="noreferrer">{source.label} <ArrowRight size={14}/></a></li>)}</ul></section>}
        <section className="unlocated-places" aria-labelledby="unlocated-heading"><h3 id="unlocated-heading">位置待確認</h3><p>未有足夠資料核對固定地點，因此不放置座標標記。</p><ul>{places.filter((place) => !place.coordinates).map((place) => <li key={place.id}><button onClick={() => setSelectedId(place.id)}><span>{place.regionName}</span><b>{place.name}</b><small>{place.address ?? '地址待查'}</small></button></li>)}</ul></section>
        <div className="nearby-box"><span className="eyebrow"><MapPin size={15}/> 沿線推薦</span><h3>同區場域</h3><label>目前規劃位置<select value={area} onChange={(event) => setArea(event.target.value)}><option>瑞穗</option><option>東海岸</option><option>太魯閣</option><option>南迴</option><option>花東全區</option></select></label><ul>{nearest.slice(0, 4).map((place) => <li key={place.id}><button onClick={() => setSelectedId(place.id)}><span>{place.regionName}</span><b>{place.name}</b><small>{place.coordinates ? '地圖座標已核對' : '位置待確認'}</small></button></li>)}</ul><small className="fine-print">依路線區域列出，不代表距離最近或實際交通時間。</small></div>
      </aside>
    </div>
    <section className="route-reward-band"><div><span className="eyebrow"><Sparkles size={15}/> 路線集章展示</span><h2>走訪兩個場域，累積旅伴折抵。</h2><p>目前紀錄 {state.placeStamps.length} 個場域；達兩個後可取得 NT$200 旅伴服務折抵示意券。</p></div><div className="reward-count"><b>{Math.min(state.placeStamps.length, 2)}<small> / 2</small></b><span>已累積場域</span><Link className="button button-primary" to="/companions">找一位旅伴 <ArrowRight size={16}/></Link></div></section>
    <section className="route-benefit-note"><h2>場域資料狀態</h2><p>這是候選參考名單。地址、座標、活動與公開預約資訊分別依來源核對；尚未查證的資料會清楚標示，且全數場域皆未確認平台合作。</p><div><span>座標來源可追溯</span><span>未確認位置不放標記</span><span>加入行程不等於預約</span></div></section>
  </main>
}
