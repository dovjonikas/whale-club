import { test as pure } from '@playwright/test'
import { artFor, COLLECTIBLES, collectiblesFor, collectibleSvg } from '../../src/scene/collectibles'
import { eventsAt, seasonOf, yearsSince } from '../../src/scene/calendar'
import { addDays } from '../../src/store/dates'
import { UNLOCK_DAYS } from '../../src/store/derive'
import { FIRST_WEEK_DAYS, KRILL, krillEarned } from '../../src/store/krill'
import { emptyData, EVERY_DAY, type AppData } from '../../src/store/types'
import { expect, middayToday, seedPerson, test } from './helpers'

/**
 * The first year: finds to day 365, the first week as its own set, the
 * real seasons and the sky's days, and the quiet milestones at 100, 200
 * and 365 days of whale club.
 */

pure.describe('the year, worked out', () => {
  pure.skip(({ isMobile }) => isMobile, 'pure data')

  pure('every line has a find at every tier to 365, each drawn and its own', () => {
    expect(UNLOCK_DAYS).toEqual([3, 7, 14, 21, 30, 45, 60, 90, 120, 180, 240, 300, 365])
    for (const world of ['sea', 'sky', 'garden'] as const)
      for (const line of ['a', 'b'] as const)
        expect(collectiblesFor(world, line).map((c) => c.days)).toEqual(UNLOCK_DAYS)
    expect(new Set(COLLECTIBLES.map((c) => c.id)).size).toBe(COLLECTIBLES.length)
    for (const item of COLLECTIBLES)
      expect(collectibleSvg(item), item.id).not.toMatch(/NaN|undefined/)
  })

  pure('the first week’s set: +100 krill once, when the seventh day is done', () => {
    const start = '2026-03-02'
    const data: AppData = emptyData()
    data.things = [
      {
        id: 'run',
        name: 'run',
        icon: 'letter',
        kind: 'tap',
        minutes: 15,
        days: [...EVERY_DAY],
        world: 'sea',
        line: 'a',
        createdAt: start,
        order: 0,
      },
    ]
    for (let i = 0; i < FIRST_WEEK_DAYS - 1; i++)
      data.days[addDays(start, i)] = { done: ['run'], minutes: {} }
    const six = krillEarned(data, addDays(start, 5))
    data.days[addDays(start, 6)] = { done: ['run'], minutes: {} }
    const seven = krillEarned(data, addDays(start, 6))
    // The seventh day's own krill, the all-done bonus, and the set: once.
    expect(seven - six).toBe(KRILL.done + KRILL.allDone + KRILL.firstWeek)
    data.days[addDays(start, 7)] = { done: ['run'], minutes: {} }
    // Day eight: its own krill, and the first week, over and good, its 50. The set is not paid twice.
    expect(krillEarned(data, addDays(start, 7)) - seven).toBe(
      KRILL.done + KRILL.allDone + KRILL.goodWeek,
    )
  })

  pure('the season follows the real date, the other way round in the south', () => {
    expect(seasonOf(new Date(2026, 0, 15))).toBe('winter')
    expect(seasonOf(new Date(2026, 3, 15))).toBe('spring')
    expect(seasonOf(new Date(2026, 6, 15))).toBe('summer')
    expect(seasonOf(new Date(2026, 9, 15))).toBe('autumn')
    expect(seasonOf(new Date(2026, 0, 15), 'south')).toBe('summer')
  })

  pure(
    'the sky’s days: showers at night on their dates, the sea’s days, New Year, the anniversary',
    () => {
      expect(eventsAt(new Date(2026, 7, 12, 23, 0))).toContain('meteors')
      // The Perseids' night runs on past midnight, and is nothing by day.
      expect(eventsAt(new Date(2026, 7, 14, 2, 0))).toContain('meteors')
      expect(eventsAt(new Date(2026, 7, 12, 14, 0))).not.toContain('meteors')
      expect(eventsAt(new Date(2026, 11, 13, 22, 0))).toContain('meteors')
      expect(eventsAt(new Date(2026, 5, 8, 12, 0))).toContain('ocean-day')
      // World Whale Day: the third Sunday of February (15 February 2026).
      expect(eventsAt(new Date(2026, 1, 15, 12, 0))).toContain('whale-day')
      expect(eventsAt(new Date(2026, 1, 8, 12, 0))).not.toContain('whale-day')
      expect(eventsAt(new Date(2026, 11, 31, 23, 30))).toContain('new-year')
      expect(eventsAt(new Date(2027, 0, 1, 1, 0))).toContain('new-year')
      expect(eventsAt(new Date(2026, 5, 21, 12, 0))).toContain('solstice')
      expect(eventsAt(new Date(2026, 8, 22, 12, 0))).toContain('equinox')
      expect(eventsAt(new Date(2027, 2, 5, 12, 0), '2026-03-05')).toContain('anniversary')
      expect(eventsAt(new Date(2026, 2, 5, 12, 0), '2026-03-05')).not.toContain('anniversary')
      expect(yearsSince(new Date(2028, 2, 5), '2026-03-05')).toBe(2)
      expect(eventsAt(new Date(2026, 4, 12, 12, 0))).toEqual([])
    },
  )

  pure('an art slot is empty without a picture: the drawing stands', () => {
    expect(artFor('sea-a-fish')).toBeNull()
    const fish = COLLECTIBLES.find((c) => c.id === 'sea-a-fish')
    expect(fish && collectibleSvg(fish)).not.toContain('<image')
  })
})

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: middayToday() })
})

test('the first week: seven slots above the cards, one filled for each day', async ({ page }) => {
  await seedPerson(page, { days: 3, cracked: 3 })
  await page.goto('')
  const set = page.getByRole('img', { name: 'first week: 3 of 7' })
  await expect(set).toBeVisible()
  await expect(set.locator('.week-slot.is-filled')).toHaveCount(3)
  // The legendary's path waits until the week is done.
  await expect(page.locator('.next-legend')).toHaveCount(0)
})

test('the seventh day finishes the set: the whale sings, and the set is gone', async ({ page }) => {
  await seedPerson(page, { days: 6, cracked: 3 })
  await page.goto('')
  await page.getByRole('button', { name: 'run', exact: true }).click()
  await expect(page.locator('.line')).toHaveText('a first week. the whale sings.')
  await expect(page.locator('.first-week')).toHaveCount(0)
  await expect(page.locator('.next-legend')).toHaveText('7/30')
})

test('day 100 of whale club: a quiet celebration and a card of its own', async ({ page }) => {
  await seedPerson(page, { days: 99, cracked: 90 })
  await page.goto('')
  await page.getByRole('button', { name: 'run', exact: true }).click()
  await expect(page.locator('.line')).toHaveText('day 100. quietly, well done.')
  await expect(page.locator('.offer-slot').getByRole('button', { name: 'send this' })).toBeVisible({
    timeout: 15_000,
  })
})

test('the season dresses the shore', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 0, 15, 12, 0))
  await seedPerson(page, { days: 10, cracked: 7 })
  await page.goto('')
  await expect(page.locator('.scene')).toHaveAttribute('data-season', 'winter')
  await expect(page.locator('.season-winter')).toBeVisible()
  await expect(page.locator('.season-spring')).toBeHidden()
})
