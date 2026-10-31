import { Component, Suspense, lazy, useEffect, useState, type ReactNode } from 'react'

const LandscapeScene = lazy(() => import('./LandscapeScene'))

function shouldUseWebGL() {
  if (typeof window.matchMedia !== 'function') return false
  const smallScreen = window.matchMedia('(max-width: 760px)').matches
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
  return !smallScreen && !reducedMotion && !saveData
}

function useLandscapePreference() {
  const [enabled, setEnabled] = useState(shouldUseWebGL)
  const [nearViewport, setNearViewport] = useState(false)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const small = window.matchMedia('(max-width: 760px)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setEnabled(shouldUseWebGL())
    small.addEventListener?.('change', update)
    reduced.addEventListener?.('change', update)
    window.addEventListener('resize', update, { passive: true })
    return () => {
      small.removeEventListener?.('change', update)
      reduced.removeEventListener?.('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])
  useEffect(() => {
    const target = document.querySelector('.landscape-window')
    if (!target || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNearViewport(true); observer.disconnect() }
    }, { rootMargin: '320px 0px' })
    observer.observe(target)
    return () => observer.disconnect()
  }, [])
  return enabled && nearViewport
}

export function LandscapeFallback() {
  return <div className="landscape-fallback" aria-hidden="true"><img src="/photos/valley-hero.webp" alt="" loading="lazy" /></div>
}

class LandscapeErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <LandscapeFallback /> : this.props.children }
}

export function LazyLandscape() {
  const enabled = useLandscapePreference()
  if (!enabled) return <LandscapeFallback />
  return <LandscapeErrorBoundary><Suspense fallback={<LandscapeFallback />}><LandscapeScene /></Suspense></LandscapeErrorBoundary>
}
