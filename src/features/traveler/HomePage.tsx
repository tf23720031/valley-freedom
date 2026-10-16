import { ArrowDown, ArrowRight, ArrowUpRight, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppState } from '../../store/AppStateProvider'

export function HomePage() {
  const state = useAppState()
  const featured = state.experiences.filter((experience) => experience.featured).slice(0, 3)
  return <>
    <section className="hero editorial-wrap">
      <div className="hero-copy"><span className="eyebrow"><i /> HUALIEN · RUISUI · 23°30′N</span><h1>把縱谷的日常，<br /><em>組成</em>自己的旅程。</h1><p>不是一張排好的旅遊清單，而是從一片果園、一雙手、一段故事開始，慢慢拼出你想停留的地方。</p><div className="hero-actions"><Link className="button button-primary" to="/experiences">探索地方體驗 <ArrowRight size={16} /></Link><Link className="text-link" to="/itinerary">開始組合旅程 <ArrowUpRight size={15} /></Link></div><span className="hero-index">01 / A SLOW JOURNEY</span></div>
      <div className="hero-art"><img src="/photos/valley-hero.webp" alt="晨光中的瑞穗縱谷、文旦果園與遠方山脈"/><span className="art-caption">瑞穗・舞鶴台地 <b>示意影像・AI 生成</b></span><span className="art-seal" aria-hidden="true">日常<br />縱谷</span></div>
      <a href="#featured" className="hero-down" aria-label="往下探索"><ArrowDown size={16}/><span>向下探索</span></a>
      <div className="hero-side-note">地方微體驗・自由旅程・青年共創</div>
    </section>

    <section className="intro-band editorial-wrap"><p className="eyebrow">A PLACE, REASSEMBLED</p><div><h2>地方不是目的地。<br/><em>地方是正在發生的生活。</em></h2><p>縱谷自由行動所把原有的人、空間、技術、商品與故事，重新組合成可以預約、參與、持續發生的地方日常。</p></div><span className="intro-mark"><Sprout strokeWidth={1}/></span></section>

    <section className="featured-section editorial-wrap" id="featured"><div className="section-heading"><div><span className="eyebrow">LOCAL MICRO EXPERIENCES / 01</span><h2>從一件小事，開始認識這裡</h2></div><Link className="text-link" to="/experiences">看全部體驗 <ArrowRight size={16}/></Link></div><div className="experience-grid home-grid">{featured.map((item, index) => <Link className={`experience-card home-card card-offset-${index}`} to={`/experiences/${item.id}`} key={item.id}><div className="card-art"><img src={item.image} alt=""/><span className="card-no">0{index + 1}</span><span className="card-tag">{item.category}</span></div><div className="card-body"><h3>{item.title}</h3><p>{item.description}</p><div className="card-meta"><span>{item.durationMinutes} 分鐘</span><span>{item.price ? `NT$ ${item.price.toLocaleString()}` : '自由參與'}</span></div></div></Link>)}</div></section>

    <section className="journey-callout editorial-wrap"><div className="journey-illustration"><img src="/photos/pomelo-orchard.webp" alt="瑞穗文旦果園裡的果實與山巒"/><span>採集・品嚐・停留</span></div><div className="journey-copy"><span className="eyebrow">YOUR OWN PACE / 02</span><h2>留一點空白，<br/><em>旅程才有自己的形狀。</em></h2><p>挑選喜歡的體驗，調整順序與時間，也可以放進一段自由散步。你的行程，不必像任何人的行程。</p><Link className="button button-outline" to="/itinerary">打開自由旅程組合器 <ArrowRight size={16}/></Link></div><span className="callout-note">FIELD NOTE 018</span></section>

    <section className="place-story editorial-wrap"><div className="place-number">02 <span>／ 04</span></div><div className="place-copy"><span className="eyebrow">MURI SUNSHINE / ABOUT THE PLACE</span><h2>一顆文旦的季節，<br/>連起一整個地方。</h2><p>木日光從文旦產業出發，讓食農教育、地方飲食與場域故事成為可以一起參與的日常。這裡是地方關係的起點，也是新的體驗慢慢成形的地方。</p><Link className="text-link" to="/muri-sunshine">讀木日光的地方筆記 <ArrowUpRight size={15}/></Link></div><div className="place-image"><img src="/photos/pomelo-orchard.webp" alt="木日光果園的文旦與遠方山線"/><span>木日光文旦驛站・瑞穗</span></div></section>

    <section className="co-create-banner"><div className="co-create-inner editorial-wrap"><span className="eyebrow">PEOPLE / PLACE / POSSIBILITY</span><h2>讓地方原本擁有的，<br/><em>長成還沒出現過的體驗。</em></h2><p>青年與在地夥伴一起盤點資源、試做服務，也一起工作、學習，讓合作有新的可能。</p><Link to="/co-create" className="button button-light">看看地方如何共創 <ArrowRight size={16}/></Link><span className="banner-ornament" aria-hidden="true">山・田・人</span></div></section>
    <div className="home-endnote"><span>VALLEY FREEDOM / FIELD ARCHIVE</span><span>示意資料・設計原型</span></div>
  </>
}
