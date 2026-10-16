import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, CalendarDays, Clock3, Compass, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppState } from '../../store/AppStateProvider'
import { dispatch } from '../../store/appStore'
import { addExperienceToItinerary, addFreeActivity, getItinerarySummary } from '../../domain/itinerary'
import { remainingSeats } from '../../domain/booking'
import { createId } from '../../domain/ids'
import { useNotify } from '../../components/Feedback'

const defaultDate = '2026-11-14'
export function ItineraryPage() {
  const state = useAppState()
  const notify = useNotify()
  const [date, setDate] = useState(defaultDate)
  const [title, setTitle] = useState('溪邊自由散步')
  const [startTime, setStartTime] = useState('12:00')
  const [endTime, setEndTime] = useState('13:00')
  const [budgetValue, setBudgetValue] = useState('3000')
  const [availableFrom, setAvailableFrom] = useState('08:00')
  const [availableTo, setAvailableTo] = useState('18:00')
  const itinerary = state.itineraries.find((item) => item.travelerId === state.travelerId && item.date === date)
  const entries = itinerary?.items ?? []
  const summary = useMemo(() => getItinerarySummary(itinerary ?? { id: 'preview', travelerId: state.travelerId, title: '我的縱谷日常', date, budget: Number(budgetValue) || 0, interests: [], items: [], updatedAt: '' }), [itinerary, state.travelerId, date, budgetValue])
  const updateItinerary = (items: typeof entries, budget = Number(budgetValue) || 0) => dispatch((current) => {
    const existing = current.itineraries.find((item) => item.travelerId === current.travelerId && item.date === date)
    const next = { id: existing?.id ?? createId('itinerary'), travelerId: current.travelerId, title: existing?.title ?? '我的縱谷日常', date, budget, interests: existing?.interests ?? [], items, updatedAt: new Date().toISOString() }
    return { ok: true, value: { ...current, itineraries: [...current.itineraries.filter((item) => item.id !== next.id), next] } }
  })
  const updateItem = (itemId: string, action: 'remove' | 'up' | 'down') => {
    const items = [...entries]
    const index = items.findIndex((item) => item.id === itemId)
    if (action === 'remove') items.splice(index, 1)
    else {
      const destination = action === 'up' ? index - 1 : index + 1
      if (destination < 0 || destination >= items.length) return
      ;[items[index], items[destination]] = [items[destination], items[index]]
    }
    updateItinerary(items)
  }
  const addActivity = (event: React.FormEvent) => {
    event.preventDefault()
    const result = dispatch((current) => addFreeActivity(current, { travelerId: current.travelerId, title, date, startTime, endTime }))
    notify(result.ok ? '自由活動已加入行程並自動儲存。' : result.error.message, result.ok ? 'success' : 'error')
  }
  const available = state.experiences.filter((experience) => experience.published).flatMap((experience) => state.sessions.filter((session) => session.experienceId === experience.id && !session.pilot && session.date === date && session.startTime >= availableFrom && session.endTime <= availableTo).map((session) => ({ experience, session })))
  const addExperience = (experienceId: string, sessionId: string) => { const result = dispatch((current) => addExperienceToItinerary(current, { travelerId: current.travelerId, experienceId, sessionId, date })); notify(result.ok ? '體驗已加入旅程草稿，尚未建立預約。' : result.error.message, result.ok ? 'success' : 'error') }
  return <section className="page-section editorial-wrap"><div className="page-title-row"><div><span className="eyebrow">BUILD YOUR OWN ROUTE / 02</span><h1>自由旅程組合器</h1><p>先收進草稿，再依自己的速度調整。行程與預約分開保存。</p></div><span className="page-count">DRAFT <small>旅程草稿</small></span></div>
    <div className="itinerary-controls"><label className="field-label"><span><CalendarDays size={14}/>旅遊日期</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)}/></label><label className="field-label"><span>預算上限</span><input type="number" min="0" value={budgetValue} onChange={(event) => { setBudgetValue(event.target.value); updateItinerary(entries, Number(event.target.value) || 0) }}/></label><div className="interest-picker"><span>想感受的地方</span><div>{['果園', '飲食', '手作', '自然'].map((interest) => { const active = itinerary?.interests.includes(interest) ?? false; return <button className={active ? 'interest-chip active' : 'interest-chip'} key={interest} onClick={() => { const current = itinerary?.interests ?? []; const next = active ? current.filter((item) => item !== interest) : [...current, interest]; updateItinerary(entries); dispatch((state) => { const currentPlan = state.itineraries.find((item) => item.travelerId === state.travelerId && item.date === date); return { ok: true, value: currentPlan ? { ...state, itineraries: state.itineraries.map((item) => item.id === currentPlan.id ? { ...item, interests: next } : item) } : state } }) }}>{interest}</button> })}</div></div><label className="field-label"><span>可用時間・從</span><input type="time" value={availableFrom} onChange={(event) => setAvailableFrom(event.target.value)}/></label><label className="field-label"><span>到</span><input type="time" value={availableTo} onChange={(event) => setAvailableTo(event.target.value)}/></label></div>
    <details className="available-experiences" open><summary><span><span className="eyebrow">CHOOSE EXPERIENCES / FIT YOUR TIME</span><b>加入一段地方體驗</b></span><span className="available-count">{available.length} 個場次符合日期與時間</span></summary>{available.length ? <div className="available-experience-list">{available.map(({ experience, session }) => <article key={session.id}><img src={experience.image} alt=""/><div><span className="eyebrow">{experience.category}・{session.date}</span><h3>{experience.title}</h3><p>{session.startTime}–{session.endTime}・{remainingSeats(state, session.id)} 個可預約名額・加入草稿不會占位</p></div><b>{experience.price ? `NT$ ${experience.price.toLocaleString()}` : '免費'}</b><button className="button button-outline small-button" onClick={() => addExperience(experience.id, session.id)}><Plus size={14}/>加入</button></article>)}</div> : <p className="available-empty">目前選擇的日期與時段沒有場次。可調整時間，或先到體驗詳情查看其他日期。</p>}</details>
    <div className="itinerary-layout"><div className="itinerary-list-panel"><div className="section-heading compact"><div><span className="eyebrow">YOUR DAY / {date}</span><h2>旅程安排</h2></div><span className="item-count">{entries.length} 個安排</span></div>{entries.length ? <div className="itinerary-items">{entries.map((item, index) => { const conflict = summary.conflicts.has(item.id); const session = state.sessions.find((value) => value.id === item.sessionId); const booking = item.sessionId ? state.bookings.find((value) => value.sessionId === item.sessionId && value.travelerId === state.travelerId && value.status !== 'cancelled') : null; const cancelledBooking = item.sessionId ? state.bookings.find((value) => value.sessionId === item.sessionId && value.travelerId === state.travelerId && value.status === 'cancelled') : null; return <article className={`itinerary-item ${conflict ? 'has-conflict' : ''}`} key={item.id}><span className="itinerary-time"><b>{item.startTime}</b><i/>{item.endTime}</span><div className="itinerary-item-body"><span className="eyebrow">{item.kind === 'experience' ? '地方體驗' : '自由活動'}</span><h3>{item.title}</h3><p><Clock3 size={13}/>{item.date}・{session ? `${session.startTime}–${session.endTime}` : `${item.startTime}–${item.endTime}`}{item.kind === 'free' && <span>・不占用場次名額</span>}</p>{conflict && <strong className="conflict-note">時間與其他安排重疊，請調整順序或時間。</strong>}{cancelledBooking && <span className="status-pill status-cancelled">對應預約已取消</span>}{booking && <span className={`status-pill status-${booking.status}`}>{booking.status === 'confirmed' ? '已確認預約' : '等待預約確認'}</span>}</div><b className="item-price">{item.price ? `NT$ ${item.price.toLocaleString()}` : 'NT$ 0'}</b><div className="item-tools"><button aria-label={`將${item.title}上移`} disabled={index === 0} onClick={() => updateItem(item.id, 'up')}><ArrowUp size={15}/></button><button aria-label={`將${item.title}下移`} disabled={index === entries.length - 1} onClick={() => updateItem(item.id, 'down')}><ArrowDown size={15}/></button><button aria-label={`移除${item.title}`} onClick={() => updateItem(item.id, 'remove')}><Trash2 size={15}/></button></div></article> })}</div> : <div className="empty-state small-empty"><span className="empty-number">／</span><h2>這天還留著空白</h2><p>先挑一個體驗，或加進自己的自由活動。</p><Link className="text-link" to="/experiences">探索地方體驗 <span>→</span></Link></div>}<button className="sort-button" onClick={() => updateItinerary([...entries].sort((a,b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)))}><Clock3 size={14}/>依時間排序</button></div>
      <aside className="itinerary-side"><div className="budget-card"><span className="eyebrow">ESTIMATED SPENDING</span><h2>預算概覽</h2><div className="budget-numbers"><span>體驗總費用</span><b>NT$ {summary.total.toLocaleString()}</b><span>預算差額</span><b className={summary.remaining < 0 ? 'over-budget' : ''}>NT$ {summary.remaining.toLocaleString()}</b></div><div className={`budget-meter ${summary.remaining < 0 ? 'over' : ''}`}><i style={{ width: `${summary.total === 0 ? 0 : Math.min(100, summary.total / Math.max(1, Number(budgetValue)) * 100)}%` }}/></div>{summary.remaining < 0 && <p className="conflict-note">已超出設定預算，請移除項目或調整預算。</p>}<p className="demo-small">草稿不代表正式預約，正式預約請到體驗詳情送出。</p></div><form className="free-activity-form" onSubmit={addActivity}><span className="eyebrow">MAKE A LITTLE SPACE</span><h2>加入自由活動</h2><label className="field-label">活動名稱<input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：沿溪散步"/></label><div className="time-fields"><label className="field-label">開始<input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)}/></label><label className="field-label">結束<input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)}/></label></div><button className="button button-outline full-button"><Plus size={15}/>加入行程草稿</button></form><div className="booking-separation"><Compass size={16}/><p>加入旅程不會替你預約，也不會占用體驗名額。</p></div></aside></div>
    <section className="itinerary-real-bookings"><span className="eyebrow">RESERVATIONS ARE SEPARATE</span><h2>已送出的預約</h2>{state.bookings.filter((item) => item.travelerId === state.travelerId).map((booking) => <span className={`status-pill status-${booking.status}`} key={booking.id}>{state.experiences.find((item) => item.id === booking.experienceId)?.title}・{booking.status === 'cancelled' ? '已取消' : booking.status === 'confirmed' ? '已確認' : booking.status === 'completed' ? '已完成' : '待確認'}</span>)}<Link className="text-link" to="/bookings">查看預約紀錄</Link></section>
  </section>
}
