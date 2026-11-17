import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowRight, CalendarDays, Clock3, Languages, MapPin } from 'lucide-react'
import { useAppState } from '../../store/AppStateProvider'
import { dispatch } from '../../store/appStore'
import { createServiceRequest, matchingCompanions } from '../../domain/companions'
import type { CompanionSearch } from '../../domain/companions'
import type { CompanionService } from '../../domain/types'
import { useNotify } from '../../components/Feedback'
import { CompanionAvatar } from '../../components/CompanionAvatar'
import { ageAt } from '../../domain/companionProfile'
import { useDialogBehavior } from '../../components/useDialogBehavior'
import { calculateBookingRevenue } from '../../domain/revenueShare'

const labels: Record<CompanionService, string> = {
  companionship: '一般同行',
  'event-support': '活動現場協助',
  'language-support': '語言溝通',
  'local-information': '地方資訊支援',
}

export function CompanionSearchPage() {
  const state = useAppState()
  const notify = useNotify()
  const [params] = useSearchParams()
  const initialDestination = params.get('destination') || '花東縱谷台9線'
  const routeOptions = ['花東太魯閣', '東海岸台11線', '花東縱谷台9線', '南迴路線']
  const initialDuration = params.get('duration') === '480' || params.get('duration') === 'full-day' ? 'full-day' : 'half-day'
  const [query, setQuery] = useState<CompanionSearch>({
    destination: initialDestination,
    date: params.get('date') || '2026-11-15',
    startTime: params.get('startTime') || '09:00',
    durationMinutes: initialDuration === 'full-day' ? 480 : 240,
    duration: initialDuration,
    partySize: Number(params.get('partySize') || 2),
    language: params.get('language') || '英文',
    service: (params.get('service') as CompanionService) || 'language-support',
  })
  const [selected, setSelected] = useState<string | null>(params.get('companion'))
  const [meeting, setMeeting] = useState(params.get('meetingPoint') || '木日光文旦驛站入口')
  const [meetingEdited, setMeetingEdited] = useState(Boolean(params.get('meetingPoint')))
  const [notes, setNotes] = useState('')
  const [modal, setModal] = useState(false)
  const people = useMemo(() => matchingCompanions(state, query), [state, query])
  const update = (key: keyof CompanionSearch, value: string | number) => setQuery((current) => ({ ...current, [key]: value }))
  const updateDestination = (destination: string) => {
    update('destination', destination)
    if (!meetingEdited) setMeeting(destination === '花東縱谷台9線' ? '木日光文旦驛站入口' : '')
  }
  const updateDuration = (duration: 'half-day' | 'full-day') => setQuery((current) => ({ ...current, duration, durationMinutes: duration === 'half-day' ? 240 : 480, startTime: duration === 'full-day' ? '09:00' : current.startTime }))

  const send = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selected) return
    const result = dispatch((current) => createServiceRequest(current, {
      ...query,
      itineraryId: params.get('itineraryId') ?? undefined,
      travelerId: current.travelerId,
      companionId: selected,
      experienceId: 'experience-1',
      meetingPoint: meeting,
      notes,
    }, new Date().toISOString()))
    if (result.ok) {
      setModal(false)
      notify('預約需求已送出，等待旅伴回覆。', 'success')
    } else notify(result.error.message, 'error')
  }

  const selectedPerson = state.companions.find((person) => person.id === selected)
  const requestDialog = useDialogBehavior<HTMLFormElement>(modal && Boolean(selectedPerson), () => setModal(false))
  const estimateResult = calculateBookingRevenue({ duration: query.duration ?? 'half-day', partySize: query.partySize, assumptions: state.revenueAssumptions })
  const estimate = estimateResult.ok ? estimateResult.value : null

  return <section className="companion-search-page editorial-wrap">
    <div className="page-title-row"><div><span className="eyebrow">LOCAL COMPANION / FIELD BOOKING</span><h1>找一位在地旅伴</h1><p>選擇路線、體驗與同行規模，讓地方服務與旅伴同行一起發生。</p></div><span className="page-count">FIELD NOTE <small>預約示意</small></span></div>
    <div className="companion-search-layout">
      <aside className="search-filter-panel">
        <h2>你的需求</h2>
        <label className="field-label"><span><MapPin size={14}/>服務路線</span><select aria-label="服務路線" value={query.destination} onChange={(event) => updateDestination(event.target.value)}>{!routeOptions.includes(query.destination) && <option value={query.destination}>{query.destination}</option>}{routeOptions.map((area) => <option key={area} value={area}>{area}</option>)}</select></label>
        <label className="field-label"><span>合作體驗／服務</span><select aria-label="合作體驗／服務" value="experience-1" disabled><option value="experience-1">木日光・文旦田裡的一日農事（展示合作）</option></select><small className="fine-print">目前僅列示設定為展示合作的服務；其他候選場域尚未確認合作。</small></label>
        <label className="field-label"><span><CalendarDays size={14}/>服務日期</span><input type="date" value={query.date} onChange={(event) => update('date', event.target.value)}/></label>
        <fieldset className="booking-duration-options"><legend>選擇體驗時段</legend><label><input type="radio" name="duration" checked={query.duration === 'half-day'} onChange={() => updateDuration('half-day')}/><span><b>半日・4 小時</b><strong>NT$ {state.revenueAssumptions.halfDayPrice.toLocaleString()} <small>/ 人</small></strong></span></label><label><input type="radio" name="duration" checked={query.duration === 'full-day'} onChange={() => updateDuration('full-day')}/><span><b>全日・8 小時</b><strong>NT$ {state.revenueAssumptions.fullDayPrice.toLocaleString()} <small>/ 人</small></strong></span></label></fieldset>
        <label className="field-label">開始時間<select value={query.startTime} onChange={(event) => update('startTime', event.target.value)}>{(query.duration === 'full-day' ? ['09:00'] : ['09:00', '13:00', '14:00']).map((time) => <option key={time}>{time}</option>)}</select></label>
        <p className="transport-reminder">集合地點：木日光文旦驛站入口。交通請自行安排；目前為展示預約流程，不涉及付款。</p>
        <label className="field-label"><span>同行人數</span><input type="number" min="1" max="20" value={query.partySize} onChange={(event) => update('partySize', Number(event.target.value))}/></label>
        <label className="field-label"><span><Languages size={14}/>溝通語言</span><select value={query.language} onChange={(event) => update('language', event.target.value)}>{['中文', '英文', '日文'].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="field-label"><span>陪同需求</span><select value={query.service} onChange={(event) => update('service', event.target.value as CompanionService)}>{Object.entries(labels).map(([key, value]) => <option value={key} key={key}>{value}</option>)}</select></label>
        <p className="form-disclaimer">目前只提供一般同行與活動支援類服務，不包含需法定資格的專業導覽、載客接送及高風險活動。</p>
        <div className="booking-steps"><h3>預約流程</h3><ol><li>選擇路線、服務日期與半日／全日方案</li><li>依同行人數查看含地方體驗的總價</li><li>選擇旅伴並送出需求，等待雙方確認</li></ol><small>價格按每人單價與同行人數計算；展示流程不付款。</small></div>
        <details className="booking-faq"><summary>送出需求後會怎麼進行？</summary><p>需求會列入旅伴工作台。旅伴可接受、婉拒或提出替代時間，旅客確認方案後才會列為已確認服務。</p></details>
        <details className="booking-faq"><summary>費用如何計算？</summary><p>半日每人 NT$1,000、全日每人 NT$1,800，按同行人數計算。地方業者與青年旅伴的分潤在後台依指定價值模型分配，旅客只會看到預約總價。</p></details>
      </aside>
      <div className="search-results">
        <div className="results-heading"><div><span className="eyebrow">AVAILABLE PEOPLE / {query.date}</span><h2>符合條件的旅伴</h2></div><span>{people.length} 位可詢問</span></div>
        <p className="companion-demo-note">示意旅伴名單・人物、服務資訊與價格皆為虛擬資料</p>
        {people.length ? people.map((person) => <article className={`companion-result ${selected === person.id ? 'selected' : ''}`} key={person.id}>
          <CompanionAvatar companionId={person.id} imageKey={person.avatarImageKey} src={person.avatar} alt={`${person.name}示意人物照片`}/>
          <div className="companion-result-main">
            <div className="person-heading"><div><span className="eyebrow">{person.serviceAreas.join('・')} / 示意旅伴</span><h3>{person.name}</h3></div><b>NT$ {estimate?.perPersonPrice.toLocaleString() ?? '—'}<small>／人・{query.duration === 'full-day' ? '全日' : '半日'}</small></b></div>
            <p>{person.bio}</p><small className="companion-public-demographics">{person.birthDate ? `${ageAt(person.birthDate)} 歲` : ''}{person.gender && person.gender !== 'undisclosed' ? `・${{male:'男',female:'女',other:'其他'}[person.gender]}` : ''}</small>
            <div className="result-qualifications"><span><Languages size={14}/>{person.languages.join('、')}</span><span><Clock3 size={14}/>{person.availability.filter((slot) => slot.date === query.date).map((slot) => `${slot.startTime}–${slot.endTime}`).join('、')}</span><span>{labels[query.service]}</span></div>
            <div className="companion-interests"><b>興趣與擅長</b><span>{person.interests?.join('、') || '尚未填寫'}</span></div>
            <div className="qualification-note"><b>相關訓練：</b>{person.qualifications.join('、') || '未提供'}<small>展示資訊尚未經平台實際查核</small></div>
            <p className="restriction-note">服務限制：{person.restrictions.join('；')}</p>
            <button className={selected === person.id ? 'button button-selected' : 'button button-outline'} onClick={() => { setSelected(person.id); setModal(true) }}>{selected === person.id ? '已選擇，填寫需求' : '提出預約需求'} <ArrowRight size={15}/></button>
          </div>
        </article>) : <div className="empty-state"><span className="empty-number">／</span><h2>目前沒有符合的旅伴</h2><p>試著更改日期、服務時段、語言或服務區域。</p></div>}
      </div>
    </div>
    {modal && selectedPerson && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(false) }}>
      <form ref={requestDialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="request-modal-title" className="request-modal" onSubmit={send}>
        <button type="button" className="modal-close" onClick={() => setModal(false)} aria-label="關閉">×</button><span className="eyebrow">REQUEST TO BOOK / DEMO</span><h2 id="request-modal-title">提出旅伴預約需求</h2><p>{selectedPerson.name}・{query.date}・{query.startTime}・{query.duration === 'full-day' ? '全日 8 小時' : '半日 4 小時'}</p>
        <div className="request-experience-summary"><span>地方合作服務</span><b>木日光文旦驛站・文旦田裡的一日農事</b><small>展示合作資料</small></div>
        <label className="field-label">集合位置<input required value={meeting} placeholder="請填寫實際集合位置" onChange={(event) => { setMeeting(event.target.value); setMeetingEdited(true) }}/></label>
        <label className="field-label">補充需求<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="例如：希望先協助確認餐廳是否適合素食。" rows={4}/></label>
        <div className="request-summary-grid"><span>同行人數<strong>{query.partySize} 人</strong></span><span>每人費用<strong>NT$ {estimate?.perPersonPrice.toLocaleString() ?? '—'}</strong></span></div>
        <p className="request-legal">此需求送出後為「待旅伴回覆」，不是已確認預約，也不涉及付款。人物與服務資訊為展示資料。</p>
        <footer className="request-modal-footer"><div className="request-estimate"><span>預約總額</span><b>NT$ {estimate?.gross.toLocaleString() ?? '—'}</b></div><button type="submit" className="button button-primary full-button" disabled={!estimate}>送出預約需求 <ArrowRight size={15}/></button></footer>
      </form>
    </div>}
  </section>
}
