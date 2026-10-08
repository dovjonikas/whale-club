import { test as pure } from '@playwright/test'
import { pathFinds, placedThings } from '../../src/app/sceneData'
import { LEGENDARIES, legendaryFor } from '../../src/scene/legendary'
import { EARNED_FROM, rarityOf } from '../../src/scene/rarity'
import { CHEST, placeAll } from '../../src/scene/spots'
import { layoutSky, sampleShape } from '../../src/scene/constellations'
import { addDays, writtenDate } from '../../src/store/dates'
import { starDays } from '../../src/store/derive'
import { halfwayStar, pathLength, placeStars, progressOf, reachesOf } from '../../src/store/paths'
import { emptyData, EVERY_DAY, type AppData } from '../../src/store/types'
import { LAB_DATA_KEY } from '../../src/store/lab'
import { dateKey, expect, middayToday, seedPerson, test } from './helpers'

/**
 * The path to a legendary: a star for each day something was done, paths
 * of 30, 60, then 100, a rare find half way and a legendary at the end,
 * rarity earned instead of drawn, and the ceremony.
 */

const START = '2026-01-05'

/** One thing done on `days` of the first `span` days (every day by default). */
function person(span: number, done: (i: number) => boolean = () => true): AppData {
  const data = emptyData()
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
      createdAt: START,
      order: 0,
    },
  ]
  for (let i = 0; i < span; i++)
    if (done(i)) data.days[addDays(START, i)] = { done: ['run'], minutes: {} }
  return data
}

pure.describe('the path, worked out', () => {
  pure.skip(({ isMobile }) => isMobile, 'pure data')

  pure('a star for each day something was done; a missed day takes nothing', () => {
    // Done every other day for 40 days: 20 stars, none taken away by the gaps.
    const data = person(40, (i) => i % 2 === 0)
    expect(starDays(data)).toHaveLength(20)
    expect(progressOf(20)).toEqual({ path: 0, length: 30, lit: 20 })
    // A rest day with nothing done has no star at all: it neither adds nor breaks.
    data.things = data.things.map((t) => ({
      ...t,
      days: [true, true, true, true, true, false, false],
    }))
    expect(starDays(data)).toHaveLength(20)
  })

  pure('paths of 30, then 60, then 100 for ever; half way at 15, 30 and 50', () => {
    expect([0, 1, 2, 3, 7].map(pathLength)).toEqual([30, 60, 100, 100, 100])
    expect([30, 60, 100].map(halfwayStar)).toEqual([15, 30, 50])
    expect(progressOf(29)).toEqual({ path: 0, length: 30, lit: 29 })
    expect(progressOf(30)).toEqual({ path: 1, length: 60, lit: 0 })
    expect(progressOf(90)).toEqual({ path: 2, length: 100, lit: 0 })
    expect(progressOf(290)).toEqual({ path: 4, length: 100, lit: 0 })
    // A steady person, four days in five for a year: about four legendaries.
    expect(progressOf(Math.round(365 * 0.8)).path).toBe(4)
  })

  pure('the halfway star brings a rare find, the last a legendary', () => {
    const dates = starDays(person(95))
    const reach = reachesOf(dates)
    expect(reach[0]).toEqual({ path: 0, half: dates[14], end: dates[29] })
    expect(reach[1]).toEqual({ path: 1, half: dates[59], end: dates[89] })
    expect(reach[2]).toEqual({ path: 2 })
    const found = pathFinds(person(95))
    expect(found.map((f) => [f.id, f.rarity])).toEqual([
      ['rare-scale', 'rare'],
      ['legend-whale', 'legendary'],
      ['rare-pearl', 'rare'],
      ['legend-turtle', 'legendary'],
    ])
    expect(placeStars(dates)[29]).toEqual({ date: dates[29], path: 0, star: 30 })
  })

  pure('rarity is earned now; a find reached before keeps the shine its date gave it', () => {
    // Before the change, the date picks the shine as it always did: some are rare.
    const before = Array.from({ length: 300 }, (_, i) =>
      rarityOf(`find-${String(i)}`, '2026-06-01'),
    )
    expect(before.some((r) => r !== 'common')).toBe(true)
    // From the change on, a per-thing find is common, whatever its date.
    const after = Array.from({ length: 300 }, (_, i) => rarityOf(`find-${String(i)}`, EARNED_FROM))
    expect(after.every((r) => r === 'common')).toBe(true)
  })

  pure('a legendary always gets a place, even in a full world', () => {
    const fish = Array.from({ length: 8 }, (_, i) => ({
      id: `fish-${String(i)}`,
      world: 'sea' as const,
    }))
    const where = placeAll(
      [...fish, { id: 'legend-whale', world: 'sea', first: true }],
      undefined,
      new Set(),
    )
    expect(where.get('legend-whale')).not.toBe(CHEST)
    // The newest ordinary thing gave up its place.
    expect(where.get('fish-7')).toBe(CHEST)
    // In the scene's own arrangement too.
    const data = person(30)
    expect(placedThings(data).find((t) => t.id === 'legend-whale')?.first).toBe(true)
  })

  pure('every constellation has exactly its stars, along its legendary', () => {
    for (const [i, legendary] of LEGENDARIES.entries()) {
      for (const length of [30, 60, 100]) {
        const stars = sampleShape(legendary.shape, length)
        expect(stars, legendary.id).toHaveLength(length)
        for (const s of stars) {
          expect(Number.isFinite(s.x) && Number.isFinite(s.y)).toBe(true)
          expect(s.x).toBeGreaterThanOrEqual(-1)
          expect(s.x).toBeLessThanOrEqual(101)
        }
      }
      expect(legendaryFor(i)).toBe(legendary)
    }
    expect(legendaryFor(LEGENDARIES.length)).toBe(LEGENDARIES[0])
  })

  pure('the sky: lit stars for the days, the rest of the path faint, finished paths whole', () => {
    const dates = starDays(person(40))
    const sky = layoutSky(dates, 400, 400)
    expect(sky.stars).toHaveLength(40)
    // The second path has 10 of its 60 lit: 50 faint stars ahead.
    expect(sky.ghosts).toHaveLength(50)
    expect(sky.stars.filter((s) => s.path === 0 && s.finished)).toHaveLength(30)
    expect(sky.stars.filter((s) => s.half)).toHaveLength(1)
    // With no stars yet, the first constellation is there already, faint: the goal from day one.
    expect(layoutSky([], 400, 400).ghosts).toHaveLength(30)
  })
})

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: middayToday() })
})

