import { expect, test } from '@playwright/test'

test('primary workspaces fit the active desktop or mobile viewport', async ({ page }) => {
  for (const route of ['/', '/explore', '/explore/coast-11', '/places/muri-sunshine', '/companions', '/experiences', '/experiences/experience-1', '/itinerary', '/bookings', '/muri-sunshine', '/youth', '/operator', '/operator/experiences', '/operator/bookings', '/operator/tasks', '/co-create']) {
    await page.goto(route)
    await expect(page.locator('#main-content')).toBeVisible()
    const dimensions = await page.evaluate(() => ({ width: window.innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }))
    expect(dimensions.document, `${route} document overflows at ${dimensions.width}px`).toBeLessThanOrEqual(dimensions.width + 1)
    expect(dimensions.body, `${route} body overflows at ${dimensions.width}px`).toBeLessThanOrEqual(dimensions.width + 1)
  }
})

test('mobile companion search places the full-width photo above service information', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/companions?destination=%E7%91%9E%E7%A9%97&date=2026-11-15&startTime=14%3A00&duration=90&language=%E8%8B%B1%E6%96%87&service=language-support')
  const card = page.locator('.companion-result').first()
  const boxes = await Promise.all([card.locator('img').boundingBox(), card.locator('.companion-result-main').boundingBox()])
  expect(boxes[0]).not.toBeNull()
  expect(boxes[1]).not.toBeNull()
  expect(boxes[0]!.y + boxes[0]!.height).toBeLessThanOrEqual(boxes[1]!.y)
  expect(boxes[0]!.width).toBeGreaterThanOrEqual(boxes[1]!.width - 1)
})

test('editorial pages stay within key widths from phone through desktop', async ({ page }) => {
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of ['/', '/explore/taroko', '/itinerary', '/companions']) {
      await page.goto(route)
      const size = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }))
      expect(size.document, `${route} document overflow at ${width}px`).toBeLessThanOrEqual(size.viewport + 1)
      expect(size.body, `${route} body overflow at ${width}px`).toBeLessThanOrEqual(size.viewport + 1)
      await expect(page.locator('#main-content')).toBeVisible()
    }
  }
})

test('reduced motion keeps the hero readable and skips scroll pinning', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '東岸一季' })).toBeVisible()
  await expect(page.getByRole('link', { name: '找旅伴', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: '排自己的行程', exact: true })).toBeVisible()
  await expect(page.locator('.hero-image-frame')).toBeVisible()
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
})

test('mobile navigation opens with every link inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: '開啟導覽' }).click()
  await expect(page.getByRole('navigation', { name: '主要導覽' }).getByRole('link').first()).toBeVisible()
  const links = await page.locator('.primary-nav .nav-link').evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect()
    return { left: rect.left, right: rect.right, width: rect.width }
  }))
  expect(links.length).toBeGreaterThan(0)
  for (const link of links) {
    expect(link.left).toBeGreaterThanOrEqual(0)
    expect(link.right).toBeLessThanOrEqual(391)
    expect(link.width).toBeGreaterThan(0)
  }
})

test('mobile visual marquee keeps moving and respects reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const firstRow = page.locator('.home-marquee .marquee-row-one')
  const animationName = await firstRow.evaluate(element => getComputedStyle(element).animationName)
  const animationDuration = await firstRow.evaluate(element => getComputedStyle(element).animationDuration)
  expect(animationName).toBe('mobile-marquee-east')
  expect(animationDuration).toBe('5.5s')
  const marqueeFontSize = await firstRow.locator('.marquee-word-wide').evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))
  expect(marqueeFontSize).toBeLessThan(59)
  const startX = await firstRow.evaluate(element => element.getBoundingClientRect().x)
  await page.waitForTimeout(700)
  const endX = await firstRow.evaluate(element => element.getBoundingClientRect().x)
  expect(Math.abs(endX - startX)).toBeGreaterThan(1)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect.poll(() => firstRow.evaluate(element => getComputedStyle(element).animationName)).toBe('none')
})

test('region index stays spaced and companion search offers Hualien and Taitung', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/explore')
  const letterSpacing = await page.locator('.region-index').evaluate(element => Number.parseFloat(getComputedStyle(element).letterSpacing))
  expect(letterSpacing).toBeGreaterThanOrEqual(1)
  await page.goto('/companions')
  const area = page.getByRole('combobox', { name: '地點或區域' })
  await expect(area).toHaveValue('瑞穗')
  await expect(area.locator('option')).toHaveText(['瑞穗', '花蓮縣', '臺東縣', '花東全區'])
  await area.selectOption('臺東縣')
  await expect(page.getByText('2 位可詢問')).toBeVisible()
  await page.getByRole('button', { name: /提出預約需求/ }).first().click()
  await expect(page.getByLabel('集合位置')).toHaveValue('')
})

