import { useState } from 'react'
import { useAppState } from '../../store/AppStateProvider'
import { dispatch } from '../../store/appStore'
import { cancelServiceRequest, companionRespond, completeServiceRequest, travelerFinalizeRequest } from '../../domain/companions'
import { useNotify } from '../../components/Feedback'
import { ConfirmDialog } from '../../components/Feedback'

const stateLabels = { pending: '待旅伴回覆', accepted: '等待旅客確認', countered: '旅伴提出新方案', confirmed: '已確認', rejected: '未承接', cancelled: '已取消', completed: '已完成' }
export function CompanionPage() {
  const state = useAppState(), notify = useNotify()
  const [tab, setTab] = useState<'traveler' | 'companion'>(state.role === 'companion' ? 'companion' : 'traveler')
  const [counterId, setCounterId] = useState<string | null>(null), [counterTime, setCounterTime] = useState('15:30'), [counterPrice, setCounterPrice] = useState(''), [reason, setReason] = useState('行程調整')
  const [counterDuration, setCounterDuration] = useState(90), [pendingCancel, setPendingCancel] = useState<string | null>(null)
  const person = state.companions.find(item => item.id === state.companionId) ?? state.companions[0]
  const requests = tab === 'traveler' ? state.serviceRequests.filter(item => item.travelerId === state.travelerId) : state.serviceRequests.filter(item => item.companionId === person.id)
  const act = (fn: () => ReturnType<typeof dispatch>, success: string) => { const result = fn(); notify(result.ok ? success : result.error.message, result.ok ? 'success' : 'error') }
  const cancel = (id: string) => { act(() => dispatch(current => cancelServiceRequest(current, { requestId: id, actor: tab, actorId: tab === 'traveler' ? current.travelerId : person.id, reason })), '服務需求已取消。'); setPendingCancel(null) }
  const respond = (id: string, action: 'accept' | 'reject') => act(() => dispatch(current => companionRespond(current, { requestId: id, companionId: person.id, action })), action === 'accept' ? '已回覆可承接，等待旅客確認。' : '已婉拒此需求。')
  const finalize = (id: string, action: 'confirm' | 'decline') => act(() => dispatch(current => travelerFinalizeRequest(current, { requestId: id, travelerId: current.travelerId, action })), '服務方案已更新。')
  const complete = (id: string) => act(() => dispatch(current => completeServiceRequest(current, id, person.id)), '服務已標記完成。')
  const addAvailability = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget, data = new FormData(form), date = String(data.get('date')), startTime = String(data.get('start')), endTime = String(data.get('end'))
    if (startTime >= endTime) { notify('結束時間必須晚於開始時間。', 'error'); return }
    const result = dispatch(current => {
      const companion = current.companions.find(item => item.id === person.id)!
      if (companion.availability.some(slot => slot.date === date && slot.startTime < endTime && startTime < slot.endTime)) return { ok: false as const, error: { code: 'overlap', message: '這段時間與既有可服務時段重疊。' } }
      const slot = { id: `slot-${crypto.randomUUID()}`, date, startTime, endTime }
      return { ok: true as const, value: { ...current, companions: current.companions.map(item => item.id === person.id ? { ...item, availability: [...item.availability, slot].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)) } : item) } }
    })
    notify(result.ok ? '可服務時段已新增。' : result.error.message, result.ok ? 'success' : 'error'); if (result.ok) form.reset()
  }
  const submitCounter = (id: string) => {
    act(() => dispatch(current => companionRespond(current, { requestId: id, companionId: person.id, action: 'counter', startTime: counterTime, durationMinutes: counterDuration, price: Number(counterPrice) || undefined, note: '旅伴提出的替代服務時間' })), '替代方案已送出，等待旅客回覆。')
    setCounterId(null)
  }
  return <section className="page-section editorial-wrap companion-workbench">
    <div className="page-title-row"><div><span className="eyebrow">LOCAL COMPANION / WORKSPACE</span><h1>在地旅伴工作台</h1><p>管理旅客需求、回覆可服務時間，並查看確認後的安排。</p></div><span className="page-count">DEMO <small>旅伴視角</small></span></div>
    <div className="workbench-person"><img src={person.avatar} alt="示意旅伴人物照片"/><div><span className="eyebrow">目前登入／展示角色</span><h2>{person.name}</h2><p>{person.serviceAreas.join('・')}　{person.languages.join('／')}</p></div><div><b>NT$ {person.ratePerHour}</b><small>每小時示意報價</small></div></div>
    <div className="workbench-tabs"><button className={tab === 'traveler' ? 'active' : ''} onClick={() => setTab('traveler')}>旅客端：我的需求</button><button className={tab === 'companion' ? 'active' : ''} onClick={() => setTab('companion')}>旅伴端：接單管理</button></div>
    {tab === 'companion' && <form className="availability-form" onSubmit={addAvailability}><div><span className="eyebrow">AVAILABILITY / SET YOUR TIME</span><h2>新增可服務時段</h2></div><label className="field-label">日期<input name="date" type="date" required defaultValue="2026-11-17"/></label><label className="field-label">開始<input name="start" type="time" required defaultValue="09:00"/></label><label className="field-label">結束<input name="end" type="time" required defaultValue="17:00"/></label><button className="button button-outline">儲存時段</button></form>}
    <div className="request-list">
      {requests.length ? requests.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(request => <article className="request-row" key={request.id}>
        <div className="request-main"><div className="request-topline"><span className={`status-pill status-${request.status}`}>{stateLabels[request.status]}</span><span>{request.date}・{request.startTime}・{request.durationMinutes} 分鐘</span></div><h3>{request.destination}・{request.meetingPoint}</h3><p>{request.language}／{request.service}／{request.partySize} 人・{tab === 'companion' ? '示意旅客' : state.companions.find(item => item.id === request.companionId)?.name}</p>{request.notes && <blockquote>「{request.notes}」</blockquote>}{request.proposed && <div className="proposal-box"><b>替代方案</b><span>{request.proposed.startTime}・{request.proposed.durationMinutes} 分鐘・NT$ {request.proposed.price.toLocaleString()}</span><small>{request.proposed.note}</small></div>}{request.cancelReason && <small>取消原因：{request.cancelReason}（{request.cancelSource === 'traveler' ? '旅客' : '旅伴'}）</small>}</div>
        <div className="request-actions"><b>NT$ {request.price.toLocaleString()}<small>示意服務費</small></b>
          {tab === 'companion' && request.status === 'pending' && <><button className="button button-primary" onClick={() => respond(request.id, 'accept')}>接受需求</button><button className="text-button" onClick={() => setCounterId(counterId === request.id ? null : request.id)}>提出其他時間／報價</button><button className="text-button danger-text" onClick={() => respond(request.id, 'reject')}>婉拒需求</button></>}
          {tab === 'traveler' && ['accepted', 'countered'].includes(request.status) && <><button className="button button-primary" onClick={() => finalize(request.id, 'confirm')}>確認服務條件</button><button className="text-button" onClick={() => finalize(request.id, 'decline')}>不接受方案</button></>}
          {tab === 'companion' && request.status === 'confirmed' && <button className="button button-outline" onClick={() => complete(request.id)}>標記服務完成</button>}
          {['pending', 'accepted', 'countered', 'confirmed'].includes(request.status) && <><label className="cancel-reason">取消原因<input value={reason} onChange={e => setReason(e.target.value)}/></label><button className="text-button danger-text" onClick={() => setPendingCancel(request.id)}>取消服務</button></>}
          {tab === 'traveler' && request.status === 'confirmed' && <p className="confirmed-note">已加入自由行行程・不會與草稿時間連動</p>}
        </div>
        {counterId === request.id && <form className="counter-form" onSubmit={e => { e.preventDefault(); submitCounter(request.id) }}><label className="field-label">建議時間<input type="time" value={counterTime} onChange={e => setCounterTime(e.target.value)}/></label><label className="field-label">服務時長<select value={counterDuration} onChange={e => setCounterDuration(Number(e.target.value))}>{[30,60,90,120,180,240].map(value=><option key={value} value={value}>{value} 分鐘</option>)}</select></label><label className="field-label">服務報價<input type="number" min="0" value={counterPrice} placeholder={String(request.price)} onChange={e => setCounterPrice(e.target.value)}/></label><button className="button button-primary">送出替代方案</button></form>}
      </article>) : <div className="empty-state"><span className="empty-number">／</span><h2>{tab === 'traveler' ? '還沒有旅伴預約需求' : '目前沒有新需求'}</h2><p>{tab === 'traveler' ? '找到合適的在地旅伴後，送出的需求會出現在這裡。' : '旅客送出需求後，符合時段的請求會顯示在工作台。'}</p></div>}
    </div>
    {tab === 'companion' && <div className="availability-list"><h2>目前可服務時段</h2>{person.availability.map(slot => <span key={slot.id}>{slot.date}　{slot.startTime}–{slot.endTime}</span>)}<p>服務範圍僅含一般同行、活動協助、語言溝通與地方資訊支援，不含依法須資格的導覽、載客接送及高風險活動。</p></div>}
    <ConfirmDialog open={!!pendingCancel} title="確定取消這筆旅伴服務？" description={`取消原因：${reason || '行程調整'}。取消後時段會重新開放給其他需求。`} confirmLabel="確認取消服務" danger onCancel={() => setPendingCancel(null)} onConfirm={() => pendingCancel && cancel(pendingCancel)} />
  </section>
}
