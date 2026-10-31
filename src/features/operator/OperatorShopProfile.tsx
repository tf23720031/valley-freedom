import { useState } from 'react'
import { dispatch } from '../../store/appStore'
import { useAppState } from '../../store/AppStateProvider'
import { useNotify } from '../../components/Feedback'

export function OperatorShopProfile() {
  const state = useAppState(), notify = useNotify(), [profile, setProfile] = useState(state.shopProfile)
  const save = (event: React.FormEvent) => { event.preventDefault(); const result = dispatch((current) => ({ ok: true as const, value: { ...current, shopProfile: { ...profile, name: profile.name.trim(), introduction: profile.introduction.trim() } } })); notify(result.ok ? '店家資料已保存到本機示範資料。' : '店家資料儲存失敗。', result.ok ? 'success' : 'error') }
  return <section className="shop-profile"><span className="eyebrow">SHOP PROFILE / DEMO</span><h2>{profile.name}</h2><p>主要展示業者資料。公開資訊可編輯保存；未確認欄位保留空白。</p><form onSubmit={save}>
    <label className="field-label">店家名稱<input required value={profile.name} onChange={(e)=>setProfile({...profile,name:e.target.value})}/></label>
    <label className="field-label">介紹<textarea rows={4} value={profile.introduction} onChange={(e)=>setProfile({...profile,introduction:e.target.value})}/></label>
    <label className="field-label">地址<input value={profile.address} onChange={(e)=>setProfile({...profile,address:e.target.value})}/></label>
    <label className="field-label">聯絡方式<input value={profile.contact} placeholder="待補：未確認公開聯絡方式" onChange={(e)=>setProfile({...profile,contact:e.target.value})}/></label>
    <label className="field-label">官方網站或社群<input type="url" value={profile.website} onChange={(e)=>setProfile({...profile,website:e.target.value})}/></label>
    <button className="button button-primary" type="submit">儲存店家資料</button>
  </form><p className="source-note">介紹、場址與服務資訊參考店家公開頁面：<a href="https://www.838.url.tw/index.html" target="_blank" rel="noreferrer">木日光文旦驛站官方網站</a>。聯絡電話未填，未查得前不自行補寫。此展示不代表已取得合作同意。</p></section>
}
