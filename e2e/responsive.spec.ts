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
