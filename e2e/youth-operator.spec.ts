import { expect, test } from '@playwright/test'

async function openMobileNav(page: import('@playwright/test').Page) {
  if ((page.viewportSize()?.width ?? 1440) < 760) await page.getByRole('button', { name: '開啟導覽' }).click()
}

test('youth applies for a task and operator approval updates the same application', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('切換展示角色').selectOption('youth')
  await openMobileNav(page)
  await page.getByRole('link', { name: '青年工作台' }).click()
  const task = page.locator('.task-row').filter({ hasText: '平台資料校對' })
  await task.getByRole('button', { name: '提出申請' }).click()
  await expect(task.getByText('待審核')).toBeVisible()
  await page.getByLabel('切換展示角色').selectOption('operator')
  await openMobileNav(page)
  await page.getByRole('link', { name: '青年協作', exact: true }).click()
  const application = page.locator('.application-row').filter({ hasText: '平台資料校對' })
  await application.getByRole('button', { name: '錄取', exact: true }).click()
  await expect(application.getByText('已錄取')).toBeVisible()
  await page.getByLabel('切換展示角色').selectOption('youth')
  await openMobileNav(page)
  await page.getByRole('link', { name: '青年工作台' }).click()
  await expect(page.locator('.task-row').filter({ hasText: '平台資料校對' }).getByText('已錄取')).toBeVisible()
})
