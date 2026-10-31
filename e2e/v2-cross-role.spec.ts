import { expect, test } from '@playwright/test'

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByRole('button', { name: '直接使用測試帳號' }).click()
}

test('shared demo login carries a traveler booking into operator confirmation and back', async ({ page }) => {
  await signIn(page)
  await page.goto('/experiences/experience-1')
  await page.getByRole('button', { name: /送出模擬預約/ }).click()
  await page.getByRole('button', { name: '確認送出' }).click()
  await page.goto('/bookings')
  const ownedBooking = page.locator('.booking-row').filter({ hasText: '待業者確認' }).last()
  await expect(ownedBooking).toBeVisible()
  const bookingId = (await ownedBooking.locator('.eyebrow').innerText()).replace('訂單編號 ', '')

  await page.getByLabel('切換展示角色').selectOption('operator')
  await page.goto('/operator/bookings')
  const operatorRow = page.locator('.operator-booking-row').filter({ hasText: bookingId })
  await expect(operatorRow).toContainText('待確認')
  await operatorRow.getByRole('button', { name: '確認預約' }).click()

  await page.getByLabel('切換展示角色').selectOption('traveler')
  await page.goto('/bookings')
  await expect(page.locator('.booking-row').filter({ hasText: bookingId })).toContainText('已確認')
})

test('traveler demand separates its budget cap from companion quote and admin reads live demo data', async ({ page }) => {
  await signIn(page)
  await page.goto('/itinerary')
  await page.getByLabel('第一天日期').fill('2026-11-14')
  await page.getByRole('button', { name: '儲存草稿' }).click()
  await page.goto('/companions/requests')
  await page.getByRole('button', { name: '發布需求並查看建議' }).click()
  await expect(page.locator('.toast')).toBeVisible()
  await expect(page.locator('.recommendation-row').filter({ hasText: '林雨禾' })).toContainText('符合目前條件')
  await expect(page.locator('.recommendation-row').filter({ hasText: '林雨禾' })).toContainText('NT$ 1,350')
  await page.getByLabel('連結行程（選填）').selectOption({ index: 1 })

  await page.getByLabel('切換展示角色').selectOption('companion')
  await page.goto('/companions/requests')
  const request = page.locator('.public-demand-card').filter({ hasText: '瑞穗・' }).first()
  await request.getByLabel('你的實際報價').fill('1250')
  await request.getByLabel('服務提案').fill('可協助現場英文溝通與一般同行。')
  await request.getByRole('button', { name: '送出申請' }).click()
  await expect(page.locator('.toast')).toContainText('實際報價已送出')

  await page.getByLabel('切換展示角色').selectOption('traveler')
  await page.goto('/companions/requests')
  await expect(page.locator('.demand-application').filter({ hasText: '林雨禾' })).toContainText('NT$ 1,250')
  await page.getByRole('button', { name: '接受此報價' }).click()
  await page.goto('/itinerary')
  await page.getByRole('button', { name: 'DAY 02' }).click()
  await expect(page.locator('.trip-event').filter({ hasText: '林雨禾' })).toBeVisible()

  await page.getByLabel('切換展示角色').selectOption('admin')
  await expect(page.getByRole('heading', { name: '全平台總覽' })).toBeVisible()
  await expect(page.getByText('已取得合作同意：0 家')).toBeVisible()
})
