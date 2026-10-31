import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, Clock3, MapPin, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppState } from '../../store/AppStateProvider'
import { districts, type RegionId } from '../../domain/districts'
import { useHomeScrollStory } from '../../components/motion/useHomeScrollStory'
import { useHomeSectionReveals } from '../../components/motion/useHomeSectionReveals'

const regionImages: Record<RegionId, string> = {
  taroko: '/photos/valley-trail.webp',
  'coast-11': '/photos/river-study.webp',
  'valley-9': '/photos/valley-hero.webp',
  'south-link': '/photos/tea-harvest.webp',
}
const regionNotes: Record<RegionId, string> = {
  taroko: '峽谷步道、溪谷景觀與交通管制資訊。',
  'coast-11': '海岸景點分散，先確認交通與停靠方式。',
  'valley-9': '稻田、溫泉與小鎮，適合安排多段停留。',
  'south-link': '山線接海線，出發前確認班次和補給點。',
}
const heroSlides = [
  { image: '/photos/east-coast-hero.png', alt: '東海岸湛藍海水與峭壁的寬幅風景', label: '東海岸・旅行氛圍示意' },
  { image: '/photos/river-study.webp', alt: '溪谷與林地的旅行氛圍照片', label: '山線・旅行氛圍示意' },
  { image: '/photos/tea-harvest.webp', alt: '花東田野的旅行氛圍照片', label: '地方日常・旅行氛圍示意' },
]

