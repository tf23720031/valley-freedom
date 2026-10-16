import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, MapPin, Minus, Plus, Search, Users } from 'lucide-react'
import { useAppState } from '../../store/AppStateProvider'
import { dispatch } from '../../store/appStore'
import { cancelBooking, createBooking, remainingSeats } from '../../domain/booking'
import { addExperienceToItinerary } from '../../domain/itinerary'
import { useNotify } from '../../components/Feedback'
import { ConfirmDialog } from '../../components/Feedback'

const categories = ['全部體驗', '食農體驗', '地方飲食', '手作技藝', '地方故事', '自然觀察', '聚落走讀', '共創體驗']
const statusLabel = { pending: '等待業者確認', confirmed: '預約已確認', cancelled: '已取消', completed: '體驗已完成' }

export function ExplorePage() {
  const state = useAppState()
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('全部體驗')
  const [maxPrice, setMaxPrice] = useState('')
  const [maxDuration, setMaxDuration] = useState('')
  const [bookableOnly, setBookableOnly] = useState(false)
  const [date, setDate] = useState('')
  const results = useMemo(() => state.experiences.filter((experience) => {
    const slots = state.sessions.filter((session) => session.experienceId === experience.id && (!date || session.date === date) && remainingSeats(state, session.id) > 0)
    return experience.published && (category === '全部體驗' || experience.category === category) && (!keyword || `${experience.title}${experience.description}${experience.location}${experience.category}`.toLowerCase().includes(keyword.toLowerCase())) && (!maxPrice || experience.price <= Number(maxPrice)) && (!maxDuration || experience.durationMinutes <= Number(maxDuration)) && (!bookableOnly || slots.length > 0)
  }), [state, keyword, category, maxPrice, maxDuration, bookableOnly, date])
  return <section className="page-section editorial-wrap"><div className="page-title-row"><div><span className="eyebrow">THE VALLEY FIELD GUIDE / 01</span><h1>地方體驗</h1><p>從田裡、灶腳、工藝與故事開始，慢慢走進縱谷。</p></div><span className="page-count">{String(results.length).padStart(2, '0')} <small>項體驗</small></span></div>
    <div className="explore-layout"><aside className="filter-panel"><div className="filter-heading"><span>找一件想做的事</span><Search size={16}/></div><label className="field-label">關鍵字<input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜尋地方、體驗…"/></label><label className="field-label">日期<input type="date" value={date} onChange={(event) => setDate(event.target.value)}/></label><label className="field-label">體驗類別<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((value) => <option key={value}>{value}</option>)}</select></label><label className="field-label">每人最高預算<input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="不限"/></label><label className="field-label">體驗時長<select value={maxDuration} onChange={(event) => setMaxDuration(event.target.value)}><option value="">不限時間</option><option value="90">90 分鐘內</option><option value="120">2 小時內</option><option value="180">3 小時內</option></select></label><label className="check-field"><input type="checkbox" checked={bookableOnly} onChange={(event) => setBookableOnly(event.target.checked)}/><span>只看尚有名額</span></label><button className="filter-reset" onClick={() => { setKeyword(''); setDate(''); setCategory('全部體驗'); setMaxPrice(''); setMaxDuration(''); setBookableOnly(false) }}>清除篩選</button></aside>
      <div className="explore-results"><div className="results-bar"><span>共找到 {results.length} 項體驗</span><span>所有內容皆為示意資料</span></div>{results.length ? <div className="experience-grid">{results.map((experience, index) => { const session = state.sessions.find((item) => item.experienceId === experience.id && (!date || item.date === date) && remainingSeats(state, item.id) > 0); return <Link className="experience-card" to={`/experiences/${experience.id}`} key={experience.id}><div className={`card-art art-tone-${index % 4}`}><img src={experience.image} alt=""/><span className="card-tag">{experience.category}</span><span className="card-no">{String(index + 1).padStart(2, '0')}</span></div><div className="card-body"><h2>{experience.title}</h2><p>{experience.description}</p><div className="card-meta"><span><Clock3 size={14}/>{experience.durationMinutes} 分鐘</span><span>{experience.price ? `NT$ ${experience.price.toLocaleString()}` : '免費'}</span></div><div className="card-availability">{session ? `最近場次 ${session.date}・剩 ${remainingSeats(state, session.id)} 位` : '目前沒有開放場次'}</div></div></Link> })}</div> : <div className="empty-state"><span className="empty-number">／</span><h2>還沒有符合的體驗</h2><p>試試其他日期、類別或預算範圍。</p></div>}</div></div>
  </section>
}

