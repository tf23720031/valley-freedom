import { expect, test } from '@playwright/test'

async function openMobileNav(page: import('@playwright/test').Page) {
  if ((page.viewportSize()?.width ?? 1440) < 760) await page.getByRole('button', { name: '開啟導覽' }).click()
}

test('publishes a co-created experience with its source draft still traceable', async ({ page }) => {
  await page.goto('/')
  await openMobileNav(page)
  await page.getByRole('link', { name: '地方共創', exact: true }).click()
  await expect(page.getByText('草案 ID：draft-pomelo')).toBeVisible()
  await page.getByRole('button', { name: '正式上架為地方體驗' }).click()
  await page.getByRole('button', { name: '確認正式上架' }).click()
  await expect(page.getByText('已正式上架', { exact: true })).toBeVisible()
  await expect(page.getByText('來源草案 ID：draft-pomelo')).toBeVisible()
  await page.goto('/experiences')
  await expect(page.getByRole('heading', { name: '果園裡的一餐' })).toBeVisible()
})
