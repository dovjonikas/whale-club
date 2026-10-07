import { type Page } from '@playwright/test'
import { expect, test, clearNotices, dateKey, seed, stored } from './helpers'

/**
 * The log, the one view of what has been done, and the lanterns a session
 * leaves in the cove: a month in one sentence, a day's record, the year as
 * twelve small months; the old minutes becoming lanterns. A year of them
 * on screen is timed in perf.e2e.ts.
 */
const things = [
  { id: 't1', name: 'run', world: 'sea' as const, createdAt: dateKey(-40), order: 0 },
  { id: 't2', name: 'read', world: 'sky' as const, createdAt: dateKey(-40), order: 1 },
]

const log = (page: Page) => page.getByRole('dialog', { name: 'the log' })

/** Two days in this month when the test runs late enough in it, so the summary is exact. */
function sameMonthDays(): [string, string] {
  const today = dateKey(0)
  const a = dateKey(-1)
  const b = dateKey(-2)
  if (a.slice(0, 7) === today.slice(0, 7) && b.slice(0, 7) === today.slice(0, 7)) return [b, a]
  return [today, today]
}

test('the log: a month in one sentence, a day opened, the year as twelve months', async ({
  page,
}) => {
  const [first, second] = sameMonthDays()
  test.skip(first === second, 'needs two earlier days in the same month')
  await seed(page, {
    version: 5,
    things,
    days: {
      [first]: {
        done: ['t1', 't2'],
        minutes: { t1: 30 },
        sessions: [{ thing: 't1', minutes: 30 }],
      },
      [second]: { done: ['t2'], minutes: { t2: 50 }, sessions: [{ thing: 't2', minutes: 50 }] },
    },
  })
  await page.goto('')
  await clearNotices(page)
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'the log' }).click()
  await expect(log(page)).toContainText('2 stars, 2 lanterns, 1 h 20 min')
  await log(page)
    .getByRole('button', { name: /run, read, 1 lantern$/ })
    .click()
  await expect(log(page)).toContainText('run · 30 min')
  await expect(log(page).getByRole('listitem')).toHaveCount(3)
  await log(page).getByRole('button', { name: 'back to the month' }).click()
  await log(page)
    .getByRole('button', { name: /the year$/ })
    .click()
  await expect(log(page).locator('.log-month')).toHaveCount(12)
})

test('a star opens its day in the log, and the open sky opens the month', async ({ page }) => {
  await seed(page, { things, days: { [dateKey(-3)]: { done: ['t1', 't2'] } } })
  await page.goto('')
  await clearNotices(page)
  await page.getByRole('group', { name: 'your days' }).getByRole('button').first().click()
  await expect(log(page).getByRole('listitem')).toHaveCount(2)
  await log(page).getByRole('button', { name: 'Close' }).click()
  await expect(log(page)).toHaveCount(0)
  // A tap on the sky away from any star.
  const sky = page.locator('.scene .sky')
  const box = await sky.boundingBox()
  if (!box) throw new Error('no sky')
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.75)
  await expect(log(page)).toBeVisible()
  await expect(log(page).locator('.log-grid')).toBeVisible()
})

test('data from before 0.10 turns finished lock-ins into lanterns, dim where left or short', async ({
  page,
}) => {
  await seed(page, {
    version: 4,
    things,
    days: {
      [dateKey(-3)]: { done: ['t1'], minutes: { t1: 25 } },
      [dateKey(-2)]: { done: ['t1'], minutes: { t1: 10 }, waited: ['t1'] },
      // Minutes without done: a stopped session, no lantern.
      [dateKey(-1)]: { done: [], minutes: { t2: 12 } },
    },
  })
  await page.goto('')
  await clearNotices(page)
  const data = (await stored(page)) as unknown as {
    version: number
    days: Record<string, { sessions?: unknown[] }>
  }
  expect(data.version).toBe(7)
  expect(data.days[dateKey(-3)]?.sessions).toEqual([{ thing: 't1', minutes: 25 }])
  expect(data.days[dateKey(-2)]?.sessions).toEqual([{ thing: 't1', minutes: 10, left: true }])
  expect(data.days[dateKey(-1)]?.sessions).toBeUndefined()
  // The stopped session's minutes, on a day that is over, are a faint lantern since 0.11.
  await expect(page.locator('canvas.lanterns')).toHaveAttribute('data-count', '3')
  await expect(page.locator('canvas.lanterns')).toHaveAttribute('data-dim', '2')
})
