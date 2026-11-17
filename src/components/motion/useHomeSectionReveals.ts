import { useLayoutEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const revealTargets = '.home-story > *, .regions-header > *, .region-story, .inspiration-header, .inspiration-item, .companions-heading, .companion-editorial, .gap-intro, .gap-sample, .final-cta-content, .final-action-panels'

export function useHomeSectionReveals(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = ref.current
    if (!root || typeof window.matchMedia !== 'function') return

    gsap.registerPlugin(ScrollTrigger)
    const media = gsap.matchMedia(root)
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>(revealTargets, root).forEach((target) => {
          // Keep editorial content readable if ScrollTrigger never fires (for
          // example after a history restore or during a failed JS animation).
          gsap.fromTo(target, { y: 18 }, {
            y: 0,
            duration: 0.72,
            ease: 'power2.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: target,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          })
        })
      }, root)
      return () => context.revert()
    })

    return () => media.revert()
  }, [ref])
}