test('the goals in sight: the next find, and the legendary with its stars', async ({ page }) => {
  await seedPerson(page, { days: 12, cracked: 7 })
  await page.goto('')
  await expect(page.getByRole('button', { name: /^next find:/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'the golden whale: 12 of 30 stars' })).toBeVisible()
  await expect(page.locator('.next-legend')).toHaveText('12/30')
})

test('half way: a brighter star and a rare find', async ({ page }) => {
  await seedPerson(page, { days: 14, cracked: 14 })
  await page.goto('')
  await page.getByRole('button', { name: 'run', exact: true }).click()
  await expect(page.locator('.line')).toHaveText('half way. a golden scale.')
  await expect(page.locator('.collectible[data-id="rare-scale"]')).toBeAttached()
  await expect(page.locator('.collectible[data-id="rare-scale"]')).toHaveAttribute(
    'data-rarity',
    'rare',
  )
})

test('the thirtieth star: the ceremony, its plaque, and the legendary in the scene', async ({
  page,
}) => {
  await seedPerson(page, { days: 29, cracked: 21 })
  await page.goto('')
  await page.getByRole('button', { name: 'run', exact: true }).click()
  const ceremony = page.getByRole('dialog', { name: 'the golden whale' })
  await expect(ceremony).toBeVisible()
  // A tap anywhere goes straight to the end.
  await ceremony.click({ position: { x: 20, y: 20 } })
  await expect(ceremony.locator('.ceremony-date')).toHaveText(
    `earned on ${writtenDate(dateKey(0))} · day 30`,
  )
  await ceremony.getByRole('button', { name: 'ok' }).click()
  await expect(ceremony).toBeHidden()
  await expect(page.locator('.collectible[data-id="legend-whale"]')).toHaveAttribute(
    'data-rarity',
    'legendary',
  )
  await expect(page.locator('.collectible[data-id="legend-whale"] .legend-sparkle')).toHaveCount(3)
  // The Collection keeps it in its own row, with the day it was earned.
  await page.getByRole('button', { name: 'Collection' }).click()
  await expect(
    page.getByRole('listitem', {
      name: `the golden whale, earned on ${writtenDate(dateKey(0))} · day 30`,
    }),
  ).toBeVisible()
  await expect(page.getByRole('listitem', { name: 'the pearl turtle, 0/60' })).toBeVisible()
})

