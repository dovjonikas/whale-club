import type { Page } from '@playwright/test'
import { expect, test } from './helpers'

/**
 * Frame timing, measured alone (the perf project runs after the others):
 * a year of lanterns in the cove, from the lab's 365-day seed, must not
 * make the scene drop frames. 120 frames, their gaps sorted. The numbers
 * are kept as annotations and recorded in docs/QUALITY.md.
 */

/** Gaps between 120 frames, sorted: the median and the 95th. */
async function frameGaps(page: Page): Promise<{ median: number; p95: number }> {
  const frames = await page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        const times: number[] = []
        const step = (t: number): void => {
          times.push(t)
          if (times.length < 121) requestAnimationFrame(step)
          else resolve(times.slice(1).map((v, i) => v - (times[i] ?? v)))
        }
        requestAnimationFrame(step)
      }),
  )
  frames.sort((a, b) => a - b)
  return {
    median: frames[Math.floor(frames.length / 2)] ?? 0,
    p95: frames[Math.floor(frames.length * 0.95)] ?? 0,
  }
}

/** The lab's year, settled: returns how many lanterns the cove holds. */
async function seedYear(page: Page): Promise<number> {
  await page.goto('?lab=1')
  await page
    .getByRole('dialog', { name: 'the lab' })
    .getByRole('button', { name: 'seed 365 days' })
    .click()
  const count = Number(await page.locator('canvas.lanterns').getAttribute('data-count'))
  expect(count).toBeGreaterThanOrEqual(400)
  // Let the seed settle: the stones falling in and the finds arriving are a moment, not the steady state.
  await page.waitForTimeout(3000)
  return count
}

const said = (median: number, p95: number, count: number): string =>
  `median ${median.toFixed(1)} ms, p95 ${p95.toFixed(1)} ms, ${String(count)} lanterns`

test('a year of lanterns stays smooth', async ({ page }, info) => {
  const count = await seedYear(page)
  const { median, p95 } = await frameGaps(page)
  info.annotations.push({ type: 'frames', description: said(median, p95, count) })
  // Headless Chromium draws without a GPU; one frame is 16.7 ms, and a little room is left.
  expect(median).toBeLessThan(25)
  expect(p95).toBeLessThan(70)
})

/**
 * The same year on a CPU slowed four times, about a mid-range phone: the
 * scene may lose a frame now and then, never its feel.
 */
test('a year of lanterns on a slow phone', async ({ page }, info) => {
  const count = await seedYear(page)
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  const { median, p95 } = await frameGaps(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
  info.annotations.push({ type: 'frames, CPU x4', description: said(median, p95, count) })
  // Vsync rounds a frame to 16.7 ms steps: two steps today, a third would be a regression.
  expect(median).toBeLessThan(45)
  expect(p95).toBeLessThan(120)
})
