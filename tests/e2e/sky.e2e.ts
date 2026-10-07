import { expect, test, type Page } from '@playwright/test'
import { litPath, moonPhase } from '../../src/scene/moon'
import { setHidden } from './helpers'

/**
 * The sky moves on one animation loop for the whole app, and that loop
 * stops while the page is hidden; under reduced motion it never starts.
 * Counted by wrapping requestAnimationFrame before the app loads.
 */
async function countFrames(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __frames: number }
    w.__frames = 0
    const original = window.requestAnimationFrame.bind(window)
    window.requestAnimationFrame = (callback) => {
      w.__frames++
      return original(callback)
    }
  })
}

const frames = (page: Page) =>
  page.evaluate(() => (window as unknown as { __frames: number }).__frames)

async function framesIn(page: Page, ms: number): Promise<number> {
  const before = await frames(page)
  await page.waitForTimeout(ms)
  return (await frames(page)) - before
}

test('one loop while visible, none while hidden', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'one device is enough to count frames')
  await countFrames(page)
  await page.goto('')
  await page.waitForTimeout(800)
  const visible = await framesIn(page, 1000)
  expect(visible).toBeGreaterThan(10)
  // One loop at the display's rate, not four: well under two loops' worth.
  expect(visible).toBeLessThan(100)
  await setHidden(page, true)
  await page.waitForTimeout(200)
  expect(await framesIn(page, 1000)).toBeLessThanOrEqual(1)
  await setHidden(page, false)
  expect(await framesIn(page, 1000)).toBeGreaterThan(10)
})

test('under reduced motion the sky holds still', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'one device is enough to count frames')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await countFrames(page)
  await page.goto('')
  await page.waitForTimeout(800)
  expect(await framesIn(page, 1000)).toBeLessThanOrEqual(2)
})

test('the moon is in its real phase for the date', async ({ page }) => {
  await page.goto('')
  const expected = litPath(moonPhase(new Date()), 20, 32)
  await expect(page.locator('.moon clipPath path')).toHaveAttribute('d', expected)
})
