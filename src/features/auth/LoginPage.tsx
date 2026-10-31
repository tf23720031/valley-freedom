import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { photos } from '../../domain/photoSources'
import { loginDemo } from '../../store/appStore'
import { useAppState } from '../../store/AppStateProvider'
import { useNotify } from '../../components/Feedback'

export function LoginPage() {
  const state = useAppState(), navigate = useNavigate(), location = useLocation(), notify = useNotify()
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [showPassword, setShowPassword] = useState(false), [remember, setRemember] = useState(true)
  if (state.authenticated) return <Navigate to="/dashboard" replace />
  const enter = () => {
    loginDemo(remember)
    notify('已使用展示帳號登入。', 'success')
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
    navigate(from && from !== '/login' ? from : '/dashboard', { replace: true })
  }
  return <main className="login-page">
    <div className="login-photo" role="img" aria-label="花東山海與田野實景"><img src={photos.valley} alt="花蓮縱谷田野與山景"/><span>花蓮・瑞穗　／　花東縱谷</span><small>自由安排，沿途相遇</small></div>
    <section className="login-panel"><div className="login-inner"><span className="eyebrow">VALLEY FREEDOM / 展示原型</span><h1>回到你的旅程。</h1><p>登入後可保存行程，並在旅客、旅伴、業者與管理員視角間切換。</p>
      <form onSubmit={(event) => { event.preventDefault(); if (!email.trim() || !password) { notify('請輸入 Email 與 Password，或直接使用測試帳號。', 'error'); return } enter() }}>
        <label className="field-label">Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="demo@valleyfreedom.tw"/></label>
        <label className="field-label">Password<span className="password-field"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="展示用途，不驗證真實密碼"/><button type="button" aria-label={showPassword ? '隱藏密碼' : '顯示密碼'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff/> : <Eye/>}</button></span></label>
        <label className="remember-row"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)}/>記住此展示登入</label>
        <button className="button button-primary login-submit" type="submit">登入展示帳號</button>
      </form>
      <div className="login-divider"><span>OR LOGIN WITH</span></div>
      <button type="button" className="button button-test-account" onClick={enter}>直接使用測試帳號</button>
      <p className="login-note">這是單一瀏覽器的展示登入，不會驗證真實帳密。所有角色共用同一份示範資料。</p>
      <a className="login-back" href="/">返回公開網站</a>
    </div></section>
  </main>
}
