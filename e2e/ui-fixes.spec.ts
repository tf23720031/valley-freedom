import { expect, test } from '@playwright/test'

test('login opens in place and demo account returns to the protected destination', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/itinerary')
  const dialog = page.getByRole('dialog', { name: '登入 VALLEY FREEDOM' })
  await expect(dialog).toBeVisible()
  await expect(page).toHaveURL(/\/itinerary$/)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(page).toHaveURL(/\/itinerary$/)
  await page.getByRole('button', { name: '登入' }).click()
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: '直接使用測試帳號' }).click()
  await expect(page.getByRole('heading', { name: '我的自由行' })).toBeVisible()
  await expect(page.getByLabel('切換展示角色')).toHaveValue('traveler')
})

test('itinerary sorts events by clock time and shows the open interval', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    const key = 'valley-freedom-state-v1'
    const state = JSON.parse(localStorage.getItem(key) || '{}')
    state.authenticated = true
    state.role = 'traveler'
    state.itineraries = [{ id: 'e2e-trip', travelerId: state.travelerId, title: '三天旅行', date: '2026-11-14', endDate: '2026-11-16', dayCount: 3, budget: 9000, interests: [], updatedAt: new Date().toISOString(), items: [
      { id: 'walk', kind: 'free', category: '景點', title: '縱谷散步', date: '2026-11-14', startTime: '14:00', endTime: '15:30', price: 0, place: '瑞穗' },
      { id: 'farm', kind: 'free', category: '地方體驗', title: '文旦田裡的一日農事', date: '2026-11-14', startTime: '09:30', endTime: '11:30', price: 680, place: '瑞穗' },
    ] }]
    localStorage.setItem(key, JSON.stringify(state))
  })
  await page.goto('/itinerary')
  const events = page.locator('.trip-event h3')
  await expect(events.nth(0)).toHaveText('文旦田裡的一日農事')
  await expect(page.getByRole('button', { name: /空檔 11:30 至 14:00/ })).toBeVisible()
  await expect(events.nth(1)).toHaveText('縱谷散步')
  await expect(page.getByRole('button', { name: '上移' })).toHaveCount(0)
})

test('map panel matches the map height on desktop and returns to natural flow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/explore/map')
  const desktop = await page.evaluate(() => {
    const map = document.querySelector('.taiwan-map-wrap')!.getBoundingClientRect()
    const panel = document.querySelector('.map-place-panel')!.getBoundingClientRect()
    return { map: map.height, panel: panel.height, overflow: getComputedStyle(document.querySelector('.map-place-panel')!).overflowY }
  })
  expect(Math.abs(desktop.map - desktop.panel)).toBeLessThanOrEqual(2)
  expect(desktop.overflow).toBe('auto')
  await page.setViewportSize({ width: 390, height: 844 })
  const mobile = await page.evaluate(() => ({ position: getComputedStyle(document.querySelector('.map-place-panel')!).position, fixedHeight: (document.querySelector('.map-place-panel') as HTMLElement).style.height, overflow: getComputedStyle(document.querySelector('.map-place-panel')!).overflowY }))
  expect(mobile.position).toBe('static')
  expect(mobile.fixedHeight).toBe('')
  expect(mobile.overflow).toBe('visible')
})

test('companion photo upload persists locally and blocks underage profiles', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '登入' }).click()
  await page.getByRole('button', { name: '直接使用測試帳號' }).click()
  await page.getByLabel('切換展示角色').selectOption('companion')
  await expect(page.getByRole('heading', { name: '在地旅伴工作台' })).toBeVisible()
  await page.getByRole('button', { name: '旅伴端：接單管理' }).click()
  await page.getByLabel('出生日期').fill('2010-01-01')
  await expect(page.getByRole('button', { name: '儲存個人資料' })).toBeDisabled()
  await page.getByLabel('出生日期').fill('2000-01-01')
  await page.locator('input[type=file][accept="image/jpeg,image/png,image/webp"]').setInputFiles({ name: 'portrait.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p2cAAAAASUVORK5CYII=', 'base64') })
  await expect(page.locator('.profile-photo-preview img')).toHaveAttribute('src', /^blob:/)
  await page.getByRole('button', { name: '儲存個人資料' }).click()
  await expect(page.getByText('個人資料已更新。')).toBeVisible()
  await page.reload()
  await expect.poll(() => page.locator('.workbench-person img').getAttribute('src')).toMatch(/^blob:/)
})

