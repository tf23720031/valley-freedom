import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, X } from 'lucide-react'
import { useAppState } from '../../store/AppStateProvider'
import { loginDemo } from '../../store/appStore'
import { useNotify } from '../../components/Feedback'
import { useOpenLoginModal } from '../../components/LoginModalContext'

export function LoginPage() {
  const open = useOpenLoginModal()
  const location = useLocation()
  useEffect(() => { open(location.pathname === '/login' ? undefined : location.pathname) }, [open, location.pathname])
  return null
}

export function LoginModal({ open, returnTo, onClose }: { open: boolean; returnTo: string; onClose: () => void }) {
  const state = useAppState(), notify = useNotify(), navigate = useNavigate()
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [showPassword, setShowPassword] = useState(false), [remember, setRemember] = useState(true)
  const dialog = useRef<HTMLElement>(null)
  const close = useRef(onClose); close.current = onClose
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusables = () => Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])') ?? [])
    focusables()[0]?.focus()
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); return }
      if (event.key !== 'Tab') return
      const items = focusables(); if (!items.length) return
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus() }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus() }
    }
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = overflow; previous?.focus() }
  }, [open])
  if (!open || state.authenticated) return null
  const enter = () => {
    loginDemo(remember)
    notify('已使用展示帳號登入。', 'success')
    onClose()
    navigate(returnTo && returnTo !== '/login' ? returnTo : '/dashboard', { replace: true })
  }
  return <div className="login-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="login-modal" ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="login-title"><button className="login-modal-close" aria-label="關閉登入" onClick={onClose}><X/></button><span className="eyebrow">VALLEY FREEDOM / 展示原型</span><h2 id="login-title">登入 VALLEY FREEDOM</h2><p>登入後可保存行程，並在四種展示視角間切換。</p><form onSubmit={(event) => { event.preventDefault(); if (!email.trim() || !password) { notify('請輸入 Email 與 Password，或直接使用測試帳號。', 'error'); return } enter() }}><label className="field-label">Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="demo@valleyfreedom.tw"/></label><label className="field-label">Password<span className="password-field"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="展示用途，不驗證真實密碼"/><button type="button" aria-label={showPassword ? '隱藏密碼' : '顯示密碼'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff/> : <Eye/>}</button></span></label><label className="remember-row"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)}/>記住此展示登入</label><button className="button button-primary login-submit" type="submit">登入展示帳號</button></form><div className="login-divider"><span>OR LOGIN WITH</span></div><button type="button" className="button button-test-account" onClick={enter}>直接使用測試帳號</button><small className="login-note">單一瀏覽器展示登入，不驗證真實帳密；各角色共用示範資料。</small></section></div>
}
