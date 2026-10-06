import { expect, test } from '@playwright/test'
import { addThing, card } from './helpers'

/**
 * The share picture: a PNG of the scene with the day count, downloaded
 * where the share sheet is not available (which is every headless browser).
 * And the sound button, which only remembers a choice; nothing plays
 * before a tap and nothing is asserted about audio here.
 */
test('share makes a PNG named by the day', async ({ page }) => {
  await page.goto('')
  await addThing(page, 'run')
  await card(page, 'run').click()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Share' }).click()
  const file = await download
  expect(file.suggestedFilename()).toBe('whale-club-day-1.png')
  const path = await file.path()
  expect(path).toBeTruthy()
  await expect(page.locator('.line')).toHaveText('picture saved.')
})

test('the sound button remembers being switched off', async ({ page }) => {
  await page.goto('')
  const sound = page.getByRole('button', { name: 'Sound' })
  await expect(sound).toHaveAttribute('aria-pressed', 'true')
  await sound.click()
  await expect(sound).toHaveAttribute('aria-pressed', 'false')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Sound' })).toHaveAttribute('aria-pressed', 'false')
})
