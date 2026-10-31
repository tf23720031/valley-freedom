import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowRight, CalendarDays, Clock3, Languages, MapPin } from 'lucide-react'
import { useAppState } from '../../store/AppStateProvider'
import { dispatch } from '../../store/appStore'
import { createServiceRequest, estimateCompanionFee, matchingCompanions } from '../../domain/companions'
import type { CompanionSearch } from '../../domain/companions'
import type { CompanionService } from '../../domain/types'
import { useNotify } from '../../components/Feedback'
import { CompanionAvatar } from '../../components/CompanionAvatar'
import { ageAt } from '../../domain/companionProfile'

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
  const initialDestination = params.get('destination') || '瑞穗'
  const regionOptions = ['花蓮縣', '臺東縣', '花東全區']
  const [query, setQuery] = useState<CompanionSearch>({
    destination: initialDestination,
    date: params.get('date') || '2026-11-15',
    startTime: params.get('startTime') || '14:00',
    durationMinutes: Number(params.get('duration') || 90),
    partySize: Number(params.get('partySize') || 2),
    language: params.get('language') || '英文',
    service: (params.get('service') as CompanionService) || 'language-support',
  })
  const [selected, setSelected] = useState<string | null>(params.get('companion'))
  const [meeting, setMeeting] = useState(params.get('meetingPoint') || (regionOptions.includes(initialDestination) ? '' : initialDestination === '瑞穗' ? '瑞穗車站' : initialDestination))
  const [meetingEdited, setMeetingEdited] = useState(Boolean(params.get('meetingPoint')))
  const [notes, setNotes] = useState('')
  const [rewardId, setRewardId] = useState('')
  const [modal, setModal] = useState(false)
  const people = useMemo(() => matchingCompanions(state, query), [state, query])
  const update = (key: keyof CompanionSearch, value: string | number) => setQuery((current) => ({ ...current, [key]: value }))
  const updateDestination = (destination: string) => {
    update('destination', destination)
    if (!meetingEdited) setMeeting(destination === '瑞穗' ? '瑞穗車站' : '')
  }

  const send = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selected) return
    const result = dispatch((current) => createServiceRequest(current, {
      ...query,
      itineraryId: params.get('itineraryId') ?? undefined,
      travelerId: current.travelerId,
      companionId: selected,
      meetingPoint: meeting,
      notes,
      rewardId: rewardId || undefined,
    }, new Date().toISOString()))
    if (result.ok) {
      setModal(false)
      notify('預約需求已送出，等待旅伴回覆。', 'success')
    } else notify(result.error.message, 'error')
  }

  const selectedPerson = state.companions.find((person) => person.id === selected)
  const estimate = selectedPerson ? estimateCompanionFee(query.durationMinutes, selectedPerson.ratePerHour) : 0
  const availableRewards = state.routeRewards.filter((reward) => reward.status === 'available')
  const appliedDiscount = availableRewards.find((reward) => reward.id === rewardId)?.amount ?? 0

  return <section className="companion-search-page editorial-wrap">
    <div className="page-title-row"><div><span className="eyebrow">LOCAL COMPANION / SEARCH</span><h1>找一位在地旅伴</h1><p>輸入行程中的一小段需求。送出後由旅伴確認是否承接。</p></div><span className="page-count">DEMO <small>展示媒合</small></span></div>
    <div className="companion-search-layout">
      <aside className="search-filter-panel">
        <h2>你的需求</h2>
        <label className="field-label"><span><MapPin size={14}/>地點或區域</span><select aria-label="地點或區域" value={query.destination} onChange={(event) => updateDestination(event.target.value)}>{!['瑞穗', '花蓮縣', '臺東縣', '花東全區'].includes(query.destination) && <option value={query.destination}>{query.destination}</option>}{['瑞穗', '花蓮縣', '臺東縣', '花東全區'].map((area) => <option key={area} value={area}>{area}</option>)}</select></label>
        <label className="field-label"><span><CalendarDays size={14}/>服務日期</span><input type="date" value={query.date} onChange={(event) => update('date', event.target.value)}/></label>
        <div className="time-fields">
          <label className="field-label">開始時間<input type="time" value={query.startTime} onChange={(event) => update('startTime', event.target.value)}/></label>
          <label className="field-label">服務時長（分鐘）<input aria-label="服務時長（分鐘）" type="number" min="1" max="480" step="1" value={query.durationMinutes} onChange={(event) => update('durationMinutes', Number(event.target.value))}/></label>
        </div>
        <p className="hourly-billing-note">服務費以 30 分鐘為一個計費單位，未滿 30 分鐘以 30 分鐘計費；例如 15 或 24 分鐘按 30 分鐘計，45、50 或 55 分鐘按 60 分鐘計。</p><p className="transport-reminder">與旅伴在選定地點集合，請自行備車。</p>
        <label className="field-label"><span>同行人數</span><input type="number" min="1" max="20" value={query.partySize} onChange={(event) => update('partySize', Number(event.target.value))}/></label>
        <label className="field-label"><span><Languages size={14}/>溝通語言</span><select value={query.language} onChange={(event) => update('language', event.target.value)}>{['中文', '英文', '日文'].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="field-label"><span>陪同需求</span><select value={query.service} onChange={(event) => update('service', event.target.value as CompanionService)}>{Object.entries(labels).map(([key, value]) => <option value={key} key={key}>{value}</option>)}</select></label>
        <p className="form-disclaimer">目前只提供一般同行與活動支援類服務，不包含需法定資格的專業導覽、載客接送及高風險活動。</p>
        <div className="booking-steps"><h3>預約流程</h3><ol><li>調整日期、時間、語言與服務內容</li><li>選擇旅伴，補上集合位置與需求</li><li>送出後為待旅伴回覆；雙方確認前不成立服務</li></ol><small>展示媒合資料，並非即時上線人員。價格只作示意，不付款。</small></div>
        <details className="booking-faq"><summary>送出需求後會怎麼進行？</summary><p>需求會列入旅伴工作台。旅伴可接受、婉拒或提出替代時間，旅客確認方案後才會列為已確認服務。</p></details>
        <details className="booking-faq"><summary>服務內容與費用如何確認？</summary><p>本展示僅含一般同行、活動協助、語言溝通及地方資訊支援。畫面報價是示意；實際服務、費用與交通安排需由雙方事前確認，平台不處理付款。</p></details>
      </aside>
      <div className="search-results">
        <div className="results-heading"><div><span className="eyebrow">AVAILABLE PEOPLE / {query.date}</span><h2>符合條件的旅伴</h2></div><span>{people.length} 位可詢問</span></div>
        <p className="companion-demo-note">示意旅伴名單・人物、服務資訊與價格皆為虛擬資料</p>
        {people.length ? people.map((person) => <article className={`companion-result ${selected === person.id ? 'selected' : ''}`} key={person.id}>
          <CompanionAvatar companionId={person.id} imageKey={person.avatarImageKey} src={person.avatar} alt={`${person.name}示意人物照片`}/>
          <div className="companion-result-main">
            <div className="person-heading"><div><span className="eyebrow">{person.serviceAreas.join('・')} / 示意旅伴</span><h3>{person.name}</h3></div><b>NT$ {person.ratePerHour}<small>／小時</small></b></div>
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
      <form className="request-modal" onSubmit={send}>
        <button type="button" className="modal-close" onClick={() => setModal(false)} aria-label="關閉">×</button><span className="eyebrow">REQUEST TO BOOK / DEMO</span><h2>提出旅伴預約需求</h2><p>{selectedPerson.name}・{query.date}・{query.startTime}・{query.durationMinutes} 分鐘</p>
        <label className="field-label">集合位置<input required value={meeting} placeholder="請填寫實際集合位置" onChange={(event) => { setMeeting(event.target.value); setMeetingEdited(true) }}/></label>
        <label className="field-label">補充需求<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="例如：希望先協助確認餐廳是否適合素食。" rows={4}/></label>
        {availableRewards.length > 0 && <label className="field-label">路線集章折抵<select value={rewardId} onChange={(event) => setRewardId(event.target.value)}><option value="">不使用折抵</option>{availableRewards.map((reward) => <option key={reward.id} value={reward.id}>NT${reward.amount} 折抵示意</option>)}</select></label>}
        <div className="request-estimate"><span>示意服務費用{appliedDiscount ? `（含 NT$${appliedDiscount} 路線折抵）` : ''}</span><b>NT$ {Math.max(0, estimate - appliedDiscount).toLocaleString()}</b></div><p className="request-legal">以 30 分鐘為一個計費單位，不滿 30 分鐘按 30 分鐘計；超過 30 分鐘則進位至下一個 30 分鐘。折抵僅為展示紀錄。此需求送出後為「待旅伴回覆」，不是已確認預約，也不涉及付款。</p>
        <button className="button button-primary full-button">送出預約需求 <ArrowRight size={15}/></button>
      </form>
    </div>}
  </section>
}
