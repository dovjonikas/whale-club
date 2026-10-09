import type { Page } from '@playwright/test'
import { tideFor } from '../../src/store/tide'
import type { AppData } from '../../src/store/types'
import { expect, seed, test } from './helpers'

/**
 * The month's tide: last month in a few true sentences. The arithmetic is
 * held here without a browser; the story, its offer and the log's "watch
 * again" through the real screen.
 */
const thing = (id: string, order: number) => ({
  id,
  name: id,
  icon: 'letter',
  kind: 'tap' as const,
  minutes: 15,
  days: [true, true, true, true, true, true, true],
  world: 'sea' as const,
  line: 'a' as const,
  createdAt: '2026-08-01',
  order,
})

/** A month of data: `done(day)` names what was done on that day of September 2026. */
function september(done: (day: number) => string[], extra: Partial<AppData> = {}): AppData {
  const days: AppData['days'] = {}
  for (let d = 1; d <= 30; d++) {
    const ids = done(d)
    if (ids.length) days[`2026-09-${String(d).padStart(2, '0')}`] = { done: ids, minutes: {} }
  }
  return {
    version: 8,
    things: [thing('run', 0), thing('read', 1)],
    days,
    cracked: {},
    settings: {},
    ...extra,
  } as AppData
}

test.describe('the arithmetic', () => {
  test.skip(({ isMobile }) => isMobile, 'pure data')

  test('a month without a star has no tide', () => {
    expect(
      tideFor(
        september(() => []),
        '2026-09',
      ),
    ).toBeNull()
  })

  test('two things that keep the same days are said together, from five days', () => {
    const tide = tideFor(
      september((d) => (d % 2 === 0 ? ['run', 'read'] : [])),
      '2026-09',
    )
    expect(tide?.stars).toBe(15)
    expect(tide?.truth).toEqual({ kind: 'together', a: 'run', b: 'read', days: 15 })
    const four = tideFor(
      september((d) => (d <= 4 ? ['run', 'read'] : [])),
      '2026-09',
    )
    expect(four?.truth?.kind).not.toBe('together')
  })

  test('a weekday is named only when it had the most stars on its own, three or more', () => {
    // September 2026: the 1st was a Tuesday. Stars on the four Tuesdays, and one Friday.
    const tide = tideFor(
      september((d) => ([1, 8, 15, 22, 4].includes(d) ? ['run'] : [])),
      '2026-09',
    )
    expect(tide?.truth).toEqual({ kind: 'weekday', weekday: 2, stars: 4 })
    const tie = tideFor(
      september((d) => ([1, 8, 15, 4, 11, 18].includes(d) ? ['run'] : [])),
      '2026-09',
    )
    expect(tie?.truth).toBeUndefined()
  })

  test('every month has a sea type: a little every day is a turtle, else a whale', () => {
    expect(
      tideFor(
        september(() => ['run']),
        '2026-09',
      )?.type,
    ).toBe('turtle')
    expect(
      tideFor(
        september((d) => (d === 3 ? ['run'] : [])),
        '2026-09',
      )?.type,
    ).toBe('whale')
  })

  test('a month of lanterns is a lanternfish, and a best week needs two weeks to compare', () => {
    const data = september((d) => (d <= 10 ? ['run'] : []))
    for (let d = 1; d <= 8; d++)
      data.days[`2026-09-0${String(d)}`] = {
        done: ['run'],
        minutes: { run: 30 },
        sessions: [{ thing: 'run', minutes: 30 }],
      }
    const tide = tideFor(data, '2026-09')
    expect(tide?.type).toBe('lanternfish')
    expect(tide?.lanterns).toBe(8)
    expect(tide?.bestWeek?.count).toBeGreaterThanOrEqual(3)
  })
})

/** Two things done most of September, and the clock on the 3rd of October, in the evening. */
async function inOctober(page: Page, settings: Record<string, unknown> = {}): Promise<void> {
  await page.clock.setFixedTime(new Date(2026, 9, 3, 12, 0))
  const days: Record<string, { done: string[]; checkin?: boolean }> = {}
  for (let d = 1; d <= 30; d++)
    if (d % 5 !== 0) days[`2026-09-${String(d).padStart(2, '0')}`] = { done: ['run', 'read'] }
  days['2026-10-03'] = { done: [], checkin: true }
  await seed(page, {
    things: [
      { id: 'run', name: 'run', world: 'sea', createdAt: '2026-08-20', order: 0, kind: 'tap' },
      { id: 'read', name: 'read', world: 'sky', createdAt: '2026-08-20', order: 1, kind: 'tap' },
    ],
    days,
    settings: {
      installDismissedAt: '2026-10-02',
      lastRecapWeek: '2026-09-21',
      tideOffered: null,
      ...settings,
    },
  })
}

test('in a month’s first week, last month is offered once, and told card by card', async ({
  page,
}) => {
  await inOctober(page)
  await page.goto('')
  const offer = page.getByRole('complementary', { name: 'september, in a few lines' })
  await expect(offer).toBeVisible()
  await offer.getByRole('button', { name: 'watch' }).click()
  const story = page.getByRole('dialog', { name: 'september, in a few lines' })
  await expect(story.getByText('september.')).toBeVisible()
  await story.getByRole('button', { name: 'next' }).click()
  await expect(story.getByText('24', { exact: true })).toBeVisible()
  await expect(story.getByText('days with a star.')).toBeVisible()
  // On to the end: the type, then the postcard.
  const next = story.getByRole('button', { name: 'next' })
  while (await next.isVisible()) await next.click()
  await expect(story.getByText('keep this month?')).toBeVisible()
  await expect(story.getByRole('button', { name: 'send this' })).toBeVisible()
  await story.getByRole('button', { name: 'close' }).last().click()
  await expect(story).toBeHidden()
  // Offered once: not again this month.
  await page.reload()
  await expect(page.getByRole('complementary', { name: 'september, in a few lines' })).toHaveCount(
    0,
  )
})

test('the story moves by swipe and by its words, and back', async ({ page }) => {
  await inOctober(page)
  await page.goto('')
  await page
    .getByRole('complementary', { name: 'september, in a few lines' })
    .getByRole('button', { name: 'watch' })
    .click()
  const story = page.getByRole('dialog', { name: 'september, in a few lines' })
  await story.getByRole('button', { name: 'next' }).click()
  await expect(story.getByText('days with a star.')).toBeVisible()
  await story.getByRole('button', { name: 'back' }).click()
  await expect(story.getByText('september.')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(story.getByText('days with a star.')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(story).toBeHidden()
})

test('the log keeps every past month’s tide; Escape closes the tide and leaves the log', async ({
  page,
}) => {
  await inOctober(page, { tideOffered: '2026-10' })
  await page.goto('')
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'the log', exact: true }).click()
  const log = page.getByRole('dialog', { name: 'the log' })
  await log.getByRole('button', { name: 'previous month' }).click()
  await log.getByRole('button', { name: 'watch september’s tide' }).click()
  const story = page.getByRole('dialog', { name: 'september, in a few lines' })
  await expect(story).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(story).toBeHidden()
  await expect(log).toBeVisible()
})
