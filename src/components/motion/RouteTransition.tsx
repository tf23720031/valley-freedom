import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

export function RouteTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return <div className="route-transition" key={pathname} data-route={pathname}>{children}</div>
}