test('the legendary postcard has a gold frame', async ({ page }) => {
  await seedPerson(page, {
    days: 29,
    cracked: 21,
    extra: {
      settings: {
        sound: false,
        postcardFormat: 'story',
        installDismissedAt: dateKey(-1),
        lastRecapWeek: dateKey(-1),
        explained: ['yours', 'firstStar', 'stone', 'lantern', 'kept'],
      },
    },
  })
  await page.addInitScript(() => {
    const cards: string[] = []
    Object.assign(window, { __cards: cards })
    Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true })
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: (shared: { files: File[] }) =>
        new Promise<void>((done) => {
          const reader = new FileReader()
          reader.onload = () => {
            if (typeof reader.result === 'string') cards.push(reader.result)
            done()
          }
          const file = shared.files[0]
          if (file) reader.readAsDataURL(file)
        }),
    })
  })
  await page.goto('')
  await page.getByRole('button', { name: 'run', exact: true }).click()
  const ceremony = page.getByRole('dialog', { name: 'the golden whale' })
  await ceremony.click({ position: { x: 20, y: 20 } })
  await ceremony.locator('.ceremony-send').click()
  await page.waitForFunction(() => (window as unknown as { __cards: string[] }).__cards.length > 0)
  // The frame's edge, 22 px in from the side, is gold.
  const [r, g, b] = await page.evaluate(async () => {
    const url = (window as unknown as { __cards: string[] }).__cards[0] ?? ''
    const bitmap = await createImageBitmap(await (await fetch(url)).blob())
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
    const ctx = canvas.getContext('2d')
    if (!ctx) return [0, 0, 0]
    ctx.drawImage(bitmap, 0, 0)
    return [...ctx.getImageData(22, 400, 1, 1).data].slice(0, 3)
  })
  expect(r).toBeGreaterThan(200)
  expect(g).toBeGreaterThan(140)
  expect(b).toBeLessThan(180)
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the ceremony simply appears, whole', async ({ page }) => {
    await seedPerson(page, { days: 29, cracked: 21 })
    await page.goto('')
    await page.getByRole('button', { name: 'run', exact: true }).click()
    const ceremony = page.getByRole('dialog', { name: 'the golden whale' })
    await expect(ceremony.getByRole('button', { name: 'ok' })).toBeVisible()
    await expect(ceremony).toHaveClass(/is-plaque/)
  })
})

test('the day’s first done sends a star up from the card to its place', async ({ page }) => {
  await seedPerson(page, { days: 5, cracked: 3 })
  await page.goto('')
  const flights = await page.evaluate(() => {
    const seen: string[] = []
    new MutationObserver((records) => {
      for (const r of records)
        for (const n of r.addedNodes)
          if (n instanceof HTMLElement && n.classList.contains('star-flight')) seen.push('flight')
    }).observe(document.body, { childList: true, subtree: true })
    Object.assign(window, { __flights: seen })
    return seen.length
  })
  expect(flights).toBe(0)
  await page.getByRole('button', { name: 'run', exact: true }).click()
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { __flights: string[] }).__flights.length),
    )
    .toBe(1)
  await page.clock.runFor(2500)
  await expect(page.locator('.star-flight')).toHaveCount(0)
  await expect(page.locator(`.day-star[data-date="${dateKey(0)}"]`)).toBeAttached()
  // The second done of the day sends no other star.
  await page.getByRole('button', { name: 'read', exact: true }).click()
  await page.clock.runFor(500)
  expect(
    await page.evaluate(() => (window as unknown as { __flights: string[] }).__flights.length),
  ).toBe(1)
})

test('a year, readable: after the lab’s seed 365, no more than 40 things stand in the scene', async ({
  page,
}) => {
  test.setTimeout(90_000)
  await page.goto('?lab=1')
  await page
    .getByRole('dialog', { name: 'the lab' })
    .getByRole('button', { name: 'seed 365 days' })
    .click()
  await page.clock.runFor(4000)
  const things = await page.locator('.collectible[data-weather="false"], .stone').count()
  expect(things).toBeLessThanOrEqual(40)
  // The cove: only the last month's lanterns float on their own; the rest are one glow.
  const separate = Number(await page.locator('canvas.lanterns').getAttribute('data-separate'))
  const memory = Number(await page.locator('canvas.lanterns').getAttribute('data-memory'))
  expect(separate).toBeLessThanOrEqual(60)
  expect(memory).toBeGreaterThan(separate)
  // About four constellations finished: the lab's year is a steady one.
  const data = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? '{}') as AppData,
    LAB_DATA_KEY,
  )
  expect(progressOf(starDays(data).length).path).toBeGreaterThanOrEqual(3)
})
