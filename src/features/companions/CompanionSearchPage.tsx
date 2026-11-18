import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
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
import { companionPortraits, getDemoServiceDate } from '../../domain/fixtures'

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
  const defaultDate = getDemoServiceDate()
  const requestedDate = params.get('date')
  const routeOptions = ['花東太魯閣', '東海岸台11線', '花東縱谷台9線', '南迴路線']
  const initialDuration = params.get('duration') === '480' || params.get('duration') === 'full-day' ? 'full-day' : 'half-day'
  const [query, setQuery] = useState<CompanionSearch>({
    destination: initialDestination,
    date: requestedDate && requestedDate >= defaultDate ? requestedDate : defaultDate,
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

  const cutouts: Record<string, string> = {
    'companion-lin': '/photos/companion-lin-cutout.webp',
    'companion-chen': '/photos/companion-chen-cutout.webp',
  }

  return <section className="companion-search-page companion-journal">
    <header className="journal-hero">
      <div className="journal-hero-heading">
        <span className="journal-kicker">找一位在地旅伴 / LOCAL COMPANIONS</span>
        <h1><span>沿途，</span><span>有人同行</span></h1>
      </div>
      <div className="journal-hero-aside">
        <p>找在地旅伴，<br/>一起走走花東。</p>
        <figure className="journal-landscape">
          <span className="journal-sun" aria-hidden="true"/>
          <img src="/photos/valley-hero.webp" alt="" width="960" height="560"/>
          <figcaption><span>花東縱谷・旅行氛圍示意</span><span>FIELD NOTES / 09</span></figcaption>
        </figure>
      </div>
      <svg className="journal-route-line" viewBox="0 0 1200 42" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 27 32 22 57 29 86 12 115 18 145 35 178 25 211 30 246 17 278 22 306 10 337 21 373 16 410 30 446 21 479 25 510 13 550 20 584 12 620 21 658 11 690 17 730 8 767 19 802 10 839 21 877 17 915 28 954 19 989 25 1031 15 1070 24 1108 13 1145 21 1180 11 1200 17"/><circle cx="620" cy="21" r="4"/></svg>
    </header>

    <section className="journal-filters" aria-labelledby="journal-filter-title">
      <div className="journal-section-title"><span aria-hidden="true">01 /</span><h2 id="journal-filter-title">選擇預約條件</h2><small>依條件顯示可詢問的旅伴</small></div>
      <div className="journal-filter-grid">
        <label className="field-label journal-filter-route">服務路線<select aria-label="服務路線" value={query.destination} onChange={(event) => updateDestination(event.target.value)}>{!routeOptions.includes(query.destination) && <option value={query.destination}>{query.destination}</option>}{routeOptions.map((area) => <option key={area} value={area}>{area}</option>)}</select></label>
        <label className="field-label journal-filter-experience">合作體驗／服務<select aria-label="合作體驗／服務" value="experience-1" disabled><option value="experience-1">木日光・文旦田裡的一日農事（展示合作）</option></select><small>目前僅列展示合作服務；其他候選場域尚未確認合作。</small></label>
        <label className="field-label journal-filter-date">服務日期<input type="date" min={defaultDate} value={query.date} onChange={(event) => update('date', event.target.value)}/></label>
        <fieldset className="booking-duration-options journal-filter-duration"><legend>選擇體驗時段</legend><label><input type="radio" name="duration" checked={query.duration === 'half-day'} onChange={() => updateDuration('half-day')}/><span><b>半日 4 小時</b><strong>NT$ {state.revenueAssumptions.halfDayPrice.toLocaleString()} <small>／人</small></strong></span></label><label><input type="radio" name="duration" checked={query.duration === 'full-day'} onChange={() => updateDuration('full-day')}/><span><b>全日 8 小時</b><strong>NT$ {state.revenueAssumptions.fullDayPrice.toLocaleString()} <small>／人</small></strong></span></label></fieldset>
        <label className="field-label journal-filter-time">開始時間<select value={query.startTime} onChange={(event) => update('startTime', event.target.value)}>{(query.duration === 'full-day' ? ['09:00'] : ['09:00', '13:00', '14:00']).map((time) => <option key={time}>{time}</option>)}</select></label>
        <label className="field-label journal-filter-party">同行人數<input type="number" min="1" max="20" value={query.partySize} onChange={(event) => update('partySize', Number(event.target.value))}/></label>
        <label className="field-label journal-filter-language">溝通語言<select value={query.language} onChange={(event) => update('language', event.target.value)}>{['中文', '英文', '日文'].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="field-label journal-filter-service">陪同需求<select value={query.service} onChange={(event) => update('service', event.target.value as CompanionService)}>{Object.entries(labels).map(([key, value]) => <option value={key} key={key}>{value}</option>)}</select></label>
      </div>
      <p className="journal-transport"><span aria-hidden="true">※</span> 集合地點請以預約需求內填寫的位置為準。交通請自行安排；展示流程不涉及付款。</p>
    </section>

    <section className="journal-results" aria-labelledby="journal-results-title">
      <header className="journal-results-heading"><div><span className="journal-kicker">PEOPLE ALONG THE WAY / {query.date}</span><h2 id="journal-results-title">符合條件的旅伴</h2></div><span aria-live="polite">{people.length} 位可詢問</span></header>
      <p className="companion-demo-note journal-demo-note">示意旅伴名單・人物、服務資訊與價格皆為虛擬資料</p>
      {people.length ? people.map((person, index) => {
        const number = String(index + 1).padStart(2, '0')
        const cutout = !person.avatarImageKey && person.avatar === companionPortraits[person.id] ? cutouts[person.id] : undefined
        return <article className={'journal-person' + (selected === person.id ? ' is-selected' : '')} key={person.id}>
          <div className="journal-person-index" aria-hidden="true"><span>{number}</span><small>{person.serviceAreas[0]}</small></div>
          <div className={'journal-person-portrait' + (cutout ? ' has-cutout' : '')}>
            <div className="journal-portrait-landscape" aria-hidden="true"/>
            <CompanionAvatar className="journal-person-image" companionId={person.id} imageKey={person.avatarImageKey} src={cutout ?? person.avatar} alt={person.name + '示意人物照片'}/>
            <span className="journal-portrait-caption">LOCAL COMPANION / {number}</span>
          </div>
          <div className="journal-person-copy">
            <div className="journal-person-name"><h3>{person.name}</h3><span>示意旅伴</span></div>
            <p className="journal-person-bio">{person.bio}</p>
            <small className="companion-public-demographics">{person.birthDate ? ageAt(person.birthDate) + ' 歲' : ''}{person.gender && person.gender !== 'undisclosed' ? '・' + { male: '男', female: '女', other: '其他' }[person.gender] : ''}</small>
            <dl className="journal-person-facts">
              <div><dt>地方</dt><dd>{person.serviceAreas.join('・')}</dd></div>
              <div><dt>溝通</dt><dd>{person.languages.join('・')}</dd></div>
              <div><dt>時間</dt><dd>{person.availability.filter((slot) => slot.date === query.date).map((slot) => slot.startTime + '–' + slot.endTime).join('、')}</dd></div>
              <div><dt>服務</dt><dd>{labels[query.service]}</dd></div>
              <div><dt>興趣</dt><dd>{person.interests?.join('・') || '尚未填寫'}</dd></div>
            </dl>
            <p className="journal-person-training"><b>相關訓練：</b>{person.qualifications.join('、') || '未提供'}<span>展示資訊尚未經平台實際查核</span></p>
            <p className="journal-person-restrictions">服務限制：{person.restrictions.join('；')}</p>
          </div>
          <div className="journal-person-booking">
            <span className="journal-kicker">REQUEST / {number}</span>
            <div className="journal-person-price"><small>NT$</small><b>{estimate?.perPersonPrice.toLocaleString() ?? '—'}</b></div>
            <p>每人・{query.duration === 'full-day' ? '全日 8 小時' : '半日 4 小時'}</p>
            <button className="button journal-request-button" onClick={() => { setSelected(person.id); setModal(true) }}>{selected === person.id ? '已選擇，填寫需求' : '提出預約需求'}<ArrowUpRight size={20}/></button>
            <small>先提出需求，再由雙方確認</small>
          </div>
        </article>
      }) : <div className="empty-state journal-empty"><span aria-hidden="true">／</span><h2>目前沒有符合的旅伴</h2><p>試著更改日期、服務時段、語言或服務區域。</p></div>}
    </section>

    <section className="journal-booking-guide" aria-labelledby="journal-guide-title">
      <div className="journal-guide-process"><h2 id="journal-guide-title">預約流程</h2><ol><li><span>01</span>選擇路線、日期與半日／全日方案</li><li><span>02</span>依同行人數查看含地方體驗的總價</li><li><span>03</span>送出需求，等待旅伴回覆與雙方確認</li></ol></div>
      <div className="journal-guide-faq"><details className="booking-faq"><summary>送出需求後會怎麼進行？</summary><p>需求會列入旅伴工作台。旅伴可接受、婉拒或提出替代時間，旅客確認方案後才會列為已確認服務。</p></details><details className="booking-faq"><summary>費用如何計算？</summary><p>半日每人 NT$ {state.revenueAssumptions.halfDayPrice.toLocaleString()}、全日每人 NT$ {state.revenueAssumptions.fullDayPrice.toLocaleString()}，按同行人數計算。地方業者與青年旅伴的分潤在後台依指定價值模型分配，旅客只會看到預約總價。</p></details><p className="form-disclaimer">目前只提供一般同行與活動支援類服務，不包含需法定資格的專業導覽、載客接送及高風險活動。價格按每人單價與同行人數計算；展示流程不付款。</p></div>
    </section>

    {/* Keep fixed positioning outside the transformed page/route animation containers. */}
    {modal && selectedPerson && createPortal(
      <div className="modal fade show d-block booking-request-modal companion-journal-modal" role="dialog" aria-modal="true" aria-labelledby="request-modal-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(false) }}>
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable booking-request-dialog">
          <form ref={requestDialog} tabIndex={-1} className="modal-content booking-request-content" onSubmit={send}>
            <header className="modal-header booking-request-header"><div><span className="journal-kicker journal-dialog-kicker">REQUEST / 預約需求</span><h2 id="request-modal-title" className="modal-title">填寫預約需求</h2><p>{selectedPerson.name}・{query.date}・{query.startTime}・{query.duration === 'full-day' ? '全日 8 小時' : '半日 4 小時'}</p></div><button type="button" className="btn-close" onClick={() => setModal(false)} aria-label="關閉"/></header>
            <div className="modal-body request-modal-body">
              <div className="request-experience-summary"><span>地方合作服務</span><b>木日光文旦驛站・文旦田裡的一日農事</b><small>展示合作資料</small></div>
              <label className="field-label">集合位置<input className="form-control" required value={meeting} placeholder="請填寫實際集合位置" onChange={(event) => { setMeeting(event.target.value); setMeetingEdited(true) }}/></label>
              <label className="field-label">補充需求<textarea className="form-control" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="例如：希望先協助確認餐廳是否適合素食。" rows={3}/></label>
              <div className="request-summary-grid"><span>同行人數<strong>{query.partySize} 人</strong></span><span>每人費用<strong>NT$ {estimate?.perPersonPrice.toLocaleString() ?? '—'}</strong></span></div>
              <p className="request-legal">送出後為「待旅伴回覆」，尚未確認或付款。人物與服務資訊為展示資料。</p>
            </div>
            <footer className="modal-footer request-modal-footer"><div className="request-estimate"><span>預約總額</span><b>NT$ {estimate?.gross.toLocaleString() ?? '—'}</b></div><button type="submit" className="button journal-request-button full-button" disabled={!estimate}>送出預約需求<ArrowRight size={18}/></button></footer>
          </form>
        </div>
      </div>, document.body,
    )}
  </section>
}
