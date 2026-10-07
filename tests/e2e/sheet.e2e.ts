import { expect, type Page } from '@playwright/test'
import { test } from './helpers'

/**
 * Where to put a finger on the grabber, once the sheet has stopped moving
 * (it takes about half a second to come up or spring back).
 */
async function settled(page: Page): Promise<{ x: number; y: number }> {
  const grabber = page.locator('.sheet-grabber')
  await expect
    .poll(async () => {
      const before = await grabber.boundingBox()
      await page.waitForTimeout(100)
      return before?.y === (await grabber.boundingBox())?.y
    })
    .toBe(true)
  const box = await grabber.boundingBox()
  if (!box) throw new Error('no grabber')
  return { x: box.x + 40, y: box.y + box.height / 2 }
}

/**
 * Sheets: the close button is the visible way out; a pull on the grabber
 * is the shortcut. A short, slow pull springs back, a long one closes.
 */
test('a sheet closes by a pull on its grabber, and a short pull springs back', async ({ page }) => {
  await page.goto('')
  await page.getByRole('button', { name: 'Add a thing' }).click()
  const sheet = page.getByRole('dialog')
  await expect(sheet).toBeVisible()
  await expect(sheet.getByRole('button', { name: 'Close' })).toBeVisible()

  const short = await settled(page)
  await page.mouse.move(short.x, short.y)
  await page.mouse.down()
  await page.mouse.move(short.x, short.y + 40, { steps: 8 })
  await page.waitForTimeout(400)
  await page.mouse.up()
  await expect(sheet).toBeVisible()
  await expect(page.locator('.sheet')).not.toHaveClass(/is-dragging/)

  const long = await settled(page)
  await page.mouse.move(long.x, long.y)
  await page.mouse.down()
  await page.mouse.move(long.x, long.y + 320, { steps: 10 })
  await page.mouse.up()
  await expect(page.locator('.sheet')).toHaveCount(0)
})
