import { Link } from 'react-router-dom'
import { useAppState } from '../../store/AppStateProvider'
import { districts } from '../../domain/districts'
import { useNotify } from '../../components/Feedback'

export function AdminOverviewPage() {
  const state = useAppState(), notify = useNotify()
  const counts = [
    ['旅客帳號', new Set(state.bookings.map((booking) => booking.travelerId).concat(state.itineraries.map((plan) => plan.travelerId))).size],
    ['旅伴人員', state.companions.length],
    ['業者工作台示範據點', 1],
    ['已發布體驗', state.experiences.filter((item) => item.published).length],
    ['預約總數', state.bookings.length],
    ['待確認預約', state.bookings.filter((item) => item.status === 'pending').length],
    ['旅伴需求', state.companionDemands.length],
    ['已媒合需求', state.companionDemands.filter((item) => item.status === 'matched').length],
    ['青年協作任務', state.tasks.length],
  ] as const
  const applications = state.demandApplications.length
  return <section className="page-section editorial-wrap admin-overview"><div className="page-title-row"><div><span className="eyebrow">PLATFORM / ADMIN</span><h1>全平台總覽</h1><p>以下數字由目前瀏覽器的示範資料計算；不代表實際使用者或合作成果。</p></div><span className="page-count">ADMIN <small>管理員視角</small></span></div>
    <div className="admin-summary-grid">{counts.map(([label,value])=><article key={label}><span>{label}</span><b>{value}</b></article>)}</div>
    <div className="admin-data-note">目前有 {applications} 筆旅伴需求申請。所有角色共用本機示範資料，不提供多人即時同步。</div>
    <section className="admin-partners"><div className="section-heading"><div><span className="eyebrow">VENUE DIRECTORY</span><h2>合作店家管理</h2></div><p>17 個候選場域與已確認合作業者分開統計。</p></div>
      <div className="partner-status-note"><b>已取得合作同意：0 家</b><span>木日光文旦驛站為業者工作台示範據點，展示不表示已有合作承諾。</span></div>
      <article className="admin-shop-row"><div><h3>{state.shopProfile.name}</h3><p>{state.shopProfile.region}・展示資料</p><small>資料完整度：{[state.shopProfile.name,state.shopProfile.introduction,state.shopProfile.address,state.shopProfile.contact,state.shopProfile.website].filter(Boolean).length}/5 欄；聯絡方式待補</small></div><span className="status-pill status-pending">合作未確認</span><span>已上架體驗 {state.experiences.filter((item)=>item.published).length} 項</span><Link className="text-link" to="/operator/shop">查看店家資料</Link></article>
      <details className="candidate-venues"><summary>查看 17 個候選場域（不代表已合作）</summary>{districts.map((region)=><div key={region.id}><h3>{region.name}</h3><ul>{region.places.map((place)=><li key={place.id}>{place.name}　<span>{place.verificationStatus==='verified'?'資料已核對':place.verificationStatus==='partial'?'部分核對':'待確認'}</span></li>)}</ul></div>)}</details>
    </section>
    <div className="admin-shortcuts"><Link className="button button-primary" to="/admin/growth">店家成長與補助</Link><button className="button button-outline" onClick={()=>notify('角色資料已共用；切換角色可查看對應工作台。','info')}>查看協作說明</button></div>
  </section>
}
