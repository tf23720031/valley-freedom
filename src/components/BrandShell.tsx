import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Menu, RotateCcw, X } from 'lucide-react'
import { useAppState } from '../store/AppStateProvider'
import { getStoreWarning, logoutDemo, resetDemoData, setRole } from '../store/appStore'
import type { Role } from '../domain/types'
import { ConfirmDialog, useNotify } from './Feedback'
import { RouteTransition } from './motion/RouteTransition'
import { ScrollProgress } from './ScrollProgress'

const links: Record<Role, Array<[string, string]>> = {
  traveler: [['/explore', '沿著花東走'], ['/explore/map', '路線地圖'], ['/experiences', '地方體驗'], ['/companions', '找在地旅伴'], ['/companions/requests', '旅伴需求廣場'], ['/itinerary', '我的自由行'], ['/bookings', '我的預約']],
  companion: [['/explore', '沿著花東走'], ['/companions/requests', '公開需求'], ['/companion', '旅伴工作台'], ['/youth', '協作任務'], ['/experiences', '地方體驗']],
  operator: [['/explore', '沿著花東走'], ['/operator', '營運概覽'], ['/operator/experiences', '體驗與場次'], ['/operator/bookings', '預約管理'], ['/operator/tasks', '協作任務'], ['/operator/shop', '店家資料'], ['/co-create', '新體驗共創']],
  admin: [['/explore', '沿著花東走'], ['/admin', '全平台總覽'], ['/admin/growth', '店家成長管理']],
}
const roleLabels: Record<Role, string> = { traveler: '旅客', companion: '在地旅伴', operator: '業者', admin: '管理員' }
export function BrandShell() {
  const state = useAppState()
  const notify = useNotify()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const warning = getStoreWarning()
  return <div className="site-frame">
    <ScrollProgress />
    <header className="site-header">
      <Link to="/" className="brand-lockup" onClick={() => setMenuOpen(false)} aria-label="縱谷自由行動所首頁"><span className="brand-emblem" aria-hidden="true"><span /></span><span className="brand-copy"><b>縱谷自由行動所</b><small>VALLEY FREEDOM</small></span></Link>
      <button className="mobile-menu-toggle" aria-label={menuOpen ? '關閉導覽' : '開啟導覽'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X /> : <Menu />}</button>
      <nav className={`primary-nav ${menuOpen ? 'is-open' : ''}`} aria-label="主要導覽">{links[state.role].filter(([href]) => state.authenticated || !['/itinerary','/bookings','/companion','/companions/requests','/operator','/operator/experiences','/operator/bookings','/operator/tasks','/operator/shop','/co-create','/admin','/admin/growth'].includes(href)).map(([href, label]) => <NavLink key={href} to={href} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{label}</NavLink>)}</nav>
      <div className="header-tools">{state.authenticated ? <><label className="role-select-label"><span>展示視角</span><select aria-label="切換展示角色" value={state.role} onChange={(event) => { const role = event.target.value as Role; setRole(role); notify(`已切換為${roleLabels[role]}視角`, 'info'); navigate(role === 'traveler' ? '/itinerary' : role === 'companion' ? '/companion' : role === 'operator' ? '/operator' : '/admin') }}>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="reset-button logout-button" onClick={() => { logoutDemo(); navigate('/'); notify('已登出展示帳號，示範資料保留。', 'info') }}>登出</button><button className="reset-button" onClick={() => setResetOpen(true)} aria-label="重置示範資料"><RotateCcw size={15} /><span>重置資料</span></button></> : <Link className="button button-outline header-login" to="/login">測試登入</Link>}</div>
    </header>
    {warning && <div className="storage-warning" role="status">{warning}</div>}
    <div className="demo-strip"><span>展示原型</span><i /> 人員、服務與價格皆為示意資料；人物照片不是實際媒合旅伴，尚未完成身份或資格查核 <span className="strip-note">資料保存在本瀏覽器，不提供多人即時媒合、付款或交易保證</span></div>
    <main id="main-content"><RouteTransition><Outlet /></RouteTransition></main>
    <footer className="site-footer"><Link to="/" className="footer-brand">縱谷自由行動所 <small>VALLEY FREEDOM</small></Link><p>自行安排行程，也能從空檔找旅伴。</p><span>花蓮・瑞穗・花東縱谷</span><a href="#main-content" className="top-link">回到頁首 <ArrowUpRight size={14} /></a></footer>
    <ConfirmDialog open={resetOpen} title="重置所有示範資料？" description="這會清除目前瀏覽器中的預約、行程、任務及共創修改，並還原初始展示資料。此操作無法復原。" confirmLabel="重置示範資料" danger onCancel={() => setResetOpen(false)} onConfirm={() => { resetDemoData(); setResetOpen(false); notify('示範資料已重置。') }} />
  </div>
}
