import { expect, test } from '@playwright/test'

/**
 * Frame timing, measured alone (the perf project runs after the others):
 * a year of lanterns in the cove, from the lab's 365-day seed, must not
 * make the scene drop frames. 120 frames, their gaps sorted.
 */
test('a year of lanterns stays smooth', async ({ page }, info) => {
  await page.goto('?lab=1')
  await page
    .getByRole('dialog', { name: 'the lab' })
    .getByRole('button', { name: 'seed 365 days' })
    .click()
  const count = Number(await page.locator('canvas.lanterns').getAttribute('data-count'))
  expect(count).toBeGreaterThanOrEqual(400)
  // Let the seed settle: the stones falling in and the finds arriving are a moment, not the steady state.
  await page.waitForTimeout(3000)
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
  const median = frames[Math.floor(frames.length / 2)] ?? 0
  const p95 = frames[Math.floor(frames.length * 0.95)] ?? 0
  info.annotations.push({
    type: 'frames',
    description: `median ${median.toFixed(1)} ms, p95 ${p95.toFixed(1)} ms, ${String(count)} lanterns`,
  })
  // Headless Chromium draws without a GPU; one frame is 16.7 ms, and a little room is left.
  expect(median).toBeLessThan(25)
  expect(p95).toBeLessThan(70)
})
