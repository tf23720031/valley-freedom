import { useLayoutEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function useHomeScrollStory(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = ref.current
    if (!root || typeof window.matchMedia !== 'function') return

    gsap.registerPlugin(ScrollTrigger)
    const media = gsap.matchMedia(root)
    media.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const hero = root.matches('.home-hero') ? root : root.querySelector<HTMLElement>('.home-hero')
        if (hero) {
          const frame = hero.querySelector<HTMLElement>('.hero-image-frame')
          const images = hero.querySelectorAll<HTMLElement>('.home-hero-photo')
          const title = hero.querySelector<HTMLElement>('.hero-content h1')
          const description = hero.querySelector<HTMLElement>('.hero-content p')
          const entries = hero.querySelectorAll<HTMLElement>('.hero-entry')
          if (frame && images.length && title && description && entries.length) {
            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: '+=920',
                pin: true,
                scrub: 0.8,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            })
            timeline
              .fromTo(images, { scale: 1.06 }, { scale: 1, duration: 0.8, ease: 'none' }, 0)
              .fromTo(title, { x: 0, y: 0 }, { x: '-19vw', y: '-12vh', duration: 0.68, ease: 'none' }, 0.1)
              .fromTo(description, { x: 0, y: 0, autoAlpha: 1 }, { x: '12vw', y: '11vh', autoAlpha: 0, duration: 0.42, ease: 'none' }, 0.26)
              .fromTo(entries, { y: 0, autoAlpha: 1 }, { y: '9vh', autoAlpha: 0.18, stagger: 0.08, duration: 0.36, ease: 'none' }, 0.43)
          }
        }

        if (root.matches('.home-hero')) return
        const marquee = root.matches('.home-marquee') ? root : root.querySelector<HTMLElement>('.home-marquee')
        if (marquee) {
          const rows = [
            { selector: '.marquee-row-one', from: 62, to: -78 },
            { selector: '.marquee-row-two', from: -68, to: 58 },
            { selector: '.marquee-row-three', from: 72, to: -54 },
          ]
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: marquee,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          })
          rows.forEach(({ selector, from, to }, index) => {
            const row = marquee.querySelector<HTMLElement>(selector)
            if (!row) return
            timeline.fromTo(row, { x: () => from * window.innerWidth / 1440 }, { x: () => to * window.innerWidth / 1440, duration: 1, ease: 'none' }, index * 0.06)
          })
          return
        }
        const regionGallery = root.matches('.region-story-list') ? root : root.querySelector<HTMLElement>('.region-story-list')
        if (regionGallery) {
          const cards = regionGallery.querySelectorAll<HTMLElement>('.region-story-link')
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: regionGallery,
              start: 'top 88%',
              end: 'bottom 12%',
              scrub: 0.75,
              invalidateOnRefresh: true,
            },
          })
          cards.forEach((card, index) => {
            const drift = index % 2 === 0 ? -54 : 48
            timeline.fromTo(card, { y: -drift, clipPath: 'inset(9% 0 7% 0)' }, { y: drift, clipPath: 'inset(0% 0 0% 0)', duration: 1, ease: 'none' }, index * 0.08)
          })
          return
        }
        return
      }, root)

      return () => context.revert()
    })

    return () => media.revert()
  }, [ref])
}
