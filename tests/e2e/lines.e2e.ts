import { expect, test } from '@playwright/test'
import { COLLECTIBLES } from '../../src/scene/collectibles'
import { voice } from '../../src/voice'
import { dateKey, seed } from './helpers'

/**
 * Every line the app says after a tap fits on one row of a 320px phone,
 * the smallest screen it supports, and so does the recap's line. The sea
 * facts of the daily surprise are the exception on purpose: they are read
 * once, quietly, and may take two rows (docs/DECISIONS.md).
 */
const longestName = [...COLLECTIBLES].sort((a, b) => b.name.length - a.name.length)[0]?.name ?? ''

const LINES: string[] = [
  voice.firstOpen,
  ...voice.thingAdded,
  ...voice.tap.sea,
  ...voice.tap.sky,
  ...voice.tap.garden,
  voice.untap,
  voice.timerStart,
  voice.timerEnd,
  voice.allDone,
  voice.missedDay,
  voice.quietDay,
  voice.stageUp,
  voice.unlock(longestName),
  voice.starPlaced,
  voice.shareDone,
  voice.checkin.after,
  voice.stones.fell,
  voice.lockIn.left,
  voice.lockIn.broken,
  voice.lockIn.stopped(120),
  voice.restDay,
]

test.use({ viewport: { width: 320, height: 640 } })

test('every line after a tap fits one row at 320px', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'one viewport is the point')
  await page.goto('')
  const tooLong = await page.evaluate((lines) => {
    const element = document.querySelector<HTMLElement>('.line')
    if (!element) throw new Error('no line')
    const lineHeight = parseFloat(getComputedStyle(element).lineHeight)
    return lines.filter((text) => {
      element.textContent = text
      return element.getBoundingClientRect().height > lineHeight * 1.5
    })
  }, LINES)
  expect(tooLong).toEqual([])
})

test('the recap line fits one row at 320px', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'one viewport is the point')
  const days: Record<string, { done: string[] }> = {}
  for (let i = 1; i <= 14; i++) days[dateKey(-i)] = { done: ['t1'] }
  await seed(page, {
    things: [{ id: 't1', name: 'run', world: 'sea', createdAt: dateKey(-15), order: 0 }],
    days,
  })
  await page.goto('')
  const recapLine = page.getByRole('complementary', { name: 'weekly recap' }).locator('.recap-line')
  await expect(recapLine).toBeVisible()
  const tooLong = await recapLine.evaluate(
    (element, lines) => {
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight)
      return lines.filter((text) => {
        element.textContent = text
        return element.getBoundingClientRect().height > lineHeight * 1.5
      })
    },
    [voice.weekGood, voice.weekBad],
  )
  expect(tooLong).toEqual([])
})
