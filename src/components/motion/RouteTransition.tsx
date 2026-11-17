import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

export function RouteTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const routeRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const route = routeRef.current
    if (!route || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const targets = Array.from(route.querySelectorAll<HTMLElement>([
      '.page-title-row', '.section-heading', '.regional-hero', '.detail-layout', '.place-page-copy',
      '.filter-panel', '.search-filter-panel', '.experience-card', '.experience-directory-link',
      '.place-card', '.booking-row', '.trip-day-tabs', '.trip-event', '.timeline-empty',
      '.request-row', '.companion-result', '.task-row', '.resource-card', '.admin-shop-row',
      '.operator-booking-row', '.admin-summary-grid', '.youth-summary',
    ].join(',')))
    if (!targets.length) return
    if (!('IntersectionObserver' in window)) return

    targets.forEach((element, index) => {
      element.dataset.scrollReveal = 'pending'
      element.style.setProperty('--reveal-order', String(Math.min(index, 4)))
    })
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const element = entry.target as HTMLElement
        element.dataset.scrollReveal = 'visible'
        observer.unobserve(element)
      })
    }, { threshold: 0.04, rootMargin: '0px 0px -6% 0px' })
    targets.forEach((element) => observer.observe(element))
    return () => { observer.disconnect(); targets.forEach((element) => { delete element.dataset.scrollReveal; element.style.removeProperty('--reveal-order') }) }
  }, [pathname])
  return <div ref={routeRef} className="route-transition" key={pathname} data-route={pathname}>{children}</div>
}