test('experience session cards and companion attendance checkbox remain usable on mobile', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    const key = 'valley-freedom-state-v1'
    const state = JSON.parse(localStorage.getItem(key) || '{}')
    state.authenticated = true
    state.serviceRequests = [{ id: 'confirmed-companion-e2e', travelerId: state.travelerId, companionId: state.companionId, status: 'confirmed', destination: '瑞穗', meetingPoint: '瑞穗車站', date: '2026-11-14', startTime: '13:00', durationMinutes: 90, partySize: 1, language: '英文', service: 'language-support', notes: '', price: 1350, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
    localStorage.setItem(key, JSON.stringify(state))
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/experiences/experience-1')
  const option = page.locator('.session-option').first()
  await expect(option).toBeVisible()
  await expect(option).toContainText('09:30')
  await expect(option).toContainText('剩')
  const radio = await option.locator('input[type=radio]').boundingBox()
  expect(radio?.width).toBe(18)
  const checkbox = page.getByRole('checkbox', { name: '旅伴是否一同參與此體驗並占用名額？' })
  await expect(checkbox).toBeVisible()
  const checkboxBox = await checkbox.boundingBox()
  expect(checkboxBox?.width).toBe(19)
  await checkbox.check()
  await expect(page.locator('.booking-summary')).toContainText('NT$ 1,360')
  await expect(page.getByRole('button', { name: /以 2 人|送出模擬預約/ })).toBeVisible()
})

test('route stamp requires the venue code and accumulates distinct places', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/explore/map')
  await expect(page.getByRole('button', { name: '收集示意章' })).toBeVisible()
  const firstCluster = page.locator('.map-cluster').first()
  if (await firstCluster.count()) await firstCluster.click()
  await page.getByRole('button', { name: '收集示意章' }).click()
  const dialog = page.getByRole('alertdialog', { name: '收集場域示意章' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox', { name: '店家密碼' }).fill('555')
  await dialog.getByRole('button', { name: '驗證並集章' }).click()
  await expect(page.getByText('目前共 1 個場域。')).toBeVisible()
  await page.getByRole('button', { name: /查看第2處/ }).click()
  await page.getByRole('button', { name: '收集示意章' }).click()
  await page.getByRole('alertdialog', { name: '收集場域示意章' }).getByRole('textbox', { name: '店家密碼' }).fill('555')
  await page.getByRole('alertdialog', { name: '收集場域示意章' }).getByRole('button', { name: '驗證並集章' }).click()
  await expect(page.getByText('目前共 2 個場域。')).toBeVisible()
  await page.reload()
  await expect(page.getByText('2 個場域；達兩個後')).toBeVisible()
  await expect(page.getByText('我的集章紀錄')).toBeVisible()
})

test('map clusters crowded places, expands them and zooms without mobile overflow', async ({ page }) => {
  for (const width of [320, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/explore/map')
    const cluster = page.getByRole('button', { name: /展開群聚，\d+ 個場域/ }).first()
    await expect(cluster).toBeVisible()
    const groupSize = Number((await cluster.getAttribute('aria-label'))?.match(/\d+/)?.[0])
    const markersBefore = await page.locator('.map-place-marker').count()
    await cluster.click()
    await expect(page.locator('.map-place-marker')).toHaveCount(markersBefore + groupSize)
    await expect(page.getByRole('button', { name: '放大地圖' })).toBeVisible()
    await page.getByRole('button', { name: '放大地圖' }).click()
    await expect(page.getByRole('button', { name: '縮小地圖' })).toBeEnabled()
    await page.getByRole('button', { name: '重設地圖視角' }).click()
    const metrics = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth, svg: document.querySelector('.taiwan-map-svg')!.getBoundingClientRect().width }))
    expect(metrics.document).toBeLessThanOrEqual(metrics.viewport)
    expect(metrics.svg).toBeGreaterThan(0)
  }
})
