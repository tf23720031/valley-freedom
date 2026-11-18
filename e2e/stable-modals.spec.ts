import { expect, test } from '@playwright/test'

test('experience dialog stays inside the viewport with a visible action row', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/login')
  await page.getByRole('button', { name: '直接使用測試帳號' }).click()
  for (const viewport of [{ width: 753, height: 541 }, { width: 320, height: 568 }]) {
    await page.setViewportSize(viewport)
    await page.goto('/itinerary')
    const opener = page.getByRole('button', { name: '查看更多', exact: true }).first()
    await opener.click()
    const dialog = page.getByRole('dialog')
    const geometry = await dialog.evaluate(element => {
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      const footer = element.querySelector('footer')!.getBoundingClientRect()
      return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, footerBottom: footer.bottom, animation: style.animationName, transform: style.transform, portal: element.parentElement?.parentElement === document.body }
    })
    expect(geometry).toMatchObject({ animation: 'none', transform: 'none', portal: true })
    expect(geometry.top).toBeGreaterThanOrEqual(0)
    expect(geometry.left).toBeGreaterThanOrEqual(0)
    expect(geometry.right).toBeLessThanOrEqual(viewport.width)
    expect(geometry.bottom).toBeLessThanOrEqual(viewport.height)
    expect(geometry.footerBottom).toBeLessThanOrEqual(viewport.height)
    await dialog.locator('.stable-dialog-body').evaluate(element => { element.scrollTop = element.scrollHeight })
    await expect(dialog.getByRole('button', { name: '以 1 人加入行程草稿' })).toBeInViewport()
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(opener).toBeFocused()
  }
})