export function ExperienceDetailPage() {
  const { experienceId = '' } = useParams()
  const state = useAppState()
  const notify = useNotify()
  const navigate = useNavigate()
  const experience = state.experiences.find((item) => item.id === experienceId && item.published)
  const sessions = state.sessions.filter((item) => item.experienceId === experienceId && !item.pilot)
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? '')
  const [partySize, setPartySize] = useState(1)
  const [confirmOpen, setConfirmOpen] = useState(false)
  if (!experience) return <section className="empty-page editorial-wrap"><h1>找不到這項體驗</h1><Link className="text-link" to="/experiences">回到體驗列表 <ArrowRight size={15}/></Link></section>
  const selected = sessions.find((item) => item.id === sessionId)
  const available = selected ? remainingSeats(state, selected.id) : 0
  const availableSessions = sessions
  const book = () => {
    if (!sessionId) return
    const result = dispatch((current) => createBooking(current, { sessionId, travelerId: current.travelerId, partySize, now: new Date().toISOString() }))
    if (result.ok) { setConfirmOpen(false); notify('預約已送出，等待業者確認。'); navigate('/bookings') }
    else { setConfirmOpen(false); notify(result.error.message, 'error') }
  }
  const addItinerary = () => {
    if (!selected) { notify('目前沒有可加入的正式場次。', 'error'); return }
    const result = dispatch((current) => addExperienceToItinerary(current, { travelerId: current.travelerId, experienceId, sessionId: selected.id, date: selected.date }))
    notify(result.ok ? '已加入自由旅程草稿，尚未建立預約。' : result.error.message, result.ok ? 'success' : 'error')
  }
  return <article className="detail-page editorial-wrap"><Link className="back-link" to="/experiences"><ArrowLeft size={15}/>返回地方體驗</Link><div className="detail-layout"><div className="detail-main"><div className="detail-art"><img src={experience.image} alt={`${experience.title}插畫`}/><span className="detail-art-caption">FIELD NOTE / {experience.category}</span></div><span className="eyebrow detail-kicker">{experience.category}・花東縱谷</span><h1>{experience.title}</h1><p className="detail-lead">{experience.description}讓一段地方日常，成為旅程裡可以親自參與的片刻。</p><div className="detail-facts"><span><Clock3/>{experience.durationMinutes} 分鐘</span><span><MapPin/>{experience.location}</span><span><Users/>小團體同行</span></div><div className="detail-copy"><h2>這段體驗會發生什麼</h2><p>{experience.description}由地方夥伴陪你一起認識場域、材料與背後的生活。活動依季節略有不同，請以場次資訊為準。</p><h3>集合資訊</h3><p>{experience.meetingPoint}。請於開始時間前 10 分鐘抵達；交通需自行安排。</p></div><section className="session-section"><div className="section-heading"><div><span className="eyebrow">AVAILABLE SESSIONS</span><h2>選一個適合的時間</h2></div></div>{sessions.length ? <div className="session-list">{sessions.map((session) => <label className={`session-option ${session.id === sessionId ? 'selected' : ''} ${remainingSeats(state, session.id) === 0 ? 'sold-out' : ''}`} key={session.id}><input type="radio" name="session" value={session.id} disabled={remainingSeats(state, session.id) === 0} checked={session.id === sessionId} onChange={() => { setSessionId(session.id); setPartySize(1) }}/><span className="session-date"><CalendarDays/>{session.date}</span><span>{session.startTime} – {session.endTime}</span><b>{remainingSeats(state, session.id) > 0 ? `剩 ${remainingSeats(state, session.id)} 位` : '額滿'}</b></label>)}</div> : <p className="inline-empty">目前沒有開放場次，請稍後再來看看。</p>}</section></div>
    <aside className="booking-panel"><span className="eyebrow">預約體驗</span><div className="booking-price">{experience.price ? <>NT$ {experience.price.toLocaleString()}<small>／人</small></> : '免費參與'}</div><p className="demo-small">示意價格・不含交通</p><div className="booking-summary"><span>選擇場次</span><b>{selected ? `${selected.date}・${selected.startTime}` : '目前無可預約場次'}</b><span>剩餘名額</span><b>{selected ? `${available} 位` : '—'}</b></div><div className="party-control"><span>參與人數</span><div><button aria-label="減少人數" disabled={partySize <= 1} onClick={() => setPartySize((size) => Math.max(1, size - 1))}><Minus size={15}/></button><b>{partySize}</b><button aria-label="增加人數" disabled={partySize >= available} onClick={() => setPartySize((size) => Math.min(available, size + 1))}><Plus size={15}/></button></div></div><button className="button button-primary full-button" disabled={!selected || available === 0} onClick={() => setConfirmOpen(true)}>{available === 0 ? '目前沒有名額' : '送出模擬預約'} <ArrowRight size={15}/></button><button className="button button-outline full-button" disabled={!availableSessions.length} onClick={addItinerary}>加入自由旅程</button><p className="booking-note">加入旅程只是儲存草稿，不代表預約完成，也不先占用名額。</p></aside></div><ConfirmDialog open={confirmOpen} title="送出這筆預約？" description={`預約 ${partySize} 位・${experience.title}。送出後由業者確認，這是展示用流程，不會進行付款。`} confirmLabel="確認送出" onCancel={() => setConfirmOpen(false)} onConfirm={book}/></article>
}

