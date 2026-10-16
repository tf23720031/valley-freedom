import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { ArrowUpRight, Menu, RotateCcw, X } from 'lucide-react'
import { useAppState } from '../store/AppStateProvider'
import { getStoreWarning, resetDemoData, setRole } from '../store/appStore'
import type { Role } from '../domain/types'
import { ConfirmDialog, useNotify } from './Feedback'

const links: Record<Role, Array<[string, string]>> = {
  traveler: [['/experiences', '地方體驗'], ['/itinerary', '自由旅程'], ['/bookings', '我的預約'], ['/muri-sunshine', '木日光'], ['/co-create', '地方共創']],
  youth: [['/youth', '青年工作台'], ['/experiences', '地方體驗'], ['/co-create', '地方共創']],
  operator: [['/operator', '營運概覽'], ['/operator/experiences', '體驗與場次'], ['/operator/bookings', '預約管理'], ['/operator/tasks', '青年協作'], ['/co-create', '新體驗共創']],
}
const roleLabels: Record<Role, string> = { traveler: '旅客', youth: '青年', operator: '業者' }
export function BrandShell() {
  const state = useAppState()
  const notify = useNotify()
  const [menuOpen, setMenuOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const warning = getStoreWarning()
  return <div className="site-frame">
    <header className="site-header">
      <Link to="/" className="brand-lockup" onClick={() => setMenuOpen(false)} aria-label="縱谷自由行動所首頁"><span className="brand-emblem" aria-hidden="true"><span /></span><span className="brand-copy"><b>縱谷自由行動所</b><small>VALLEY FREEDOM</small></span></Link>
      <button className="mobile-menu-toggle" aria-label={menuOpen ? '關閉導覽' : '開啟導覽'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X /> : <Menu />}</button>
      <nav className={`primary-nav ${menuOpen ? 'is-open' : ''}`} aria-label="主要導覽">{links[state.role].map(([href, label]) => <NavLink key={href} to={href} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{label}</NavLink>)}</nav>
      <div className="header-tools"><label className="role-select-label"><span>展示視角</span><select aria-label="切換展示角色" value={state.role} onChange={(event) => { setRole(event.target.value as Role); notify(`已切換為${roleLabels[event.target.value as Role]}視角`, 'info') }}>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="reset-button" onClick={() => setResetOpen(true)} aria-label="重置示範資料"><RotateCcw size={15} /><span>重置資料</span></button></div>
    </header>
    {warning && <div className="storage-warning" role="status">{warning}</div>}
    <div className="demo-strip"><span>原型示意資料</span><i /> 體驗、價格與營運數據均為展示用途，照片為 AI 生成示意影像 <span className="strip-note">資料保存在目前瀏覽器，不提供多人即時交易保證</span></div>
    <main id="main-content"><Outlet /></main>
    <footer className="site-footer"><Link to="/" className="footer-brand">縱谷自由行動所 <small>VALLEY FREEDOM</small></Link><p>把地方日常，重新組成自由旅程。</p><span>花蓮・瑞穗・花東縱谷</span><a href="#main-content" className="top-link">回到頁首 <ArrowUpRight size={14} /></a></footer>
    <ConfirmDialog open={resetOpen} title="重置所有示範資料？" description="這會清除目前瀏覽器中的預約、行程、任務及共創修改，並還原初始展示資料。此操作無法復原。" confirmLabel="重置示範資料" danger onCancel={() => setResetOpen(false)} onConfirm={() => { resetDemoData(); setResetOpen(false); notify('示範資料已重置。') }} />
  </div>
}
