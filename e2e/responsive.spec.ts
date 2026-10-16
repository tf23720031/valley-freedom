import { expect, test } from '@playwright/test'

test('primary workspaces fit the active desktop or mobile viewport', async ({ page }) => {
  for (const route of ['/', '/experiences', '/experiences/experience-1', '/itinerary', '/bookings', '/muri-sunshine', '/youth', '/operator', '/operator/experiences', '/operator/bookings', '/operator/tasks', '/co-create']) {
    await page.goto(route)
    await expect(page.locator('#main-content')).toBeVisible()
    const dimensions = await page.evaluate(() => ({ width: window.innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }))
    expect(dimensions.document, `${route} document overflows at ${dimensions.width}px`).toBeLessThanOrEqual(dimensions.width + 1)
    expect(dimensions.body, `${route} body overflows at ${dimensions.width}px`).toBeLessThanOrEqual(dimensions.width + 1)
  }
})
