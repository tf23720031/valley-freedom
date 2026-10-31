import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../../app/App'
import { resetStoreForTests } from '../../store/appStore'

beforeEach(() => { cleanup(); localStorage.clear(); resetStoreForTests() })

describe('editorial homepage', () => {
  it('presents an image-led carousel hero with usable journey actions', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: '東岸一季' })).toBeInTheDocument()
    expect(screen.getByText('不跟團、不趕行程。想找人同行，也可以。')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '花東旅行影像' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下一張照片' })).toBeInTheDocument()
    expect(document.querySelector('.hero-image-frame')).toBeInTheDocument()
    expect(document.querySelector('.home-hero-photo')).toHaveAttribute('src', '/photos/east-coast-hero.png')
    expect(screen.getAllByRole('link', { name: /找旅伴|找在地旅伴/ }).some((link) => link.getAttribute('href') === '/companions')).toBe(true)
    expect(screen.getAllByRole('link', { name: /排自己的行程|安排我的行程/ }).some((link) => link.getAttribute('href') === '/itinerary')).toBe(true)
  })

  it('offers each of the four regions and labels example content', () => {
    render(<App />)
    for (const region of ['taroko', 'coast-11', 'valley-9', 'south-link']) {
      expect(screen.getAllByRole('link', { name: new RegExp(region === 'taroko' ? '太魯閣' : region === 'coast-11' ? '東海岸' : region === 'valley-9' ? '縱谷' : '南迴') }).some((link) => link.getAttribute('href') === `/explore/${region}`)).toBe(true)
    }
    expect(screen.getAllByText(/皆為示意/).length).toBeGreaterThan(0)
    expect(document.querySelectorAll('.route-directory-link')).toHaveLength(4)
  })

  it('shows route rows and useful illustrative experience details', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: '你的行程你決定' })).toBeInTheDocument()
    expect(document.querySelector('.home-story-collage')).toBeInTheDocument()
    expect(document.querySelectorAll('.experience-directory-link').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/建議停留/).length).toBeGreaterThan(0)
  })

  it('opens a mobile experience preview with a route to the full detail page', async () => {
    const originalWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
    try {
      const user = userEvent.setup()
      render(<App />)
      await user.click(screen.getByRole('link', { name: /文旦田裡的一日農事/ }))
      expect(screen.getByRole('dialog', { name: '文旦田裡的一日農事' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: '前往體驗詳情' })).toHaveAttribute('href', '/experiences/experience-1')
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth })
    }
  })

  it('builds a sticky experience reading column alongside scrollable image entries', () => {
    render(<App />)
    expect(document.querySelector('.inspiration-sticky')).toHaveAttribute('aria-live', 'polite')
    expect(document.querySelector('.experience-directory')).toHaveClass('experience-directory-stack')
    expect(document.querySelectorAll('.experience-directory-link[data-experience-id]').length).toBeGreaterThan(1)
  })

  it('uses transparent editorial companion cutouts and keeps the full-photo ending actions', () => {
    render(<App />)
    expect(document.querySelectorAll('.companion-editorial')).toHaveLength(1)
    expect(document.querySelector('.companion-cutout img')).toHaveAttribute('src', '/photos/companion-lin-cutout.webp')
    expect(document.querySelector('.final-action-panels')).toBeInTheDocument()
    expect(document.querySelector('.final-word-strip')).toBeInTheDocument()
    expect(document.querySelector('.hero-word-marquee')).toBeInTheDocument()
    expect(document.querySelector('.final-word-marquee')).toBeInTheDocument()
    expect(document.querySelector('.hero-word-band')?.parentElement).not.toHaveClass('home-hero')
    expect(screen.getAllByRole('link', { name: /找旅伴/ }).some((link) => link.getAttribute('href') === '/companions')).toBe(true)
  })

  it('uses a visual, scroll-driven typography interlude instead of explanatory landscape copy', () => {
    render(<App />)
    expect(screen.getByRole('region', { name: '花東視覺文字敘事' })).toBeInTheDocument()
    expect(document.querySelector('.home-marquee')).toHaveClass('home-marquee-forest')
    expect(screen.getByText('GO EAST.')).toBeInTheDocument()
    expect(screen.getAllByText('花東，').length).toBeGreaterThan(0)
    expect(screen.getByText('自由走。')).toBeInTheDocument()
    expect(screen.getByText('NO FIXED ROUTE.')).toBeInTheDocument()
    expect(document.querySelectorAll('.home-marquee .marquee-row')).toHaveLength(3)
    expect(screen.queryByText('花東的地景概念示意，非精確地形或導航地圖。')).not.toBeInTheDocument()
  })

  it('keeps the hero and footer word bands English-only and centers the interlude rows', () => {
    render(<App />)
    for (const band of document.querySelectorAll('.hero-word-band, .final-word-band')) {
      expect(band.textContent).toMatch(/[A-Z]/)
      expect(band.textContent).not.toMatch(/[\u3400-\u9fff]/)
    }
    for (const row of document.querySelectorAll('.home-marquee .marquee-row')) expect(row).toHaveClass('marquee-row-centered')
    expect(document.querySelector('.home-gap')).not.toHaveClass('editorial-wrap')
  })

  it('keeps homepage section titles free from terminal punctuation', () => {
    render(<App />)
    const headings = [...document.querySelectorAll('.home-editorial h1, .home-editorial h2, .home-editorial h3')]
    expect(headings.length).toBeGreaterThan(0)
    for (const heading of headings) expect(heading.textContent?.trim()).not.toMatch(/[，。？！、：；,.!?;:]$/)
  })

})