test('homepage loads without client errors or failed local assets', async ({ page }) => {
  const pageErrors: string[] = []
  const failedAssets: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))
  page.on('requestfailed', request => {
    const url = request.url()
    if (url.startsWith('http://127.0.0.1:4173/') && /\.(js|css|webp|png|jpe?g|svg|woff2?)(\?|$)/.test(url)) failedAssets.push(url)
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '東岸一季' })).toBeVisible()
  expect(pageErrors).toEqual([])
  expect(failedAssets).toEqual([])
})

test('three-line scroll story stays separated and hero/navigation bands span the viewport', async ({ page }) => {
  for (const width of [390, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 900 })
    await page.goto('/')
    const initial = await page.evaluate(() => {
      const hero = document.querySelector('.home-hero')!.getBoundingClientRect()
      const frame = document.querySelector('.hero-image-frame')!.getBoundingClientRect()
      const header = document.querySelector('.site-header')!.getBoundingClientRect()
      const rows = [...document.querySelectorAll<HTMLElement>('.home-marquee .marquee-row')]
      const bands = [...document.querySelectorAll<HTMLElement>('.hero-word-band,.final-word-band')]
      return {
        rowCount: rows.length,
        heroWidth: hero.width,
        frameWidth: frame.width,
        headerWidth: header.width,
        bodyWidth: document.documentElement.clientWidth,
        bandColors: bands.map(band => getComputedStyle(band).backgroundColor),
        rowGap: Number.parseFloat(getComputedStyle(document.querySelector('.home-marquee')!).rowGap),
      }
    })
    expect(initial.rowCount).toBe(3)
    expect(initial.frameWidth).toBeGreaterThanOrEqual(initial.heroWidth - 1)
    expect(initial.headerWidth).toBe(initial.bodyWidth)
    expect(initial.bandColors).toEqual(['rgb(70, 110, 119)', 'rgb(70, 110, 119)'])
    expect(initial.rowGap).toBeLessThanOrEqual(width < 761 ? 38 : 62)

    const marquee = page.locator('.home-marquee')
    await marquee.scrollIntoViewIfNeeded()
    for (const progress of [0.2, 0.5, 0.8]) {
      await page.evaluate(progressValue => {
        const section = document.querySelector<HTMLElement>('.home-marquee')!
        const top = section.getBoundingClientRect().top + window.scrollY
        window.scrollTo(0, top - window.innerHeight + (section.offsetHeight + window.innerHeight) * progressValue)
      }, progress)
      await page.waitForTimeout(80)
      const rowRects = await page.locator('.home-marquee .marquee-row').evaluateAll(rows => rows.map(row => {
        const { top, bottom } = row.getBoundingClientRect()
        return { top, bottom }
      }))
      for (let index = 0; index < rowRects.length - 1; index++) {
        expect(rowRects[index]!.bottom, `marquee rows overlap at ${width}px and ${progress}`).toBeLessThanOrEqual(rowRects[index + 1]!.top)
      }
    }
  }
})

test('experience gallery follows the editorial sticky column on desktop and opens a preview on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await expect(page.locator('.home-regions')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(page.locator('.inspiration-sticky')).toHaveCSS('position', 'sticky')
  await page.locator('.experience-directory-link').nth(1).scrollIntoViewIfNeeded()
  await expect(page.locator('.inspiration-active-copy h3')).toHaveText('瑞穗米香與灶腳')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const photoWidths = await page.locator('.gap-photo-accents span').evaluateAll(elements => elements.map(element => getComputedStyle(element).width))
  expect(new Set(photoWidths).size).toBeGreaterThanOrEqual(4)
  const card = page.locator('.experience-directory-link').first()
  const image = await card.locator('img').boundingBox()
  expect(image).not.toBeNull()
  expect(image!.width).toBeGreaterThanOrEqual(350)
  await card.click()
  const preview = page.getByRole('dialog', { name: '文旦田裡的一日農事' })
  await expect(preview).toBeVisible()
  await expect(preview.getByRole('link', { name: '前往體驗詳情' })).toHaveAttribute('href', '/experiences/experience-1')
  await preview.getByRole('button', { name: '關閉介紹' }).click()
  await expect(preview).toHaveCount(0)
})

test('every route fits phone, tablet and desktop widths', async ({ page }) => {
  test.setTimeout(120_000)
  const routes = ['/', '/experiences', '/experiences/experience-1', '/companions', '/explore', '/explore/taroko', '/places/muri-sunshine', '/companion', '/itinerary', '/bookings', '/muri-sunshine', '/youth', '/youth/tasks/demo', '/operator', '/operator/experiences', '/operator/bookings', '/operator/tasks', '/co-create', '/not-found']
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      const size = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }))
      expect(size.document, `${route} document overflow at ${width}px`).toBeLessThanOrEqual(size.viewport + 1)
      expect(size.body, `${route} body overflow at ${width}px`).toBeLessThanOrEqual(size.viewport + 1)
      await expect(page.locator('#main-content')).toBeVisible()
    }
  }
})