export function HomePage() {
  const state = useAppState()
  const hero = useRef<HTMLElement>(null)
  const marquee = useRef<HTMLElement>(null)
  const home = useRef<HTMLDivElement>(null)
  const experienceDirectory = useRef<HTMLDivElement>(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeExperienceId, setActiveExperienceId] = useState('')
  const [mobileExperience, setMobileExperience] = useState<(typeof state.experiences)[number] | null>(null)
  const experiences = state.experiences.filter((experience) => experience.published).slice(0, 4)
  const activeExperience = experiences.find((experience) => experience.id === activeExperienceId) ?? experiences[0]
  const companions = state.companions.slice(0, 1)
  useHomeScrollStory(hero)
  useHomeScrollStory(marquee)
  useHomeSectionReveals(home)

  useEffect(() => {
    const root = experienceDirectory.current
    if (!root || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver((entries) => {
      const nearest = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0]
      const id = nearest?.target.getAttribute('data-experience-id')
      if (id) setActiveExperienceId(id)
    }, { rootMargin: '-32% 0px -45% 0px', threshold: 0 })
    root.querySelectorAll('[data-experience-id]').forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [state.experiences])

  useEffect(() => {
    if (!mobileExperience) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileExperience(null) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileExperience])

  const changeSlide = (direction: number) => setActiveSlide((current) => (current + direction + heroSlides.length) % heroSlides.length)

  return <div className="home-editorial" ref={home}>
    <section className="home-hero" aria-labelledby="home-title" ref={hero}>
      <div className="hero-image-frame" role="region" aria-label="花東旅行影像" aria-roledescription="圖片輪播">
        {heroSlides.map((slide, index) => <img key={slide.image} className={`home-hero-photo${index === activeSlide ? ' is-active' : ''}`} src={slide.image} alt={slide.alt} aria-hidden={index !== activeSlide} fetchPriority={index === 0 ? 'high' : undefined} loading={index === 0 ? 'eager' : 'lazy'} onError={(event) => { event.currentTarget.style.background = 'linear-gradient(145deg,#788c77,#243e32)' }} />)}
      </div>
      <div className="hero-content">
        <span className="hero-kicker">EASTERN TAIWAN / 23°N</span>
        <h1 id="home-title" aria-label="東岸一季"><span>東岸</span><span>一季</span></h1>
        <p>不跟團、不趕行程。<br />想找人同行，也可以。</p>
      </div>
      <div className="hero-coordinate"><span>花蓮 → 臺東</span><b>島嶼東側・自由移動</b></div>
      <nav className="hero-ctas" aria-label="開始規劃">
        <Link to="/companions" className="hero-entry hero-entry-companion">找旅伴 <ArrowRight size={17} /></Link>
        <Link to="/itinerary" className="hero-entry hero-entry-itinerary">排自己的行程 <ArrowDownRight size={17} /></Link>
      </nav>
      <div className="hero-slide-controls" aria-label="切換旅行照片">
        <button type="button" onClick={() => changeSlide(-1)} aria-label="上一張照片">←</button>
        <span aria-live="polite">0{activeSlide + 1}<i />0{heroSlides.length}</span>
        <button type="button" onClick={() => changeSlide(1)} aria-label="下一張照片">→</button>
      </div>
      <div className="hero-caption"><span>花東・旅行提案</span><span>{heroSlides[activeSlide].label}</span></div>
      <a href="#home-story" className="hero-scroll" aria-label="向下探索"><span>SCROLL TO EXPLORE</span><ArrowDown size={15} /></a>
    </section>
    <div className="hero-word-band" aria-hidden="true"><div className="word-marquee-track hero-word-marquee"><div className="word-marquee-group hero-word-strip"><span>GO YOUR WAY</span><span>EASTERN ISLAND</span><span>NO FIXED ROUTE</span></div><div className="word-marquee-group hero-word-strip"><span>GO YOUR WAY</span><span>EASTERN ISLAND</span><span>NO FIXED ROUTE</span></div></div></div>

    <section id="home-story" className="home-story home-story-collage editorial-wrap" data-story-panel>
      <div className="home-story-index"><span>旅行的方式</span><b>01</b></div>
      <div className="home-story-copy"><h2>你的行程<br />你決定</h2><p>想去哪裡，由你安排。排好日期與交通，行程空檔也能直接找旅伴。</p><Link to="/itinerary" className="story-margin-link">打開我的行程 <ArrowUpRight size={16} /></Link></div>
      <figure className="home-story-image home-story-image-main"><img src="/photos/river-study.webp" alt="溪水與山林的旅行氛圍照片，非特定場域實景" loading="lazy" /><figcaption>旅行素材／氛圍示意</figcaption></figure>
      <figure className="home-story-image home-story-image-small"><img src="/photos/pomelo-orchard.webp" alt="花東果園氛圍照片，非特定場域實景" loading="lazy" /><figcaption>地方日常・示意</figcaption></figure>
    </section>

    <section className="home-marquee home-marquee-forest" aria-label="花東視覺文字敘事" ref={marquee}>
      <div className="marquee-row marquee-row-centered marquee-row-one"><span className="marquee-word marquee-word-wide">GO EAST.</span><figure className="marquee-photo marquee-photo-tall"><img src="/photos/river-study.webp" alt="" loading="lazy" /></figure><span className="marquee-word marquee-word-light">山線 / 海線</span></div>
      <div className="marquee-row marquee-row-centered marquee-row-two"><span className="marquee-word marquee-word-chinese">花東，</span><figure className="marquee-photo marquee-photo-small"><img src="/photos/valley-trail.webp" alt="花東山徑氛圍照片／非特定場域實景" loading="lazy" /></figure><span className="marquee-word marquee-word-chinese marquee-word-medium">自由走。</span></div>
      <div className="marquee-row marquee-row-centered marquee-row-three"><span className="marquee-word marquee-word-light">YOUR WAY.</span><figure className="marquee-photo marquee-photo-wide"><img src="/photos/tea-harvest.webp" alt="花東田野氛圍照片／非特定場域實景" loading="lazy" /></figure><span className="marquee-word marquee-word-wide">NO FIXED ROUTE.</span></div>
      <span className="marquee-disclosure">照片為氛圍示意・非特定場域實景</span>
    </section>

    <section className="home-regions home-regions-light" aria-labelledby="regions-title">
      <div className="regions-header editorial-wrap"><div><span className="section-overline">花蓮到臺東・四段路線</span><h2 id="regions-title">走山線<br />還是海線</h2></div><p>四種走法。先看路線，再決定要停多久、怎麼移動。路況與開放資訊請以官方公告為準。</p></div>
      <div className="route-directory editorial-wrap">
        {districts.map((region, index) => <article className="route-directory-item" key={region.id}>
          <Link to={`/explore/${region.id}`} className="route-directory-link" aria-label={`探索${region.name}`}>
            <span className="route-directory-index">0{index + 1}</span><img src={regionImages[region.id]} alt={`${region.name}旅行氛圍示意照片，非場域實景`} loading="lazy" />
            <div className="route-directory-copy"><span className="region-route">{region.road}</span><h3>{region.name}</h3><p>{regionNotes[region.id]}</p><small>建議停留與交通規劃・示意</small></div><ArrowUpRight className="region-arrow" size={21} />
          </Link>
        </article>)}
      </div>
      <div className="regions-foot editorial-wrap"><span>照片與行程提示為展示示意；場域及交通資訊請出發前查證。</span><Link to="/explore">查看四區資料 <ArrowRight size={16} /></Link></div>
    </section>

    <section className="home-inspiration" aria-labelledby="inspiration-title">
      <div className="inspiration-layout editorial-wrap">
        <aside className="inspiration-sticky" aria-live="polite" aria-atomic="true">
          <span className="section-overline">地方體驗・示意資料</span>
          <h2 id="inspiration-title">先看看有什麼</h2>
          {activeExperience && <div className="inspiration-active-copy" key={activeExperience.id}>
            <span>{activeExperience.category}／{activeExperience.location}</span>
            <h3>{activeExperience.title}</h3>
            <p>{activeExperience.description}</p>
            <div className="inspiration-active-facts"><span><Clock3 size={15} /> 建議停留 {activeExperience.durationMinutes} 分鐘・示意</span><b>NT$ {activeExperience.price.toLocaleString()} <small>費用示意</small></b></div>
            <Link to={`/experiences/${activeExperience.id}`}>查看體驗內容 <ArrowUpRight size={16} /></Link>
          </div>}
          <Link className="inspiration-all-link" to="/experiences">瀏覽全部體驗 <ArrowRight size={16} /></Link>
        </aside>
        <div className="experience-directory experience-directory-stack" ref={experienceDirectory}>
          {experiences.map((experience, index) => <Link to={`/experiences/${experience.id}`} className="experience-directory-link" data-experience-id={experience.id} key={experience.id} onClick={(event) => {
            if (window.innerWidth <= 760) { event.preventDefault(); setMobileExperience(experience) }
          }}>
            <figure className="experience-directory-art"><img src={experience.image} alt={`${experience.title}的示意照片`} loading="lazy" /><figcaption><span>{experience.category}／{experience.location}</span><b>0{index + 1}</b><strong>{experience.title}</strong></figcaption></figure>
            <div className="experience-directory-copy"><h3>{experience.title}</h3><p>{experience.description}</p><div><span><Clock3 size={14} /> {experience.durationMinutes} 分鐘・示意</span><b>NT$ {experience.price.toLocaleString()} <small>費用示意</small></b></div></div><ArrowUpRight className="experience-directory-arrow" size={19} />
          </Link>)}
        </div>
      </div>
      {mobileExperience && <div className="experience-preview-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileExperience(null) }}>
        <section className="experience-preview-modal" role="dialog" aria-modal="true" aria-labelledby="experience-preview-title" aria-label={mobileExperience.title}>
          <button className="experience-preview-close" type="button" aria-label="關閉介紹" onClick={() => setMobileExperience(null)}><X size={20} /></button>
          <img src={mobileExperience.image} alt={`${mobileExperience.title}的示意照片`} />
          <div className="experience-preview-copy"><span>{mobileExperience.category}／{mobileExperience.location}・示意資料</span><h2 id="experience-preview-title">{mobileExperience.title}</h2><p>{mobileExperience.description}</p><div><span><Clock3 size={15} /> 建議停留 {mobileExperience.durationMinutes} 分鐘</span><b>NT$ {mobileExperience.price.toLocaleString()} <small>費用示意</small></b></div><Link className="button button-primary" to={`/experiences/${mobileExperience.id}`}>前往體驗詳情 <ArrowUpRight size={16} /></Link></div>
        </section>
      </div>}
    </section>

    <section className="home-companions" aria-labelledby="companions-title">
      <div className="companions-heading editorial-wrap"><div><span className="section-overline">旅伴服務・展示原型</span><h2 id="companions-title">這段路<br />找人一起</h2></div><p>可詢問一般同行、語言溝通或地方資訊。人物、服務、費用與時段皆為示意，尚未完成身份或資格查核。</p></div>
      <div className="companion-stage editorial-wrap">
        <span className="companion-ghost-type" aria-hidden="true">TRAVEL<br />TOGETHER</span>
        {companions.map((person, index) => <article className={`companion-editorial companion-editorial-${index + 1}`} key={person.id}>
          <Link to={`/companions?companion=${person.id}`} className="companion-portrait companion-cutout"><img src={index === 0 ? '/photos/companion-lin-cutout.webp' : '/photos/companion-chen-cutout.webp'} alt={`${person.name}示意人物去背照片，非實際媒合旅伴`} loading="lazy" /><span>示意人物・非實際媒合</span></Link>
          <div className="companion-editorial-copy"><span>{person.serviceAreas.join('・')}</span><h3>{person.name}</h3><p>{person.bio}</p><div className="companion-details"><span>{person.languages.join('／')}</span><span>NT$ {person.ratePerHour.toLocaleString()}／小時・示意報價</span></div><Link to={`/companions?companion=${person.id}`}>查看服務資訊 <ArrowRight size={15} /></Link></div>
        </article>)}
        <div className="companion-service-note"><b>怎麼預約</b><p>選日期、時間和地點送出詢問；雙方確認服務內容與費用後再決定是否成行。</p><Link to="/companions">查看旅伴服務 <ArrowUpRight size={16} /></Link></div>
      </div>
      <Link className="companions-more" to="/companions">瀏覽旅伴示意資料 <ArrowUpRight size={16} /></Link>
    </section>

    <section className="home-gap" aria-labelledby="gap-title">
      <div className="gap-photo-accents" aria-hidden="true"><span className="gap-photo-coast"/><span className="gap-photo-river"/><span className="gap-photo-valley"/><span className="gap-photo-left-large"/><span className="gap-photo-left-small"/></div>
      <div className="home-gap-content editorial-wrap"><div className="gap-intro"><span className="section-overline">FIND YOUR GAP</span><h2 id="gap-title">這裡有空<br />要找旅伴嗎</h2><p>排好行程後，空檔會列出日期、起訖時間和地區。按一下就能帶入旅伴搜尋。</p><Link className="button button-primary" to="/itinerary">安排我的行程 <ArrowRight size={17} /></Link></div>
      <div className="gap-sample" aria-label="行程空檔示意"><div className="gap-sample-head"><span>DAY 02 / 行程示意</span><span>瑞穗・地點示意</span></div><div className="gap-stop"><span>10:00</span><i /><div><b>上午活動</b><small>安排一個想去的地方・示意</small></div></div><div className="gap-stop"><span>12:00</span><i /><div><b>午餐與補給</b><small>用餐時間・示意</small></div></div><div className="gap-window"><span className="gap-window-line" /><div><small>留白時段・示意</small><b>14:00 — 15:30</b><span><Clock3 size={14} /> 90 分鐘可安排</span><Link to="/itinerary">在行程裡找旅伴 <ArrowRight size={15} /></Link></div></div><div className="gap-stop"><span>16:00</span><i /><div><b>下一個行程</b><small>尚未安排・示意</small></div></div><p>時段僅為操作示意；實際空檔依你儲存的活動計算。</p></div></div>
    </section>

    <div className="final-word-band" aria-hidden="true"><div className="word-marquee-track final-word-marquee"><div className="word-marquee-group final-word-strip"><span>GO EAST</span><span>TAKE YOUR TIME</span><span>YOUR WAY</span></div><div className="word-marquee-group final-word-strip"><span>GO EAST</span><span>TAKE YOUR TIME</span><span>YOUR WAY</span></div></div></div>
    <section className="home-final-cta" aria-labelledby="final-title">
      <img className="final-cta-photo" src="/photos/valley-trail.webp" alt="花東山景氛圍照片，非導航地圖" loading="lazy" />
      <div className="final-cta-content"><span className="section-overline">花蓮・臺東</span><h2 id="final-title">下一站<br />去哪</h2><p>先選一條路，再把想做的事排進去。</p></div>
      <div className="final-action-panels"><Link className="final-panel final-panel-plan" to="/itinerary"><span>01 / PLAN</span><b>排進行程</b><ArrowUpRight size={24} /></Link><Link className="final-panel final-panel-companion" to="/companions"><span>02 / TOGETHER</span><b>找旅伴</b><ArrowUpRight size={24} /></Link><Link className="final-panel final-panel-explore" to="/explore"><span>03 / EXPLORE</span><b>看四段路線</b><ArrowUpRight size={24} /></Link></div>
      <span className="final-landscape-label">花東旅行氛圍示意・非導航地圖</span>
    </section>

    <p className="home-legal editorial-wrap"><MapPin size={15} /> 所有旅伴、人物照片、體驗、價格和時段皆為展示用示意資料。旅伴服務不包含依法須資格的專業導覽、載客接送或高風險活動。</p>
  </div>
}
