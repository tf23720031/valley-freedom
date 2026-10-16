import { expect, test } from '@playwright/test'

async function openMobileNav(page: import('@playwright/test').Page) {
  if ((page.viewportSize()?.width ?? 1440) < 760) await page.getByRole('button', { name: '開啟導覽' }).click()
}

test('traveler discovers an experience, books it, then cancels with a recorded reason', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /把縱谷的日常/ })).toBeVisible()
  await openMobileNav(page)
  await page.getByRole('link', { name: '地方體驗', exact: true }).click()
  await page.getByRole('link', { name: /文旦田裡的一日農事/ }).first().click()
  await expect(page.getByRole('heading', { name: '文旦田裡的一日農事' })).toBeVisible()
  await page.getByRole('button', { name: /送出模擬預約/ }).click()
  await page.getByRole('button', { name: '確認送出' }).click()
  await expect(page.getByRole('heading', { name: '我的預約' })).toBeVisible()
  await page.getByRole('button', { name: '取消預約' }).first().click()
  await page.getByLabel('取消原因').fill('測試流程改期')
  await page.getByRole('button', { name: '確認取消' }).click()
  await expect(page.getByText('測試流程改期')).toBeVisible()
  await expect(page.getByText('已取消', { exact: true }).first()).toBeVisible()
})
