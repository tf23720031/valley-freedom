import { expect, test } from '@playwright/test'

test('mobile guest can reach navigation and login from the companion page', async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/companions')
    for (const label of ['登入', '開啟導覽']) {
      const button = page.getByRole('button', { name: label, exact: true })
      const box = await button.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(width)
    }
    await page.getByRole('button', { name: '開啟導覽' }).click()
    await expect(page.getByRole('navigation', { name: '主要導覽' }).getByRole('link', { name: '地方體驗' })).toBeVisible()
    await page.getByRole('button', { name: '關閉導覽' }).click()
    await page.getByRole('button', { name: '登入', exact: true }).click()
    await expect(page.getByRole('dialog', { name: '登入 VALLEY FREEDOM' })).toBeVisible()
    await page.keyboard.press('Escape')
  }
})

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`traveler can edit and submit a companion request (${reducedMotion})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion })
    await page.goto('/companions')
    const requestButton = page.getByRole('button', { name: /提出預約需求/ }).first()
    await requestButton.click()
    const dialog = page.getByRole('dialog', { name: '填寫預約需求' })
    await expect(dialog).toBeVisible()
    await expect.poll(() => dialog.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return Math.abs(rect.top) < 1 && Math.abs(rect.left) < 1 && Math.abs(rect.bottom - window.innerHeight) < 1
    })).toBe(true)
    const submit = dialog.getByRole('button', { name: '送出預約需求' })
    await expect.poll(() => submit.evaluate((button) => {
      const rect = button.getBoundingClientRect()
      return rect.top >= 0 && rect.bottom <= window.innerHeight && rect.left >= 0 && rect.right <= window.innerWidth
    })).toBe(true)
    await dialog.getByLabel('集合位置').fill('木日光文旦驛站入口・測試集合')
    await dialog.getByLabel('補充需求').fill('預約視窗點擊測試')
    await dialog.getByRole('button', { name: '關閉', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await page.getByRole('button', { name: /已選擇，填寫需求/ }).click()
    await dialog.getByRole('button', { name: '送出預約需求' }).click()
    await expect(dialog).toHaveCount(0)
    await expect(page.getByText('預約需求已送出，等待旅伴回覆。', { exact: true })).toBeVisible()
    const requests = await page.evaluate(() => JSON.parse(localStorage.getItem('valley-freedom-state-v1')!).serviceRequests)
    expect(requests).toEqual(expect.arrayContaining([expect.objectContaining({
      meetingPoint: '木日光文旦驛站入口・測試集合',
      notes: '預約視窗點擊測試',
      status: 'pending',
    })]))
  })
}