export function BookingsPage() {
  const state = useAppState()
  const notify = useNotify()
  const [searchParams] = useSearchParams()
  const [canceling, setCanceling] = useState<string | null>(null)
  const [reason, setReason] = useState('行程安排調整')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const items = state.bookings.filter((booking) => booking.travelerId === state.travelerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const selected = items.find((booking) => booking.id === canceling)
  const doCancel = () => {
    if (!selected) return
    const result = dispatch((current) => cancelBooking(current, { bookingId: selected.id, source: 'traveler', reason, now: new Date().toISOString() }))
    notify(result.ok ? '預約已取消，名額已釋出。' : result.error.message, result.ok ? 'success' : 'error')
    setConfirmOpen(false); setCanceling(null)
  }
  return <section className="page-section editorial-wrap"><div className="page-title-row"><div><span className="eyebrow">YOUR RESERVATIONS / 03</span><h1>我的預約</h1><p>查看預約狀態，與地方夥伴保持聯繫。</p></div><span className="page-count">{String(items.length).padStart(2, '0')} <small>筆紀錄</small></span></div>{searchParams.has('created') && <p className="notice-success"><Check size={16}/>預約已送出，請留意確認狀態。</p>}
    {items.length ? <div className="booking-list">{items.map((booking) => { const experience = state.experiences.find((item) => item.id === booking.experienceId); const session = state.sessions.find((item) => item.id === booking.sessionId); return <article className="booking-row" key={booking.id}><div className="booking-thumb"><img src={experience?.image} alt=""/></div><div className="booking-info"><span className="eyebrow">訂單編號 {booking.id.slice(-8).toUpperCase()}</span><h2>{experience?.title ?? '地方體驗'}</h2><p><CalendarDays size={14}/>{session?.date}・{session?.startTime} <span className={`status-pill status-${booking.status}`}>{statusLabel[booking.status]}</span></p><small>{booking.partySize} 位參與・{booking.cancelReason ? `取消原因：${booking.cancelReason}` : '示意預約，無實際付款'}</small></div><div className="booking-row-actions">{booking.status === 'pending' || booking.status === 'confirmed' ? <button className="text-button danger-text" onClick={() => { setCanceling(booking.id); setReason('行程安排調整'); setConfirmOpen(true) }}>取消預約</button> : <span className="muted-label">{booking.status === 'completed' ? '期待下次同行' : '已結束'}</span>}</div></article> })}</div> : <div className="empty-state"><span className="empty-number">／</span><h2>還沒有預約紀錄</h2><p>從一件想做的地方體驗開始吧。</p><Link className="button button-primary" to="/experiences">探索地方體驗 <ArrowRight size={15}/></Link></div>}
    {confirmOpen && <div className="dialog-backdrop"><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="cancel-title"><span className="eyebrow">取消預約</span><h2 id="cancel-title">確定取消這筆預約？</h2><p>取消後會立即釋出場次名額，且無法復原。</p><label className="field-label">取消原因<input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={100}/></label><div className="dialog-actions"><button className="button button-quiet" onClick={() => setConfirmOpen(false)}>保留預約</button><button className="button button-danger" disabled={!reason.trim()} onClick={doCancel}>確認取消</button></div></section></div>}
  </section>
}

export function MuriSunshinePage() {
  const state = useAppState()
  const related = state.experiences.filter((item) => item.category === '食農體驗' || item.category === '地方飲食')
  return <section className="place-page editorial-wrap"><div className="place-page-hero"><img src="/photos/pomelo-orchard.webp" alt="瑞穗文旦果園與遠方山巒"/><span className="eyebrow">MURI SUNSHINE / PLACE ARCHIVE</span><span className="photo-credit">示意影像・AI 生成</span></div><div className="place-page-copy"><span className="eyebrow">木日光文旦驛站・花蓮瑞穗</span><h1>一顆文旦，<br/><em>是一個地方的季節。</em></h1><p className="detail-lead">木日光從文旦與土地出發，把農業日常轉化為能分享、能學習、也能持續合作的地方經驗。</p><div className="story-columns"><div><h2>文旦產業與地方生活</h2><p>果園沿著瑞穗的山線與水路展開，從照料枝葉、等待熟成到採收，地方生活依著季節行進。體驗讓旅人看見一顆果實背後的時間、技術與關係。</p></div><div><h2>食農教育與共學</h2><p>從土地、食物與人的連結開始，讓不同年齡的參與者透過觀察、動手與對話，理解農業如何與地方文化和生活相互支撐。</p></div><div><h2>地方夥伴的行動起點</h2><p>木日光協助串連場域、地方業者與青年，把原有資源重新組合為微體驗、新任務與可持續的工作機會。</p></div></div></div><div className="related-experiences"><div className="section-heading"><div><span className="eyebrow">RELATED EXPERIENCES</span><h2>從木日光開始的體驗</h2></div></div><div className="simple-link-grid">{related.map((item) => <Link to={`/experiences/${item.id}`} key={item.id}><span>{item.category}</span><b>{item.title}</b><ArrowRight size={15}/></Link>)}</div></div></section>
}
