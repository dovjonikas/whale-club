import type { CDPSession, Page } from '@playwright/test'
import { expect, test } from './helpers'

/**
 * Frame timing, measured alone (the perf project runs after the others):
 * a year of lanterns in the cove, from the lab's 365-day seed, must not
 * load the main thread. 120 frames each time. The numbers are kept as
 * annotations and recorded in docs/QUALITY.md.
 *
 * What is held is the main thread's work per frame (script, style, layout,
 * paint), because that is the app's own. The gaps between frames are
 * recorded and only loosely held: headless Chromium composites in software,
 * so on a machine at the edge of 16.7 ms the median flips between one and
 * two vsync steps with the machine, not with the app (docs/DECISIONS.md).
 */

interface Frames {
  median: number
  p95: number
  /** Main-thread busy time per frame, in ms. */
  busy: number
}

async function taskSeconds(cdp: CDPSession): Promise<number> {
  const { metrics } = await cdp.send('Performance.getMetrics')
  return metrics.find((m) => m.name === 'TaskDuration')?.value ?? 0
}

/** 120 frames: the gaps between them, sorted, and the main thread's share. */
async function measure(page: Page, cdp: CDPSession): Promise<Frames> {
  const before = await taskSeconds(cdp)
  const gaps = await page.evaluate(
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
  const busy = ((await taskSeconds(cdp)) - before) * 1000
  gaps.sort((a, b) => a - b)
  return {
    median: gaps[Math.floor(gaps.length / 2)] ?? 0,
    p95: gaps[Math.floor(gaps.length * 0.95)] ?? 0,
    busy: busy / gaps.length,
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

async function measured(page: Page, rate: number): Promise<Frames & { count: number }> {
  const count = await seedYear(page)
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Performance.enable')
  await cdp.send('Emulation.setCPUThrottlingRate', { rate })
  const frames = await measure(page, cdp)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
  return { ...frames, count }
}

const said = (f: Frames & { count: number }): string =>
  `main thread ${f.busy.toFixed(1)} ms a frame; frames median ${f.median.toFixed(1)} ms, p95 ${f.p95.toFixed(1)} ms; ${String(f.count)} lanterns`

test('a year of lanterns stays smooth', async ({ page }, info) => {
  const f = await measured(page, 1)
  info.annotations.push({ type: 'frames', description: said(f) })
  // About 4 ms today: a third of a frame, with room for a busy machine.
  expect(f.busy).toBeLessThan(8)
  // One or two vsync steps, never three.
  expect(f.median).toBeLessThan(40)
  expect(f.p95).toBeLessThan(70)
})

/**
 * The same year on a CPU slowed four times, about a mid-range phone: the
 * scene may lose a frame now and then, never its feel.
 */
test('a year of lanterns on a slow phone', async ({ page }, info) => {
  const f = await measured(page, 4)
  info.annotations.push({ type: 'frames, CPU x4', description: said(f) })
  expect(f.busy).toBeLessThan(30)
  expect(f.median).toBeLessThan(45)
  expect(f.p95).toBeLessThan(120)
})
